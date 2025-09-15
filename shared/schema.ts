import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, json, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey(),
  titleKey: text("title_key").notNull(),
  descriptionKey: text("description_key").notNull(),
  order: integer("order").notNull(),
  isActive: boolean("is_active").default(true),
});

export const modules = pgTable("modules", {
  id: varchar("id").primaryKey(),
  courseId: varchar("course_id").notNull(),
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

export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  courseId: varchar("course_id"),
  targetDate: timestamp("target_date").notNull(),
  targetModulesPerWeek: integer("target_modules_per_week").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  courseId: varchar("course_id").notNull(),
  issuedAt: timestamp("issued_at").default(sql`now()`),
  serial: text("serial").notNull().unique(),
});

export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id").notNull(),
  titleKey: text("title_key").notNull(),
  descriptionKey: text("description_key").notNull(),
  order: integer("order").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
}, (table) => [
  index("IDX_quizzes_module_id").on(table.moduleId),
]);

export const quizQuestions = pgTable("quiz_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").notNull(),
  questionText: text("question_text").notNull(),
  answerOptions: json("answer_options").notNull(),
  correctAnswerIndex: integer("correct_answer_index").notNull(),
  questionType: varchar("question_type").notNull(), // 'multiple-choice' or 'true-false'
  order: integer("order").notNull(),
  points: integer("points").default(1),
}, (table) => [
  index("IDX_quiz_questions_quiz_id").on(table.quizId),
]);

export const quizAttempts = pgTable("quiz_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  quizId: varchar("quiz_id").notNull(),
  score: integer("score").notNull(),
  maxScore: integer("max_score").notNull(),
  answers: json("answers").notNull(), // Array of user's selected answer indices
  feedback: json("feedback").notNull(), // AI-powered feedback
  isCompleted: boolean("is_completed").default(true),
  timeSpent: integer("time_spent"), // Time spent in seconds
  createdAt: timestamp("created_at").default(sql`now()`),
}, (table) => [
  index("IDX_quiz_attempts_quiz_id").on(table.quizId),
  index("IDX_quiz_attempts_user_id").on(table.userId),
]);

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses);

export const insertModuleSchema = createInsertSchema(modules);

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

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  issuedAt: true,
  serial: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true,
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type PromptAttempt = typeof promptAttempts.$inferSelect;
export type InsertPromptAttempt = z.infer<typeof insertPromptAttemptSchema>;
export type ExerciseAttempt = typeof exerciseAttempts.$inferSelect;
export type InsertExerciseAttempt = z.infer<typeof insertExerciseAttemptSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;

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

export interface QuizFeedback {
  overall_score: number;
  percentage: number;
  correct_answers: number;
  total_questions: number;
  time_spent?: number;
  strengths: string[];
  improvements: string[];
  detailed_feedback: {
    question_index: number;
    is_correct: boolean;
    explanation: string;
  }[];
}

export interface QuizAnswerOption {
  text: string;
  is_correct?: boolean; // Optional, used only for admin/creation purposes
}

// Safe DTO for quiz questions that excludes sensitive data
export interface QuizQuestionDTO {
  id: string;
  quizId: string;
  questionText: string;
  answerOptions: QuizAnswerOption[];
  questionType: string;
  order: number;
}

// Validation schemas for API endpoints
export const assessPromptSchema = z.object({
  prompt: z.string().min(1, "Prompt is required and cannot be empty"),
  moduleId: z.string().min(1, "Module ID is required"),
  exerciseIndex: z.number().int().min(0, "Exercise index must be a non-negative integer")
});

export const submitQuizSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  answers: z.array(z.number().int().min(0, "Answer index must be a non-negative integer").max(9, "Answer index must be less than 10 (reasonable upper bound)")).min(1, "At least one answer is required").max(100, "Maximum of 100 answers allowed"),
  timeSpent: z.number().int().min(0, "Time spent must be non-negative").max(86400, "Time spent cannot exceed 24 hours").optional()
}).refine((data) => {
  // Ensure no duplicate or invalid answer indices within reasonable bounds
  const validAnswers = data.answers.filter(answer => answer >= 0 && answer <= 9);
  return validAnswers.length === data.answers.length;
}, {
  message: "All answer indices must be within valid bounds (0-9)",
  path: ["answers"]
});

export const createQuizQuestionSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  questionText: z.string().min(1, "Question text is required"),
  answerOptions: z.array(z.object({
    text: z.string().min(1, "Answer option text is required")
  })).min(2, "At least 2 answer options are required").max(10, "Maximum of 10 answer options allowed"),
  correctAnswerIndex: z.number().int().min(0, "Correct answer index must be non-negative"),
  questionType: z.enum(["multiple-choice", "true-false"]),
  order: z.number().int().min(0, "Order must be non-negative"),
  points: z.number().int().min(1, "Points must be at least 1").default(1)
}).refine((data) => {
  return data.correctAnswerIndex < data.answerOptions.length;
}, {
  message: "Correct answer index must be within the bounds of answer options",
  path: ["correctAnswerIndex"]
}).refine((data) => {
  // Enforce that true-false questions have exactly 2 options
  if (data.questionType === "true-false") {
    return data.answerOptions.length === 2;
  }
  return true;
}, {
  message: "True-false questions must have exactly 2 answer options",
  path: ["answerOptions"]
});

export type AssessPromptRequest = z.infer<typeof assessPromptSchema>;
export type SubmitQuizRequest = z.infer<typeof submitQuizSchema>;
export type CreateQuizQuestionRequest = z.infer<typeof createQuizQuestionSchema>;
