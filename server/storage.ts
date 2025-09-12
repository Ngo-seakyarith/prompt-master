import { type User, type InsertUser, type Module, type UserProgress, type InsertUserProgress, type PromptAttempt, type InsertPromptAttempt, type ModuleContent } from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private modules: Map<string, Module>;
  private userProgress: Map<string, UserProgress>;
  private promptAttempts: Map<string, PromptAttempt>;

  constructor() {
    this.users = new Map();
    this.modules = new Map();
    this.userProgress = new Map();
    this.promptAttempts = new Map();
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
              content: "Prompt engineering is the practice of designing and refining input prompts to effectively communicate with AI models. It's the bridge between human intent and AI understanding.",
              examples: [
                "Simple: 'Write a blog post'",
                "Better: 'Write a 500-word blog post about sustainable living tips for busy professionals'"
              ]
            },
            {
              title: "Context vs No Context",
              content: "Context provides background information that helps AI understand the specific situation, audience, and requirements for your request.",
              examples: [
                "No context: 'Create a marketing plan'",
                "With context: 'Create a marketing plan for a new eco-friendly skincare brand targeting millennials with a budget of $50k'"
              ]
            }
          ],
          exercises: [
            {
              title: "Context Enhancement",
              description: "Take a basic prompt and add relevant context to improve its effectiveness",
              template: "Basic prompt: 'Write a product description'\n\nYour enhanced prompt with context:"
            }
          ]
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
          sections: [
            {
              title: "The RTCTC Framework",
              content: "Role, Task, Context, Template, Constraints - the five key components of well-structured prompts.",
            },
            {
              title: "Role Definition",
              content: "Clearly define the AI's role or persona to set appropriate expertise and tone.",
              examples: [
                "You are an expert marketing strategist...",
                "Act as a senior software engineer with 10 years of experience..."
              ]
            }
          ],
          exercises: [
            {
              title: "Structure Practice",
              description: "Create a prompt using all five RTCTC components",
              template: "Role: You are a...\nTask: Your task is to...\nContext: The situation is...\nTemplate: Format your response as...\nConstraints: You must..."
            }
          ]
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
          sections: [
            {
              title: "Chain-of-Thought Prompting",
              content: "Guide AI through step-by-step reasoning to improve accuracy and transparency.",
            },
            {
              title: "Few-Shot Learning",
              content: "Provide examples to teach AI the desired format and style.",
            }
          ],
          exercises: [
            {
              title: "Chain-of-Thought",
              description: "Create a prompt that guides the AI through logical reasoning steps",
            }
          ]
        }
      },
      {
        id: "prompt-refinement",
        title: "Prompt Refinement",
        description: "Learn iterative improvement techniques and testing strategies for optimal results.",
        icon: "fas fa-tools",
        order: 4,
        isActive: true,
        content: {
          sections: [
            {
              title: "Iterative Improvement",
              content: "Learn how to test, measure, and refine prompts for better results.",
            }
          ],
          exercises: [
            {
              title: "Refinement Practice",
              description: "Take a low-scoring prompt and improve it iteratively",
            }
          ]
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
          sections: [
            {
              title: "Business Applications",
              content: "Use prompt engineering for content marketing, strategic planning, and automation.",
            }
          ],
          exercises: [
            {
              title: "Business Strategy",
              description: "Create prompts for various business planning scenarios",
            }
          ]
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
      lastAttempt: new Date(),
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
}

export const storage = new MemStorage();
