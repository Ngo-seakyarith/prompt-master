import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { assessPrompt, generatePromptSuggestions } from "./services/openai";
import { insertPromptAttemptSchema, assessPromptSchema, insertGoalSchema, insertCertificateSchema } from "@shared/schema";
import { z } from "zod";
import { MODULE_CONTENT } from "../client/src/lib/constants";
import { setupAuth, isAuthenticated } from "./replitAuth";

// Helper function to check course completion and generate certificates
async function checkAndGenerateCertificate(userId: string, moduleId: string) {
  try {
    // Get the module to find its course
    const module = await storage.getModule(moduleId);
    if (!module) return;

    const courseId = module.courseId;
    
    // Check if certificate already exists for this user and course
    const existingCertificates = await storage.getUserCertificates(userId);
    if (existingCertificates.some(cert => cert.courseId === courseId)) {
      return; // Certificate already exists
    }
    
    // Check if course is complete
    const isCourseComplete = await storage.isCourseComplete(userId, courseId);
    if (isCourseComplete) {
      // Generate certificate
      console.log(`Generating certificate for user ${userId} for course ${courseId}`);
      await storage.issueCertificate(userId, courseId);
      console.log(`Certificate generated successfully for user ${userId} for course ${courseId}`);
    }
  } catch (error) {
    console.error("Error in certificate generation:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

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

  const httpServer = createServer(app);
  return httpServer;
}