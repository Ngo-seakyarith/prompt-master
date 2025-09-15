import { type User, type InsertUser, type UpsertUser, type Course, type InsertCourse, type Module, type UserProgress, type InsertUserProgress, type PromptAttempt, type InsertPromptAttempt, type ExerciseAttempt, type InsertExerciseAttempt, type Goal, type InsertGoal, type Certificate, type InsertCertificate, type ModuleContent, type Quiz, type InsertQuiz, type QuizQuestion, type InsertQuizQuestion, type QuizAttempt, type InsertQuizAttempt } from "@shared/schema";
import { randomUUID } from "crypto";
import { MODULE_CONTENT } from "../client/src/lib/constants";

export interface IStorage {
  // User methods (Required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  // Legacy methods (for backward compatibility)
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Course methods
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // Module methods
  getModules(): Promise<Module[]>;
  getModule(id: string): Promise<Module | undefined>;
  getModulesByCourse(courseId: string): Promise<Module[]>;
  updateModule(id: string, updates: Partial<Module>): Promise<Module | undefined>;
  
  // User progress methods
  getUserProgress(userId: string): Promise<UserProgress[]>;
  getUserModuleProgress(userId: string, moduleId: string): Promise<UserProgress | undefined>;
  updateUserProgress(userId: string, moduleId: string, progress: Partial<InsertUserProgress>): Promise<UserProgress>;
  
  // Goal methods
  getUserGoals(userId: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, updates: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<boolean>;
  
  // Certificate methods
  getUserCertificates(userId: string): Promise<Certificate[]>;
  getAllCertificates(): Promise<Certificate[]>;
  getCertificateBySerial(serial: string): Promise<Certificate | undefined>;
  issueCertificate(userId: string, courseId: string): Promise<Certificate>;
  getCertificate(id: string): Promise<Certificate | undefined>;
  
  // Progress helper methods
  getMaxCompletedModuleOrder(userId: string, courseId: string): Promise<number>;
  isCourseComplete(userId: string, courseId: string): Promise<boolean>;
  
  // Prompt attempts
  savePromptAttempt(attempt: InsertPromptAttempt): Promise<PromptAttempt>;
  getUserAttempts(userId: string, moduleId?: string): Promise<PromptAttempt[]>;
  
  // Exercise attempts
  saveExerciseAttempt(attempt: InsertExerciseAttempt): Promise<ExerciseAttempt>;
  getUserExerciseAttempts(userId: string, moduleId: string): Promise<ExerciseAttempt[]>;
  getBestExerciseScores(userId: string, moduleId: string): Promise<Map<number, number>>;
  getCompletedExercises(userId: string, moduleId: string): Promise<Set<number>>;
  
  // Quiz methods
  getQuizzesByModule(moduleId: string): Promise<Quiz[]>;
  getQuiz(id: string): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  
  // Quiz question methods
  getQuizQuestions(quizId: string): Promise<QuizQuestion[]>;
  getQuizQuestion(id: string): Promise<QuizQuestion | undefined>;
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  
  // Quiz attempt methods
  saveQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getUserQuizAttempts(userId: string, quizId?: string): Promise<QuizAttempt[]>;
  getQuizAttempt(id: string): Promise<QuizAttempt | undefined>;
  getBestQuizScore(userId: string, quizId: string): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private courses: Map<string, Course>;
  private modules: Map<string, Module>;
  private userProgress: Map<string, UserProgress>;
  private goals: Map<string, Goal>;
  private certificates: Map<string, Certificate>;
  private promptAttempts: Map<string, PromptAttempt>;
  private exerciseAttempts: Map<string, ExerciseAttempt>;
  private quizzes: Map<string, Quiz>;
  private quizQuestions: Map<string, QuizQuestion>;
  private quizAttempts: Map<string, QuizAttempt>;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.modules = new Map();
    this.userProgress = new Map();
    this.goals = new Map();
    this.certificates = new Map();
    this.promptAttempts = new Map();
    this.exerciseAttempts = new Map();
    this.quizzes = new Map();
    this.quizQuestions = new Map();
    this.quizAttempts = new Map();
    this.initializeCoursesAndModules();
  }

