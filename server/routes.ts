import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { assessPrompt, generatePromptSuggestions } from "./services/openai";
import { insertPromptAttemptSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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
      const { prompt, moduleId } = req.body;
      
      if (!prompt || !moduleId) {
        return res.status(400).json({ message: "Prompt and moduleId are required" });
      }

      // Assess the prompt using OpenAI
      const feedback = await assessPrompt(prompt, moduleId);
      
      // Save the attempt
      const userId = req.session?.userId || "anonymous";
      await storage.savePromptAttempt({
        userId,
        moduleId,
        prompt,
        score: feedback.overall_score,
        feedback
      });

      // Update user progress
      const currentProgress = await storage.getUserModuleProgress(userId, moduleId);
      const newAttempts = (currentProgress?.attempts || 0) + 1;
      const bestScore = Math.max(currentProgress?.score || 0, feedback.overall_score);
      const isCompleted = bestScore >= 80;

      await storage.updateUserProgress(userId, moduleId, {
        score: bestScore,
        isCompleted,
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

  const httpServer = createServer(app);
  return httpServer;
}
