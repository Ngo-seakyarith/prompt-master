import { type User, type InsertUser, type Module, type UserProgress, type InsertUserProgress, type PromptAttempt, type InsertPromptAttempt, type ExerciseAttempt, type InsertExerciseAttempt, type ModuleContent } from "@shared/schema";
import { randomUUID } from "crypto";
import { MODULE_CONTENT } from "../client/src/lib/constants";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Module methods
  getModules(): Promise<Module[]>;
  getModule(id: string): Promise<Module | undefined>;
  
  // User progress methods
  getUserProgress(userId: string): Promise<UserProgress[]>;
  getUserModuleProgress(userId: string, moduleId: string): Promise<UserProgress | undefined>;
  updateUserProgress(userId: string, moduleId: string, progress: Partial<InsertUserProgress>): Promise<UserProgress>;
  
  // Prompt attempts
  savePromptAttempt(attempt: InsertPromptAttempt): Promise<PromptAttempt>;
  getUserAttempts(userId: string, moduleId?: string): Promise<PromptAttempt[]>;
  
  // Exercise attempts
  saveExerciseAttempt(attempt: InsertExerciseAttempt): Promise<ExerciseAttempt>;
  getUserExerciseAttempts(userId: string, moduleId: string): Promise<ExerciseAttempt[]>;
  getBestExerciseScores(userId: string, moduleId: string): Promise<Map<number, number>>;
  getCompletedExercises(userId: string, moduleId: string): Promise<Set<number>>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private modules: Map<string, Module>;
  private userProgress: Map<string, UserProgress>;
  private promptAttempts: Map<string, PromptAttempt>;
  private exerciseAttempts: Map<string, ExerciseAttempt>;

  constructor() {
    this.users = new Map();
    this.modules = new Map();
    this.userProgress = new Map();
    this.promptAttempts = new Map();
    this.exerciseAttempts = new Map();
    this.initializeModules();
  }

  private initializeModules() {
    const modules: Module[] = [
      {
        id: "basic-prompting",
        title: "Basic Prompting",
        description: "Learn the fundamentals of prompting with and without context. Understand how context shapes AI responses.",
        icon: "fas fa-play",
        order: 1,
        isActive: true,
        content: {
          sections: [
            {
              title: "What is Prompt Engineering?",
              content: "Prompt engineering is the practice of designing and refining input prompts to effectively communicate with AI models. It's the bridge between human intent and AI understanding. A well-crafted prompt can mean the difference between generic, unhelpful responses and targeted, valuable outputs that meet your specific needs.",
              examples: [
                "Vague: 'Write a blog post' → Generic content about random topics",
                "Better: 'Write a 500-word blog post about sustainable living tips for busy professionals' → Targeted, valuable content",
                "Best: 'Write an engaging 500-word blog post about 5 practical sustainable living tips for busy professionals, including specific time-saving strategies and cost comparisons'"
              ]
            },
            {
              title: "The Power of Context",
              content: "Context provides background information that helps AI understand the specific situation, audience, and requirements for your request. Without context, AI models make assumptions that may not align with your goals. Context transforms generic responses into personalized, relevant solutions.",
              examples: [
                "No context: 'Create a marketing plan' → Generic marketing template",
                "With context: 'Create a marketing plan for a new eco-friendly skincare brand targeting millennials with a budget of $50k' → Specific, actionable plan",
                "Rich context: 'Create a 6-month digital marketing plan for EcoGlow, a new organic skincare startup targeting environmentally-conscious millennials (ages 25-35) in urban areas. Budget: $50k. Focus on Instagram and TikTok. Launch in 3 months.'"
              ]
            },
            {
              title: "Specificity Matters",
              content: "The more specific your prompt, the more useful the response. Specificity includes details about format, length, tone, audience, and desired outcomes. Think of prompts as instructions to a highly capable assistant who needs clear direction.",
              examples: [
                "General: 'Help me with my presentation' → Vague advice",
                "Specific: 'Help me create an outline for a 20-minute presentation about renewable energy trends for a corporate executive audience' → Structured, targeted outline",
                "Very specific: 'Create a compelling slide-by-slide outline for a 20-minute presentation on renewable energy investment opportunities, targeting Fortune 500 executives, including 3 key statistics, 2 case studies, and actionable next steps'"
              ]
            },
            {
              title: "Common Prompt Mistakes",
              content: "Understanding what makes prompts ineffective helps you avoid common pitfalls. The most frequent mistakes include being too vague, not providing enough context, or expecting the AI to read your mind about unstated preferences.",
              examples: [
                "Mistake: 'Write something good' → No clear direction or criteria",
                "Better: 'Write a compelling product description' → Clear purpose but still vague",
                "Best: 'Write a compelling 150-word product description for a wireless fitness tracker targeting active millennials, emphasizing battery life and health insights'"
              ]
            }
          ],
          exercises: MODULE_CONTENT["basic-prompting"].exercises
        }
      },
      {
        id: "prompt-structure",
        title: "Prompt Structure",
        description: "Master the anatomy of effective prompts: role, task, context, template, and constraints.",
        icon: "fas fa-layer-group",
        order: 2,
        isActive: true,
        content: {
          sections: MODULE_CONTENT["prompt-structure"].sections,
          exercises: MODULE_CONTENT["prompt-structure"].exercises
        }
      },
      {
        id: "advanced-techniques",
        title: "Advanced Techniques",
        description: "Explore chain-of-thought, few-shot learning, and advanced prompting strategies.",
        icon: "fas fa-rocket",
        order: 3,
        isActive: true,
        content: {
          sections: MODULE_CONTENT["advanced-techniques"].sections,
          exercises: MODULE_CONTENT["advanced-techniques"].exercises
        }
      },
      {
        id: "prompt-refinement",
        title: "Prompt Refinement",
        description: "Master key prompt patterns: persona, question refinement, cognitive verifier, and audience persona.",
        icon: "fas fa-tools",
        order: 4,
        isActive: true,
        content: {
          sections: MODULE_CONTENT["prompt-refinement"].sections,
          exercises: MODULE_CONTENT["prompt-refinement"].exercises
        }
      },
      {
        id: "practical-applications",
        title: "Practical Applications",
        description: "Apply prompt engineering to productivity, automation, creativity, and business planning.",
        icon: "fas fa-briefcase",
        order: 5,
        isActive: true,
        content: {
          sections: MODULE_CONTENT["practical-applications"].sections,
          exercises: MODULE_CONTENT["practical-applications"].exercises
        }
      }
    ];

    modules.forEach(module => {
      this.modules.set(module.id, module);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getModules(): Promise<Module[]> {
    return Array.from(this.modules.values()).sort((a, b) => a.order - b.order);
  }

  async getModule(id: string): Promise<Module | undefined> {
    return this.modules.get(id);
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(progress => progress.userId === userId);
  }

  async getUserModuleProgress(userId: string, moduleId: string): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values()).find(
      progress => progress.userId === userId && progress.moduleId === moduleId
    );
  }

  async updateUserProgress(userId: string, moduleId: string, progressData: Partial<InsertUserProgress>): Promise<UserProgress> {
    const existingKey = `${userId}-${moduleId}`;
    const existing = Array.from(this.userProgress.entries()).find(
      ([_, progress]) => progress.userId === userId && progress.moduleId === moduleId
    );

    const id = existing ? existing[1].id : randomUUID();
    const progress: UserProgress = {
      id,
      userId,
      moduleId,
      score: 0,
      isCompleted: false,
      attempts: 0,
      ...existing?.[1],
      ...progressData,
      lastAttempt: new Date()
    };

    this.userProgress.set(id, progress);
    return progress;
  }

  async savePromptAttempt(attemptData: InsertPromptAttempt): Promise<PromptAttempt> {
    const id = randomUUID();
    const attempt: PromptAttempt = {
      ...attemptData,
      id,
      createdAt: new Date()
    };
    this.promptAttempts.set(id, attempt);
    return attempt;
  }

  async getUserAttempts(userId: string, moduleId?: string): Promise<PromptAttempt[]> {
    const attempts = Array.from(this.promptAttempts.values()).filter(attempt => attempt.userId === userId);
    return moduleId ? attempts.filter(attempt => attempt.moduleId === moduleId) : attempts;
  }

  async saveExerciseAttempt(attemptData: InsertExerciseAttempt): Promise<ExerciseAttempt> {
    const id = randomUUID();
    const attempt: ExerciseAttempt = {
      ...attemptData,
      id,
      isCompleted: attemptData.isCompleted ?? false,
      createdAt: new Date()
    };
    this.exerciseAttempts.set(id, attempt);
    return attempt;
  }

  async getUserExerciseAttempts(userId: string, moduleId: string): Promise<ExerciseAttempt[]> {
    return Array.from(this.exerciseAttempts.values())
      .filter(attempt => attempt.userId === userId && attempt.moduleId === moduleId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async getBestExerciseScores(userId: string, moduleId: string): Promise<Map<number, number>> {
    const attempts = await this.getUserExerciseAttempts(userId, moduleId);
    const bestScores = new Map<number, number>();
    
    for (const attempt of attempts) {
      const currentBest = bestScores.get(attempt.exerciseIndex) || 0;
      if (attempt.score > currentBest) {
        bestScores.set(attempt.exerciseIndex, attempt.score);
      }
    }
    
    return bestScores;
  }

  async getCompletedExercises(userId: string, moduleId: string): Promise<Set<number>> {
    const bestScores = await this.getBestExerciseScores(userId, moduleId);
    const completed = new Set<number>();
    
    Array.from(bestScores.entries()).forEach(([exerciseIndex, score]) => {
      if (score >= 80) {
        completed.add(exerciseIndex);
      }
    });
    
    return completed;
  }
}

export const storage = new MemStorage();
