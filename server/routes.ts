import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { assessPrompt, generatePromptSuggestions, assessQuizAnswers } from "./services/openai";
import { runMultiModelTest, getAvailableModels } from "./services/openrouter";
import { RecommendationService } from "./services/recommendations";
import { exportToJSON, exportToCSV, exportToText, exportToClipboard } from "./utils/exportUtils";
import { insertPromptAttemptSchema, assessPromptSchema, insertGoalSchema, insertCertificateSchema, submitQuizSchema, runPlaygroundTestSchema, savePlaygroundPromptSchema, updatePlaygroundPromptSchema, ratePlaygroundResultSchema, exportPlaygroundResultsSchema } from "@shared/schema";
import { z } from "zod";
import { MODULE_CONTENT } from "../client/src/lib/constants";
import { setupAuth, isAuthenticated } from "./replitAuth";

// ===== PLAYGROUND USAGE LIMITS =====
const USAGE_LIMITS = {
  DAILY_TEST_LIMIT: 50,
  MONTHLY_TEST_LIMIT: 200,
  MONTHLY_COST_CEILING: 10.00, // $10.00 USD
  ESTIMATED_COST_PER_TEST: 0.05 // Conservative estimate for planning
} as const;

// Usage validation helper function
async function checkUserLimits(userId: string, estimatedCost?: number): Promise<{ canProceed: boolean; error?: { status: number; message: string; details?: any }; details?: any }> {
  try {
    const usage = await storage.getPlaygroundUsage(userId);
    
    // If no usage record exists, user is within limits
    if (!usage) {
      return { canProceed: true };
    }

    const now = new Date();
    
    // Check if we need to reset daily counters (if it's a new day)
    const lastActiveDate = usage.lastActive ? new Date(usage.lastActive) : new Date();
    const isNewDay = now.toDateString() !== lastActiveDate.toDateString();
    
    // Calculate daily usage (reset if new day)
    const dailyTests = isNewDay ? 0 : (usage.testsRun || 0);
    
    // Check if we need to reset monthly stats
    const monthsDiff = (now.getFullYear() - (usage.monthlyReset?.getFullYear() || now.getFullYear())) * 12 + 
                      (now.getMonth() - (usage.monthlyReset?.getMonth() || now.getMonth()));
    
    const monthlyTests = monthsDiff >= 1 ? 0 : (usage.monthlyTests || 0);
    const monthlySpent = monthsDiff >= 1 ? 0 : parseFloat(usage.totalCost || "0");
    
    // Check daily test limit
    if (dailyTests >= USAGE_LIMITS.DAILY_TEST_LIMIT) {
      return {
        canProceed: false,
        error: {
          status: 429,
          message: `Daily test limit exceeded. You've used ${dailyTests}/${USAGE_LIMITS.DAILY_TEST_LIMIT} tests today.`,
          details: {
            limitType: "daily_tests",
            currentUsage: dailyTests,
            limit: USAGE_LIMITS.DAILY_TEST_LIMIT,
            resetTime: "midnight UTC",
            suggestion: "Please try again tomorrow."
          }
        }
      };
    }

    // Check monthly test limit
    if (monthlyTests >= USAGE_LIMITS.MONTHLY_TEST_LIMIT) {
      return {
        canProceed: false,
        error: {
          status: 429,
          message: `Monthly test limit exceeded. You've used ${monthlyTests}/${USAGE_LIMITS.MONTHLY_TEST_LIMIT} tests this month.`,
          details: {
            limitType: "monthly_tests",
            currentUsage: monthlyTests,
            limit: USAGE_LIMITS.MONTHLY_TEST_LIMIT,
            resetTime: "first day of next month",
            suggestion: "Please wait until next month or consider upgrading your plan."
          }
        }
      };
    }

    // Check monthly cost ceiling
    const projectedCost = monthlySpent + (estimatedCost || USAGE_LIMITS.ESTIMATED_COST_PER_TEST);
    if (projectedCost > USAGE_LIMITS.MONTHLY_COST_CEILING) {
      return {
        canProceed: false,
        error: {
          status: 402,
          message: `Monthly cost limit would be exceeded. Current spending: $${monthlySpent.toFixed(2)}, estimated test cost: $${(estimatedCost || USAGE_LIMITS.ESTIMATED_COST_PER_TEST).toFixed(2)}, limit: $${USAGE_LIMITS.MONTHLY_COST_CEILING.toFixed(2)}.`,
          details: {
            limitType: "monthly_cost",
            currentSpending: parseFloat(monthlySpent.toFixed(2)),
            estimatedCost: parseFloat((estimatedCost || USAGE_LIMITS.ESTIMATED_COST_PER_TEST).toFixed(2)),
            projectedTotal: parseFloat(projectedCost.toFixed(2)),
            limit: USAGE_LIMITS.MONTHLY_COST_CEILING,
            remaining: parseFloat((USAGE_LIMITS.MONTHLY_COST_CEILING - monthlySpent).toFixed(2)),
            suggestion: "Please wait until next month or consider upgrading your plan."
          }
        }
      };
    }

    // User is within all limits
    return { 
      canProceed: true,
      details: {
        dailyTests: dailyTests + 1,
        dailyLimit: USAGE_LIMITS.DAILY_TEST_LIMIT,
        monthlyTests: monthlyTests + 1,
        monthlyTestLimit: USAGE_LIMITS.MONTHLY_TEST_LIMIT,
        monthlySpent: parseFloat(monthlySpent.toFixed(2)),
        monthlyCostLimit: USAGE_LIMITS.MONTHLY_COST_CEILING
      }
    };
  } catch (error) {
    console.error("Error checking user limits:", error);
    return {
      canProceed: false,
      error: {
        status: 500,
        message: "Unable to verify usage limits at this time. Please try again later."
      }
    };
  }
}

