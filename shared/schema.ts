import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, json, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const modules = pgTable("modules", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  order: integer("order").notNull(),
  content: json("content").notNull(),
  isActive: boolean("is_active").default(true),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  moduleId: varchar("module_id").notNull(),
  score: integer("score").default(0),
  isCompleted: boolean("is_completed").default(false),
  attempts: integer("attempts").default(0),
  lastAttempt: timestamp("last_attempt").default(sql`now()`),
});

export const promptAttempts = pgTable("prompt_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  moduleId: varchar("module_id").notNull(),
  prompt: text("prompt").notNull(),
  score: integer("score").notNull(),
  feedback: json("feedback").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const exerciseAttempts = pgTable("exercise_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  moduleId: varchar("module_id").notNull(),
  exerciseIndex: integer("exercise_index").notNull(),
  prompt: text("prompt").notNull(),
  score: integer("score").notNull(),
  feedback: json("feedback").notNull(),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertModuleSchema = createInsertSchema(modules).omit({
  id: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  lastAttempt: true,
});

export const insertPromptAttemptSchema = createInsertSchema(promptAttempts).omit({
  id: true,
  createdAt: true,
});

export const insertExerciseAttemptSchema = createInsertSchema(exerciseAttempts).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type PromptAttempt = typeof promptAttempts.$inferSelect;
export type InsertPromptAttempt = z.infer<typeof insertPromptAttemptSchema>;
export type ExerciseAttempt = typeof exerciseAttempts.$inferSelect;
export type InsertExerciseAttempt = z.infer<typeof insertExerciseAttemptSchema>;

export interface AssessmentFeedback {
  overall_score: number;
  clarity_structure: number;
  context_completeness: number;
  specificity: number;
  actionability: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
}

export interface ModuleContent {
  sections: {
    title: string;
    content: string;
    examples?: string[];
  }[];
  exercises: {
    title: string;
    description: string;
    template?: string;
  }[];
}

// Validation schemas for API endpoints
export const assessPromptSchema = z.object({
  prompt: z.string().min(1, "Prompt is required and cannot be empty"),
  moduleId: z.string().min(1, "Module ID is required"),
  exerciseIndex: z.number().int().min(0, "Exercise index must be a non-negative integer")
});

export type AssessPromptRequest = z.infer<typeof assessPromptSchema>;
