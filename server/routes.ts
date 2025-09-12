import type { Express, Request } from "express";
import session from "express-session";
import { randomUUID } from "crypto";

// Extend Express Request type to include session
declare module "express-serve-static-core" {
  interface Request {
    session?: session.Session & Partial<session.SessionData> & {
      userId?: string;
    };
  }
}
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { assessPrompt, generatePromptSuggestions } from "./services/openai";
import { insertPromptAttemptSchema, assessPromptSchema } from "@shared/schema";
import { z } from "zod";
import { MODULE_CONTENT } from "../client/src/lib/constants";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware for user session management
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Middleware to ensure each session has a unique userId
  app.use((req, res, next) => {
    if (!req.session?.userId) {
      req.session!.userId = randomUUID();
    }
    next();
  });
  // Get all modules
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

  // Get user progress (using session-based user ID)
  app.get("/api/progress", async (req, res) => {
    try {
      const userId = req.session?.userId || "anonymous";
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Get user progress for specific module
  app.get("/api/progress/:moduleId", async (req, res) => {
    try {
      const userId = req.session?.userId || "anonymous";
      const progress = await storage.getUserModuleProgress(userId, req.params.moduleId);
      res.json(progress || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch module progress" });
    }
  });

  // Assess a prompt
  app.post("/api/assess", async (req, res) => {
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
      
      const userId = req.session?.userId || "anonymous";
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

      res.json(feedback);
    } catch (error) {
      console.error("Assessment error:", error);
      res.status(500).json({ message: "Failed to assess prompt: " + (error as Error).message });
    }
  });

  // Generate improved prompt suggestions
  app.post("/api/improve-prompt", async (req, res) => {
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

  // Get user's prompt attempts
  app.get("/api/attempts/:moduleId?", async (req, res) => {
    try {
      const userId = req.session?.userId || "anonymous";
      const attempts = await storage.getUserAttempts(userId, req.params.moduleId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attempts" });
    }
  });

  // Get exercise attempts for a module
  app.get("/api/exercises/:moduleId/attempts", async (req, res) => {
    try {
      const userId = req.session?.userId || "anonymous";
      const attempts = await storage.getUserExerciseAttempts(userId, req.params.moduleId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise attempts" });
    }
  });

  // Get best exercise scores for a module
  app.get("/api/exercises/:moduleId/scores", async (req, res) => {
    try {
      const userId = req.session?.userId || "anonymous";
      const bestScores = await storage.getBestExerciseScores(userId, req.params.moduleId);
      // Convert Map to object for JSON serialization
      const scoresObject = Object.fromEntries(bestScores);
      res.json(scoresObject);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise scores" });
    }
  });

  // Get completed exercises for a module
  app.get("/api/exercises/:moduleId/completed", async (req, res) => {
    try {
      const userId = req.session?.userId || "anonymous";
      const completedExercises = await storage.getCompletedExercises(userId, req.params.moduleId);
      // Convert Set to array for JSON serialization
      const completedArray = Array.from(completedExercises);
      res.json(completedArray);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch completed exercises" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
