// Re-export Prisma types for components
import { Prisma } from "@prisma/client";

// Export all Prisma generated types
export type User = Prisma.UserGetPayload<Record<string, never>>;
export type Session = Prisma.SessionGetPayload<Record<string, never>>;
export type Account = Prisma.AccountGetPayload<Record<string, never>>;
export type Verification = Prisma.VerificationGetPayload<Record<string, never>>;
export type UserProgress = Prisma.UserProgressGetPayload<Record<string, never>>;
export type PromptAttempt = Prisma.PromptAttemptGetPayload<Record<string, never>>;
export type ExerciseAttempt = Prisma.ExerciseAttemptGetPayload<Record<string, never>>;
export type Goal = Prisma.GoalGetPayload<Record<string, never>>;
export type Certificate = Prisma.CertificateGetPayload<Record<string, never>>;
export type QuizAttempt = Prisma.QuizAttemptGetPayload<Record<string, never>>;
export type PlaygroundPrompt = Prisma.PlaygroundPromptGetPayload<Record<string, never>>;
export type PlaygroundTest = Prisma.PlaygroundTestGetPayload<Record<string, never>>;
export type PlaygroundUsage = Prisma.PlaygroundUsageGetPayload<Record<string, never>>;
export type UserSubscription = Prisma.UserSubscriptionGetPayload<Record<string, never>>;
export type DailyUsage = Prisma.DailyUsageGetPayload<Record<string, never>>;

// Additional type definitions that don't come from Prisma
export interface Quiz {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  passingScore: number; // percentage
  order: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
  points: number;
}

export interface AssessmentFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  overallFeedback: string;
}

export interface CourseRecommendation {
  courseId: string;
  reason: string;
  score: number;
}