// Helper function to check course completion and generate certificates
async function checkAndGenerateCertificate(userId: string, moduleId: string) {
  try {
    // Get the module to find its course
    const module = await storage.getModule(moduleId);
    if (!module) return { certificateGenerated: false, moduleCompleted: false, courseCompleted: false };

    const courseId = module.courseId;
    
    // Check if certificate already exists for this user and course
    const existingCertificates = await storage.getUserCertificates(userId);
    if (existingCertificates.some(cert => cert.courseId === courseId)) {
      return { certificateGenerated: false, moduleCompleted: true, courseCompleted: true }; // Certificate already exists
    }
    
    // Check if course is complete
    const isCourseComplete = await storage.isCourseComplete(userId, courseId);
    if (isCourseComplete) {
      // Generate certificate
      console.log(`Generating certificate for user ${userId} for course ${courseId}`);
      await storage.issueCertificate(userId, courseId);
      console.log(`Certificate generated successfully for user ${userId} for course ${courseId}`);
      return { certificateGenerated: true, moduleCompleted: true, courseCompleted: true };
    }
    
    // Check if this specific module is completed (for module completion toast)
    const isModuleComplete = await storage.isModuleComplete(userId, moduleId);
    return { certificateGenerated: false, moduleCompleted: isModuleComplete, courseCompleted: false };
  } catch (error) {
    console.error("Error in certificate generation:", error);
    return { certificateGenerated: false, moduleCompleted: false, courseCompleted: false };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Initialize recommendation service
  const recommendationService = new RecommendationService(storage);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile
  app.get('/api/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Public routes - Courses and modules
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Transform the course to include displayable title and description
      // For now, use the titleKey as the title since we don't have translation implementation
      const transformedCourse = {
        ...course,
        title: course.titleKey || course.id,
        description: course.descriptionKey || "No description available"
      };
      
      res.json(transformedCourse);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.get("/api/courses/:id/modules", async (req, res) => {
    try {
      const modules = await storage.getModulesByCourse(req.params.id);
      res.json(modules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course modules" });
    }
  });

  // Get all modules (public for now, but could be made protected)
  app.get("/api/modules", async (req, res) => {
    try {
      const modules = await storage.getModules();
      res.json(modules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });

  // Get specific module
  app.get("/api/modules/:id", async (req, res) => {
    try {
      const module = await storage.getModule(req.params.id);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.json(module);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch module" });
    }
  });

  // Protected progress routes
  app.get("/api/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Get user progress for specific module
  app.get("/api/progress/:moduleId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserModuleProgress(userId, req.params.moduleId);
      res.json(progress || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch module progress" });
    }
  });

  // Update user progress
  app.post("/api/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { moduleId, score, isCompleted, attempts } = req.body;
      
      if (!moduleId) {
        return res.status(400).json({ message: "Module ID is required" });
      }
      
      // Verify module exists
      const module = await storage.getModule(moduleId);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      
      const progress = await storage.updateUserProgress(userId, moduleId, {
        score,
        isCompleted,
        attempts
      });
      
      // Check for course completion and generate certificate if module was completed
      if (isCompleted) {
        await checkAndGenerateCertificate(userId, moduleId);
      }
      
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Assess a prompt (protected)
  app.post("/api/assess", isAuthenticated, async (req: any, res) => {
    try {
      // Validate request body using Zod schema
      const validationResult = assessPromptSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.errors 
        });
      }

      const { prompt, moduleId, exerciseIndex } = validationResult.data;

      // Validate exerciseIndex is within valid range for the module
      const moduleContent = MODULE_CONTENT[moduleId as keyof typeof MODULE_CONTENT];
      if (!moduleContent) {
        return res.status(400).json({ message: "Invalid moduleId" });
      }
      const exerciseCount = moduleContent.exercises.length;
      if (exerciseIndex < 0 || exerciseIndex >= exerciseCount) {
        return res.status(400).json({ message: `Invalid exerciseIndex. Must be between 0 and ${exerciseCount - 1}` });
      }

      // Assess the prompt using OpenAI
      const feedback = await assessPrompt(prompt, moduleId);
      
      const userId = req.user.claims.sub;
      const isExerciseCompleted = feedback.overall_score >= 80;
      
      // Save the exercise attempt
      await storage.saveExerciseAttempt({
        userId,
        moduleId,
        exerciseIndex,
        prompt,
        score: feedback.overall_score,
        feedback,
        isCompleted: isExerciseCompleted
      });

      // Also save legacy prompt attempt for backward compatibility
      await storage.savePromptAttempt({
        userId,
        moduleId,
        prompt,
        score: feedback.overall_score,
        feedback
      });

      // Update module progress based on all exercise completions
      const completedExercises = await storage.getCompletedExercises(userId, moduleId);
      const allExercisesCompleted = completedExercises.size >= exerciseCount;
      const bestScores = await storage.getBestExerciseScores(userId, moduleId);
      const averageScore = bestScores.size > 0 ? 
        Array.from(bestScores.values()).reduce((sum, score) => sum + score, 0) / bestScores.size : 0;

      const currentProgress = await storage.getUserModuleProgress(userId, moduleId);
      const newAttempts = (currentProgress?.attempts || 0) + 1;

      await storage.updateUserProgress(userId, moduleId, {
        score: Math.round(averageScore),
        isCompleted: allExercisesCompleted,
        attempts: newAttempts
      });

      // Check for course completion and generate certificate if needed
      if (allExercisesCompleted) {
        await checkAndGenerateCertificate(userId, moduleId);
      }

      res.json(feedback);
    } catch (error) {
      console.error("Assessment error:", error);
      res.status(500).json({ message: "Failed to assess prompt: " + (error as Error).message });
    }
  });

  // Generate improved prompt suggestions (protected)
  app.post("/api/improve-prompt", isAuthenticated, async (req, res) => {
    try {
      const { prompt, feedback } = req.body;
      
      if (!prompt || !feedback) {
        return res.status(400).json({ message: "Prompt and feedback are required" });
      }

      const suggestion = await generatePromptSuggestions(prompt, feedback);
      res.json({ suggestion });
    } catch (error) {
      console.error("Suggestion error:", error);
      res.status(500).json({ message: "Failed to generate suggestions: " + (error as Error).message });
    }
  });

  // Protected user attempt routes
  app.get("/api/attempts/:moduleId?", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const attempts = await storage.getUserAttempts(userId, req.params.moduleId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attempts" });
    }
  });

  // Get exercise attempts for a module
  app.get("/api/exercises/:moduleId/attempts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const attempts = await storage.getUserExerciseAttempts(userId, req.params.moduleId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise attempts" });
    }
  });

  // Get best exercise scores for a module
  app.get("/api/exercises/:moduleId/scores", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bestScores = await storage.getBestExerciseScores(userId, req.params.moduleId);
      // Convert Map to object for JSON serialization
      const scoresObject = Object.fromEntries(bestScores);
      res.json(scoresObject);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise scores" });
    }
  });

  // Get completed exercises for a module
  app.get("/api/exercises/:moduleId/completed", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const completedExercises = await storage.getCompletedExercises(userId, req.params.moduleId);
      // Convert Set to array for JSON serialization
      const completedArray = Array.from(completedExercises);
      res.json(completedArray);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch completed exercises" });
    }
  });

  // Goal management routes
  app.get("/api/goals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goals = await storage.getUserGoals(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body
      const validationResult = insertGoalSchema.safeParse({
        ...req.body,
        userId
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid goal data", 
          errors: validationResult.error.errors 
        });
      }
      
      // Verify course exists if courseId is provided
      if (validationResult.data.courseId) {
        const course = await storage.getCourse(validationResult.data.courseId);
        if (!course) {
          return res.status(404).json({ message: "Course not found" });
        }
      }
      
      const goal = await storage.createGoal(validationResult.data);
      res.status(201).json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  app.put("/api/goals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalId = req.params.id;
      
      // Verify goal ownership
      const existingGoal = await storage.getUserGoals(userId);
      const userOwnsGoal = existingGoal.some(goal => goal.id === goalId);
      
      if (!userOwnsGoal) {
        return res.status(404).json({ message: "Goal not found or not owned by user" });
      }
      
      const updatedGoal = await storage.updateGoal(goalId, req.body);
      if (!updatedGoal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.json(updatedGoal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalId = req.params.id;
      
      // Verify goal ownership
      const existingGoals = await storage.getUserGoals(userId);
      const userOwnsGoal = existingGoals.some(goal => goal.id === goalId);
      
      if (!userOwnsGoal) {
        return res.status(404).json({ message: "Goal not found or not owned by user" });
      }
      
      const deleted = await storage.deleteGoal(goalId);
      if (!deleted) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Personalized recommendations
  app.get("/api/recommendations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      console.log(`Generating recommendations for user: ${userId}`);
      
      const recommendationAnalysis = await recommendationService.generateRecommendations(userId);
      
      console.log(`Generated ${recommendationAnalysis.recommendations.length} recommendations for user ${userId}`);
      
      res.json(recommendationAnalysis);
    } catch (error) {
      console.error("Recommendation generation error:", error);
      res.status(500).json({ 
        message: "Failed to generate recommendations", 
        error: (error as Error).message 
      });
    }
  });

  // Certificate routes
  app.get("/api/certificates", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const certificates = await storage.getUserCertificates(userId);
      res.json(certificates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  app.post("/api/certificates/issue", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body using Zod schema
      const validationResult = insertCertificateSchema.extend({
        courseId: z.string().min(1, "Course ID is required")
      }).safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid certificate data", 
          errors: validationResult.error.errors 
        });
      }
      
      const { courseId } = validationResult.data;
      
      // Verify course exists and is active
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (!course.isActive) {
        return res.status(400).json({ message: "Cannot issue certificate for inactive course" });
      }
      
      // Check if course is completed
      const isCompleted = await storage.isCourseComplete(userId, courseId);
      if (!isCompleted) {
        return res.status(400).json({ message: "Course must be completed before issuing certificate" });
      }
      
      // Check if certificate already exists (return 409 Conflict for duplicates)
      const existingCertificates = await storage.getUserCertificates(userId);
      const alreadyIssued = existingCertificates.some(cert => cert.courseId === courseId);
      if (alreadyIssued) {
        return res.status(409).json({ message: "Certificate already issued for this course" });
      }
      
      const certificate = await storage.issueCertificate(userId, courseId);
      res.status(201).json(certificate);
    } catch (error) {
      console.error("Certificate issuance error:", error);
      res.status(500).json({ message: "Failed to issue certificate: " + (error as Error).message });
    }
  });

  app.get("/api/certificates/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const certificate = await storage.getCertificate(req.params.id);
      
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      
      // Ensure user owns the certificate
      if (certificate.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(certificate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch certificate" });
    }
  });

  // Public certificate verification endpoints (no authentication required)
  app.get("/api/verify/certificate/:serial", async (req, res) => {
    try {
      const serial = req.params.serial;
      
      if (!serial) {
        return res.status(400).json({ message: "Certificate serial is required" });
      }
      
      // Find certificate by serial number
      const certificate = await storage.getCertificateBySerial(serial);
      
      if (!certificate) {
        return res.status(404).json({ 
          valid: false, 
          message: "Certificate not found or invalid serial number" 
        });
      }
      
      // Get user info for the certificate
      const user = await storage.getUser(certificate.userId);
      const course = await storage.getCourse(certificate.courseId);
      
      res.json({
        valid: true,
        certificate: {
          id: certificate.id,
          serial: certificate.serial,
          issuedAt: certificate.issuedAt,
          courseName: course?.titleKey || course?.id || "Unknown Course",
          recipientName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : "Unknown User"
        }
      });
    } catch (error) {
      console.error("Certificate verification error:", error);
      res.status(500).json({ 
        valid: false, 
        message: "Failed to verify certificate" 
      });
    }
  });

  // Public certificate view endpoint (for sharing certificates)
  app.get("/api/public/certificates/:id", async (req, res) => {
    try {
      const certificate = await storage.getCertificate(req.params.id);
      
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      
      // Get additional information for public display
      const user = await storage.getUser(certificate.userId);
      const course = await storage.getCourse(certificate.courseId);
      
      // Return public certificate information
      res.json({
        certificate: {
          id: certificate.id,
          serial: certificate.serial,
          issuedAt: certificate.issuedAt,
          courseId: certificate.courseId
        },
        user: {
          firstName: user?.firstName || null,
          lastName: user?.lastName || null,
          email: user?.email || null
        },
        course: {
          titleKey: course?.titleKey || null,
          descriptionKey: course?.descriptionKey || null,
          title: course?.titleKey || "Unknown Course"
        }
      });
    } catch (error) {
      console.error("Public certificate fetch error:", error);
      res.status(500).json({ message: "Failed to fetch certificate" });
    }
  });

  // Quiz routes
  // Get single quiz by ID (public route)
  app.get("/api/quiz/:quizId", async (req, res) => {
    try {
      const quizId = req.params.quizId;
      
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      res.json(quiz);
    } catch (error) {
      console.error("Failed to fetch quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  // Get quizzes for a module (public route)
  app.get("/api/quizzes/:moduleId", async (req, res) => {
    try {
      const moduleId = req.params.moduleId;
      
      // Verify module exists
      const module = await storage.getModule(moduleId);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      
      const quizzes = await storage.getQuizzesByModule(moduleId);
      res.json(quizzes);
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  // Get quiz questions (public route)
  app.get("/api/quiz-questions/:quizId", async (req, res) => {
    try {
      const quizId = req.params.quizId;
      
      // Verify quiz exists
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      const questions = await storage.getQuizQuestions(quizId);
      
      // SECURITY FIX: Sanitize questions to exclude correctAnswerIndex and points
      const sanitizedQuestions = questions.map(question => ({
        id: question.id,
        quizId: question.quizId,
        questionText: question.questionText,
        answerOptions: question.answerOptions,
        questionType: question.questionType,
        order: question.order
      }));
      
      res.json(sanitizedQuestions);
    } catch (error) {
      console.error("Failed to fetch quiz questions:", error);
      res.status(500).json({ message: "Failed to fetch quiz questions" });
    }
  });

  // Submit quiz attempt (protected route)
  app.post("/api/quiz-attempts", isAuthenticated, async (req: any, res) => {
    try {
      // Validate request body using Zod schema
      const validationResult = submitQuizSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.errors 
        });
      }

      const { quizId, answers, timeSpent } = validationResult.data;
      const userId = req.user.claims.sub;

      // Verify quiz exists
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Get quiz questions
      const questions = await storage.getQuizQuestions(quizId);
      if (questions.length === 0) {
        return res.status(400).json({ message: "Quiz has no questions" });
      }

      // Validate that we have the right number of answers
      if (answers.length !== questions.length) {
        return res.status(400).json({ 
          message: `Expected ${questions.length} answers, received ${answers.length}` 
        });
      }

      // VALIDATION FIX: Check each answer index is within bounds for each question
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const answerIndex = answers[i];
        const optionsLength = Array.isArray(question.answerOptions) ? question.answerOptions.length : 0;
        
        if (answerIndex < 0 || answerIndex >= optionsLength) {
          return res.status(400).json({ 
            message: `Answer index ${answerIndex} for question ${i + 1} is out of bounds. Must be between 0 and ${optionsLength - 1}` 
          });
        }
      }

      // Calculate basic score and feedback using AI
      const feedback = await assessQuizAnswers(questions, answers, timeSpent);
      
      // Calculate max possible score
      const maxScore = questions.reduce((sum, question) => sum + (question.points || 1), 0);

      // Save quiz attempt
      const attempt = await storage.saveQuizAttempt({
        userId,
        quizId,
        score: feedback.overallScore,
        maxScore,
        answers,
        feedback,
        isCompleted: true,
        timeSpent
      });

      // Check if quiz completion affects module progress
      const moduleId = quiz.moduleId;
      const isModuleComplete = await storage.isModuleComplete(userId, moduleId);
      
      let certificateStatus = { certificateGenerated: false, moduleCompleted: false, courseCompleted: false };
      
      // Update module progress if module is now complete
      if (isModuleComplete) {
        const currentProgress = await storage.getUserModuleProgress(userId, moduleId);
        const newScore = Math.max(currentProgress?.score || 0, 100); // Set to 100 if module complete
        
        await storage.updateUserProgress(userId, moduleId, {
          score: newScore,
          isCompleted: true,
          attempts: (currentProgress?.attempts || 0) + 1
        });

        // Check for certificate generation
        certificateStatus = await checkAndGenerateCertificate(userId, moduleId);
      }

      res.json({
        attempt,
        feedback,
        certificateStatus
      });
    } catch (error) {
      console.error("Quiz submission error:", error);
      res.status(500).json({ message: "Failed to submit quiz: " + (error as Error).message });
    }
  });

  // Get quiz attempts count for current user (protected route)
  app.get("/api/quiz-attempts/count/:quizId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const quizId = req.params.quizId;
      
      // Verify quiz exists
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      const attempts = await storage.getUserQuizAttempts(userId, quizId);
      res.json({ count: attempts.length });
    } catch (error) {
      console.error("Failed to fetch quiz attempts count:", error);
      res.status(500).json({ message: "Failed to fetch quiz attempts count" });
    }
  });

  // Get user's quiz attempts (protected route)
  app.get("/api/quiz-attempts/:userId/:quizId", isAuthenticated, async (req: any, res) => {
    try {
      const { userId: requestedUserId, quizId } = req.params;
      const currentUserId = req.user.claims.sub;

      // Users can only access their own attempts unless they are an admin
      if (requestedUserId !== currentUserId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Verify quiz exists
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      const attempts = await storage.getUserQuizAttempts(requestedUserId, quizId);
      res.json(attempts);
    } catch (error) {
      console.error("Failed to fetch quiz attempts:", error);
      res.status(500).json({ message: "Failed to fetch quiz attempts" });
    }
  });

  // ===== AI PLAYGROUND ROUTES =====
  
  // Get available models and pricing
  app.get("/api/playground/models", isAuthenticated, async (req: any, res) => {
    try {
      const models = await getAvailableModels();
      res.json(models);
    } catch (error) {
      console.error("Error fetching models:", error);
      res.status(500).json({ message: "Failed to fetch available models" });
    }
  });

  // Run multi-model prompt test
  app.post("/api/playground/tests/run", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body
      const validationResult = runPlaygroundTestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.errors 
        });
      }

      const { promptText, models, parameters, promptId } = validationResult.data;

      // ===== CRITICAL SECURITY CHECK: Validate user limits BEFORE expensive API calls =====
      const estimatedCost = models.length * USAGE_LIMITS.ESTIMATED_COST_PER_TEST;
      const limitsCheck = await checkUserLimits(userId, estimatedCost);
      
      if (!limitsCheck.canProceed) {
        console.log(`Playground test blocked for user ${userId}: ${limitsCheck.error?.message}`);
        return res.status(limitsCheck.error?.status || 429).json({
          message: limitsCheck.error?.message,
          ...limitsCheck.error?.details
        });
      }

      // User is within limits - proceed with the test
      console.log(`Playground test authorized for user ${userId}. Estimated cost: $${estimatedCost.toFixed(4)}`);

      // Run the multi-model test
      const testResult = await runMultiModelTest({
        promptText,
        models,
        parameters,
        promptId
      });

      // Save the test result to storage
      const savedTest = await storage.savePlaygroundTest({
        userId,
        promptId: promptId || null,
        promptText,
        models,
        parameters,
        results: testResult.results,
        totalCost: testResult.totalCost
      });

      // Update user usage
      await storage.upsertPlaygroundUsage(userId);

      res.json({
        testId: savedTest.id,
        results: testResult.results,
        totalCost: testResult.totalCost,
        summary: testResult.summary
      });
    } catch (error) {
      console.error("Error running playground test:", error);
      res.status(500).json({ message: "Failed to run playground test" });
    }
  });

  // Get user's test history
  app.get("/api/playground/tests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tests = await storage.getPlaygroundTests(userId);
      res.json(tests);
    } catch (error) {
      console.error("Error fetching playground tests:", error);
      res.status(500).json({ message: "Failed to fetch test history" });
    }
  });

  // Save a new prompt
  app.post("/api/playground/prompts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body
      const validationResult = savePlaygroundPromptSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.errors 
        });
      }

      const promptData = validationResult.data;
      
      // Handle versioning if parentId is provided
      let version = 1;
      if (promptData.parentId) {
        const existingPrompts = await storage.getPlaygroundPrompts(userId);
        const parentVersions = existingPrompts.filter(p => 
          p.parentId === promptData.parentId || p.id === promptData.parentId
        );
        version = Math.max(...parentVersions.map(p => p.version || 1)) + 1;
      }

      const savedPrompt = await storage.savePlaygroundPrompt({
        ...promptData,
        userId,
        version
      });

      res.status(201).json(savedPrompt);
    } catch (error) {
      console.error("Error saving playground prompt:", error);
      res.status(500).json({ message: "Failed to save prompt" });
    }
  });

  // Get user's saved prompts
  app.get("/api/playground/prompts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const prompts = await storage.getPlaygroundPrompts(userId);
      res.json(prompts);
    } catch (error) {
      console.error("Error fetching playground prompts:", error);
      res.status(500).json({ message: "Failed to fetch prompts" });
    }
  });

  // Update existing prompt
  app.put("/api/playground/prompts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const promptId = req.params.id;
      
      // Validate request body - use the basic save schema without parentId validation for updates
      const validationResult = savePlaygroundPromptSchema.omit({ parentId: true }).safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.errors 
        });
      }

      const updates = validationResult.data;
      const updatedPrompt = await storage.updatePlaygroundPrompt(userId, promptId, updates);
      
      if (!updatedPrompt) {
        return res.status(404).json({ message: "Prompt not found or access denied" });
      }

      res.json(updatedPrompt);
    } catch (error) {
      console.error("Error updating playground prompt:", error);
      res.status(500).json({ message: "Failed to update prompt" });
    }
  });

  // Delete prompt
  app.delete("/api/playground/prompts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const promptId = req.params.id;
      
      const deleted = await storage.deletePlaygroundPrompt(userId, promptId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Prompt not found or access denied" });
      }

      res.json({ message: "Prompt deleted successfully" });
    } catch (error) {
      console.error("Error deleting playground prompt:", error);
      res.status(500).json({ message: "Failed to delete prompt" });
    }
  });

  // Get user's usage analytics
  app.get("/api/playground/usage", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const usage = await storage.getPlaygroundUsage(userId);
      
      // Return default usage if none exists
      const defaultUsage = {
        testsRun: 0,
        totalCost: "0",
        monthlyTests: 0,
        lastActive: null,
        monthlyReset: new Date()
      };
      
      res.json(usage || defaultUsage);
    } catch (error) {
      console.error("Error fetching playground usage:", error);
      res.status(500).json({ message: "Failed to fetch usage analytics" });
    }
  });

  // Rate a model response
  app.post("/api/playground/tests/:testId/rate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const testId = req.params.testId;
      
      // Validate request body
      const validationResult = ratePlaygroundResultSchema.safeParse({
        testId,
        ...req.body
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid rating data", 
          errors: validationResult.error.errors 
        });
      }

      const { modelName, rating } = validationResult.data;

      // Update the test rating
      const success = await storage.updatePlaygroundTestRating(userId, testId, modelName, rating);
      
      if (!success) {
        return res.status(404).json({ message: "Test not found or access denied" });
      }

      res.json({ message: "Rating saved successfully", rating });
    } catch (error) {
      console.error("Error saving rating:", error);
      res.status(500).json({ message: "Failed to save rating" });
    }
  });

  // Get a specific test for export/viewing
  app.get("/api/playground/tests/:testId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const testId = req.params.testId;
      
      const test = await storage.getPlaygroundTest(userId, testId);
      
      if (!test) {
        return res.status(404).json({ message: "Test not found or access denied" });
      }

      res.json(test);
    } catch (error) {
      console.error("Error fetching test:", error);
      res.status(500).json({ message: "Failed to fetch test" });
    }
  });

  // Export test results in various formats
  app.post("/api/playground/tests/:testId/export", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const testId = req.params.testId;
      
      // Validate request body
      const validationResult = exportPlaygroundResultsSchema.safeParse({
        testId,
        ...req.body
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid export parameters", 
          errors: validationResult.error.errors 
        });
      }

      const { format, includeRatings, includeMetadata } = validationResult.data;

      // Get the test
      const test = await storage.getPlaygroundTest(userId, testId);
      
      if (!test) {
        return res.status(404).json({ message: "Test not found or access denied" });
      }

      let exportData: any;
      let contentType: string;
      let filename: string;

      switch (format) {
        case "json":
          exportData = exportToJSON(test);
          contentType = "application/json";
          filename = `playground-test-${testId}.json`;
          break;
        
        case "csv":
          exportData = exportToCSV(test);
          contentType = "text/csv";
          filename = `playground-test-${testId}.csv`;
          break;
        
        case "txt":
          exportData = exportToText(test);
          contentType = "text/plain";
          filename = `playground-test-${testId}.txt`;
          break;
        
        default:
          return res.status(400).json({ message: "Unsupported export format" });
      }

      // Set appropriate headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', contentType);
      
      if (format === "json") {
        res.json(exportData);
      } else {
        res.send(exportData);
      }
    } catch (error) {
      console.error("Error exporting test:", error);
      res.status(500).json({ message: "Failed to export test" });
    }
  });

  // Get clipboard-friendly formatted export
  app.get("/api/playground/tests/:testId/clipboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const testId = req.params.testId;
      
      const test = await storage.getPlaygroundTest(userId, testId);
      
      if (!test) {
        return res.status(404).json({ message: "Test not found or access denied" });
      }

      const clipboardData = exportToClipboard(test);
      res.json({ content: clipboardData });
    } catch (error) {
      console.error("Error generating clipboard content:", error);
      res.status(500).json({ message: "Failed to generate clipboard content" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}