  private initializeCoursesAndModules() {
    // Initialize courses
    const courses: Course[] = [
      {
        id: "prompt-engineering-mastery",
        titleKey: "Prompt Engineering Mastery",
        descriptionKey: "Master the fundamentals of prompt engineering with hands-on practice and real-world applications.",
        order: 1,
        isActive: true
      },
      {
        id: "advanced-ai-communication",
        titleKey: "Advanced AI Communication",
        descriptionKey: "Learn sophisticated techniques for communicating with AI systems, including multi-step reasoning and context management.",
        order: 2,
        isActive: true
      },
      {
        id: "ai-automation-workflows",
        titleKey: "AI Automation & Workflows",
        descriptionKey: "Build automated workflows and systems using AI, from simple tasks to complex business processes.",
        order: 3,
        isActive: true
      }
    ];

    courses.forEach(course => {
      this.courses.set(course.id, course);
    });

    // Initialize modules
    const modules: Module[] = [
      // Course 1: Prompt Engineering Mastery modules
      {
        id: "basic-prompting",
        courseId: "prompt-engineering-mastery",
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
            }
          ],
          exercises: MODULE_CONTENT["basic-prompting"].exercises
        }
      },
      {
        id: "prompt-structure",
        courseId: "prompt-engineering-mastery",
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
        courseId: "prompt-engineering-mastery",
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
        courseId: "prompt-engineering-mastery",
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
        courseId: "prompt-engineering-mastery",
        title: "Practical Applications",
        description: "Apply prompt engineering to productivity, automation, creativity, and business planning.",
        icon: "fas fa-briefcase",
        order: 5,
        isActive: true,
        content: {
          sections: MODULE_CONTENT["practical-applications"].sections,
          exercises: MODULE_CONTENT["practical-applications"].exercises
        }
      },
      
      // Course 2: Advanced AI Communication modules
      {
        id: "context-management",
        courseId: "advanced-ai-communication",
        title: "Context Management",
        description: "Learn to manage long conversations and complex contexts effectively with AI systems.",
        icon: "fas fa-memory",
        order: 1,
        isActive: true,
        content: {
          sections: [
            {
              title: "Understanding Context Windows",
              content: "Context windows define how much information an AI can remember in a single conversation. Learn to maximize context usage and manage information effectively."
            },
            {
              title: "Context Chunking Strategies",
              content: "Break down complex information into manageable chunks that AI can process effectively while maintaining coherence."
            }
          ],
          exercises: [
            {
              title: "Long Document Analysis",
              description: "Practice breaking down a lengthy document into contextual chunks for AI analysis."
            }
          ]
        }
      },
      {
        id: "multi-step-reasoning",
        courseId: "advanced-ai-communication",
        title: "Multi-Step Reasoning",
        description: "Guide AI through complex, multi-step problem-solving processes.",
        icon: "fas fa-route",
        order: 2,
        isActive: true,
        content: {
          sections: [
            {
              title: "Chain of Thought Prompting",
              content: "Learn to structure prompts that guide AI through logical reasoning steps, improving accuracy and transparency."
            }
          ],
          exercises: [
            {
              title: "Mathematical Problem Solving",
              description: "Create prompts that guide AI through complex mathematical problem solving step by step."
            }
          ]
        }
      },
      {
        id: "persona-development",
        courseId: "advanced-ai-communication",
        title: "Advanced Persona Development",
        description: "Create sophisticated AI personas for specialized tasks and interactions.",
        icon: "fas fa-user-tie",
        order: 3,
        isActive: true,
        content: {
          sections: [
            {
              title: "Professional Personas",
              content: "Develop AI personas for specific professional roles, from consultants to creative writers."
            }
          ],
          exercises: [
            {
              title: "Expert Consultant Creation",
              description: "Design an AI persona that acts as a domain expert consultant in your field."
            }
          ]
        }
      },

      // Course 3: AI Automation & Workflows modules
      {
        id: "workflow-design",
        courseId: "ai-automation-workflows",
        title: "AI Workflow Design",
        description: "Design efficient workflows that leverage AI for business process automation.",
        icon: "fas fa-sitemap",
        order: 1,
        isActive: true,
        content: {
          sections: [
            {
              title: "Workflow Planning",
              content: "Learn to identify automation opportunities and design AI-powered workflows that integrate with existing business processes."
            }
          ],
          exercises: [
            {
              title: "Business Process Automation",
              description: "Design an AI workflow to automate a common business process in your organization."
            }
          ]
        }
      },
      {
        id: "api-integration",
        courseId: "ai-automation-workflows",
        title: "API Integration Patterns",
        description: "Connect AI systems with external APIs and services for comprehensive automation.",
        icon: "fas fa-plug",
        order: 2,
        isActive: true,
        content: {
          sections: [
            {
              title: "API Design for AI",
              content: "Understand how to structure API calls and responses that work effectively with AI systems."
            }
          ],
          exercises: [
            {
              title: "API Workflow Creation",
              description: "Create a workflow that combines AI processing with external API calls."
            }
          ]
        }
      },
      {
        id: "error-handling",
        courseId: "ai-automation-workflows",
        title: "Error Handling & Recovery",
        description: "Build robust AI systems that handle errors gracefully and recover from failures.",
        icon: "fas fa-shield-alt",
        order: 3,
        isActive: true,
        content: {
          sections: [
            {
              title: "Failure Modes",
              content: "Identify common failure patterns in AI workflows and design recovery strategies."
            }
          ],
          exercises: [
            {
              title: "Robust Workflow Design",
              description: "Design an AI workflow with comprehensive error handling and recovery mechanisms."
            }
          ]
        }
      },
      {
        id: "monitoring-optimization",
        courseId: "ai-automation-workflows",
        title: "Monitoring & Optimization",
        description: "Monitor AI workflow performance and optimize for efficiency and reliability.",
        icon: "fas fa-chart-line",
        order: 4,
        isActive: true,
        content: {
          sections: [
            {
              title: "Performance Metrics",
              content: "Learn to define and track key performance indicators for AI workflows."
            }
          ],
          exercises: [
            {
              title: "Workflow Optimization",
              description: "Analyze and optimize an existing AI workflow for better performance."
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

  async upsertUser(userData: UpsertUser): Promise<User> {
    const userId = userData.id || randomUUID();
    const existingUser = this.users.get(userId);
    
    const user: User = {
      id: userId,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    
    this.users.set(userId, user);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Legacy method - no longer applicable with Replit Auth
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = insertUser.id || randomUUID();
    const user: User = { 
      id,
      email: insertUser.email || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      profileImageUrl: insertUser.profileImageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date()
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

  // Course methods
  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values()).sort((a, b) => a.order - b.order);
  }

  async getCourse(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(courseData: InsertCourse): Promise<Course> {
    const course: Course = {
      ...courseData,
      isActive: courseData.isActive ?? true
    };
    this.courses.set(course.id, course);
    return course;
  }

  // Extended Module methods
  async getModulesByCourse(courseId: string): Promise<Module[]> {
    return Array.from(this.modules.values())
      .filter(module => module.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }

  async updateModule(id: string, updates: Partial<Module>): Promise<Module | undefined> {
    const existing = this.modules.get(id);
    if (!existing) {
      return undefined;
    }
    
    const updated: Module = { ...existing, ...updates };
    this.modules.set(id, updated);
    return updated;
  }

  // Goal methods
  async getUserGoals(userId: string): Promise<Goal[]> {
    return Array.from(this.goals.values())
      .filter(goal => goal.userId === userId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createGoal(goalData: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const goal: Goal = {
      ...goalData,
      courseId: goalData.courseId ?? null,
      notes: goalData.notes ?? null,
      id,
      createdAt: new Date()
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: string, updates: Partial<InsertGoal>): Promise<Goal | undefined> {
    const existing = this.goals.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: Goal = { ...existing, ...updates };
    this.goals.set(id, updated);
    return updated;
  }

  async deleteGoal(id: string): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Certificate methods
  async getUserCertificates(userId: string): Promise<Certificate[]> {
    return Array.from(this.certificates.values())
      .filter(cert => cert.userId === userId)
      .sort((a, b) => (a.issuedAt?.getTime() || 0) - (b.issuedAt?.getTime() || 0));
  }

  async issueCertificate(userId: string, courseId: string): Promise<Certificate> {
    const id = randomUUID();
    const serial = `CERT-${Date.now()}-${randomUUID().substring(0, 8).toUpperCase()}`;
    
    const certificate: Certificate = {
      id,
      userId,
      courseId,
      serial,
      issuedAt: new Date()
    };
    
    this.certificates.set(id, certificate);
    return certificate;
  }

  async getCertificate(id: string): Promise<Certificate | undefined> {
    return this.certificates.get(id);
  }

  async getAllCertificates(): Promise<Certificate[]> {
    return Array.from(this.certificates.values());
  }

  async getCertificateBySerial(serial: string): Promise<Certificate | undefined> {
    return Array.from(this.certificates.values()).find(cert => cert.serial === serial);
  }

  // Progress helper methods
  async getMaxCompletedModuleOrder(userId: string, courseId: string): Promise<number> {
    const courseModules = await this.getModulesByCourse(courseId);
    const userProgress = await this.getUserProgress(userId);
    
    let maxCompletedOrder = 0;
    
    for (const module of courseModules) {
      const progress = userProgress.find(p => p.moduleId === module.id);
      if (progress && progress.isCompleted && module.order > maxCompletedOrder) {
        maxCompletedOrder = module.order;
      }
    }
    
    return maxCompletedOrder;
  }

  async isCourseComplete(userId: string, courseId: string): Promise<boolean> {
    const courseModules = await this.getModulesByCourse(courseId);
    const userProgress = await this.getUserProgress(userId);
    
    // A course is complete if all its modules are completed
    for (const module of courseModules) {
      const progress = userProgress.find(p => p.moduleId === module.id);
      if (!progress || !progress.isCompleted) {
        return false;
      }
    }
    
    return courseModules.length > 0; // Ensure there are modules to complete
  }

  // Quiz methods
  async getQuizzesByModule(moduleId: string): Promise<Quiz[]> {
    return Array.from(this.quizzes.values())
      .filter(quiz => quiz.moduleId === moduleId && quiz.isActive)
      .sort((a, b) => a.order - b.order);
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async createQuiz(quizData: InsertQuiz): Promise<Quiz> {
    const id = randomUUID();
    const quiz: Quiz = {
      ...quizData,
      id,
      isActive: quizData.isActive ?? true,
      createdAt: new Date()
    };
    this.quizzes.set(id, quiz);
    return quiz;
  }

  // Quiz question methods
  async getQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
    return Array.from(this.quizQuestions.values())
      .filter(question => question.quizId === quizId)
      .sort((a, b) => a.order - b.order);
  }

  async getQuizQuestion(id: string): Promise<QuizQuestion | undefined> {
    return this.quizQuestions.get(id);
  }

  async createQuizQuestion(questionData: InsertQuizQuestion): Promise<QuizQuestion> {
    const id = randomUUID();
    const question: QuizQuestion = {
      ...questionData,
      id,
      points: questionData.points ?? 1
    };
    this.quizQuestions.set(id, question);
    return question;
  }

  // Quiz attempt methods
  async saveQuizAttempt(attemptData: InsertQuizAttempt): Promise<QuizAttempt> {
    const id = randomUUID();
    const attempt: QuizAttempt = {
      ...attemptData,
      id,
      timeSpent: attemptData.timeSpent ?? null,
      isCompleted: attemptData.isCompleted ?? true,
      createdAt: new Date()
    };
    this.quizAttempts.set(id, attempt);
    return attempt;
  }

  async getUserQuizAttempts(userId: string, quizId?: string): Promise<QuizAttempt[]> {
    const attempts = Array.from(this.quizAttempts.values())
      .filter(attempt => attempt.userId === userId);
    
    if (quizId) {
      return attempts.filter(attempt => attempt.quizId === quizId)
        .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
    }
    
    return attempts.sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async getQuizAttempt(id: string): Promise<QuizAttempt | undefined> {
    return this.quizAttempts.get(id);
  }

  async getBestQuizScore(userId: string, quizId: string): Promise<number> {
    const attempts = await this.getUserQuizAttempts(userId, quizId);
    if (attempts.length === 0) return 0;
    
    return Math.max(...attempts.map(attempt => attempt.score));
  }
}

export const storage = new MemStorage();
