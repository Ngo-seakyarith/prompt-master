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
        description: "Learn iterative improvement techniques and testing strategies for optimal results.",
        icon: "fas fa-tools",
        order: 4,
        isActive: true,
        content: {
          sections: [
            {
              title: "The Refinement Mindset",
              content: "Prompt refinement is an iterative process of testing, analyzing, and improving prompts based on actual results. Like any craft, prompt engineering improves with practice and systematic refinement. The best prompts are rarely perfect on the first try - they evolve through careful observation and adjustment.",
              examples: [
                "Initial attempt: 'Write a marketing email' → Generic, unfocused output",
                "First refinement: 'Write a marketing email for our new product launch' → Better, but still generic",
                "Second refinement: 'Write a compelling marketing email announcing our new project management software to existing customers, focusing on 3 key new features and including a special upgrade offer' → Specific and actionable",
                "Final refinement: 'You are a customer success manager. Write a warm, personalized email to our existing customers announcing TaskFlow 2.0, our enhanced project management software. Highlight these 3 key improvements: AI-powered task prioritization, real-time team collaboration, and advanced reporting. Include a 30% upgrade discount valid for 2 weeks. Keep the tone friendly but professional, under 200 words.'"
              ]
            },
            {
              title: "Systematic Testing Approach",
              content: "Effective prompt refinement requires systematic testing and measurement. Rather than making random changes, use a structured approach to identify what works and why. Test one variable at a time, measure results consistently, and build on successful patterns.",
              examples: [
                "Variable testing: Test different role definitions with the same task to see impact",
                "A/B comparison: 'Compare outputs from these two prompt versions and identify which produces better results'",
                "Metric tracking: Measure specific outcomes like accuracy, relevance, creativity, or completion rate",
                "Pattern identification: 'What specific elements in the higher-performing prompt made the difference?'"
              ]
            },
            {
              title: "Common Refinement Strategies",
              content: "Several proven strategies can systematically improve prompt performance. These include adding specificity, adjusting tone, providing better context, refining output format, and setting clearer constraints. Each strategy addresses common prompt weaknesses.",
              examples: [
                "Add specificity: 'Write a report' → 'Write a 500-word executive summary report'",
                "Adjust tone: 'Explain this concept' → 'Explain this concept in simple terms for beginners'",
                "Better context: 'Create a budget' → 'Create a budget for a 5-person startup with $100k runway and 18-month timeline'",
                "Refine format: 'List benefits' → 'List 5 key benefits in bullet points with 1-sentence explanations'",
                "Clear constraints: 'Write creatively' → 'Write creatively but maintain professional tone and factual accuracy'"
              ]
            },
            {
              title: "Debugging Poor Results",
              content: "When prompts produce unsatisfactory results, systematic debugging can identify the root cause. Common issues include unclear instructions, missing context, inappropriate role definition, or conflicting requirements. Addressing these systematically improves outcomes.",
              examples: [
                "Too vague: 'The output is generic' → Add specific requirements and examples",
                "Wrong tone: 'The response is too formal' → Adjust role definition and add tone guidance",
                "Missing context: 'The advice isn't relevant' → Provide more background information and constraints",
                "Conflicting instructions: 'The output is inconsistent' → Review for contradictory requirements and clarify priorities",
                "Poor format: 'The structure is confusing' → Provide clear template or output format specifications"
              ]
            },
            {
              title: "Version Control and Documentation",
              content: "Track your prompt iterations like code versions. Document what changes were made, why, and what results they produced. This creates a knowledge base for future prompt development and helps identify patterns that consistently work for your use cases.",
              examples: [
                "Version tracking: 'v1.0: Basic prompt → v1.1: Added role definition → v1.2: Specified output format → v2.0: Complete restructure'",
                "Change documentation: 'Changed from generic role to domain expert - increased technical accuracy by 40%'",
                "Result comparison: 'Original prompt scored 60/100 avg, refined version scores 85/100 avg - key change was adding specific constraints'",
                "Pattern library: 'For technical explanations: Expert role + step-by-step format + beginner-friendly language = consistently high performance'"
              ]
            },
            {
              title: "Advanced Refinement Techniques",
              content: "Advanced practitioners use sophisticated techniques like prompt ablation studies, performance benchmarking, user testing, and automated optimization. These methods provide deeper insights into prompt effectiveness and enable continuous improvement.",
              examples: [
                "Ablation study: 'Remove each prompt component individually to identify which elements contribute most to performance'",
                "Benchmarking: 'Test this prompt against 10 similar tasks and measure consistency of results'",
                "User feedback: 'Have 5 team members use this prompt and rate the usefulness of outputs on a 1-10 scale'",
                "Automated testing: 'Run this prompt with 20 different input scenarios and analyze patterns in the outputs'"
              ]
            }
          ],
          exercises: [
            {
              title: "Systematic Prompt Improvement",
              description: "Take a low-performing prompt and improve it through systematic refinement",
              template: "Starting prompt: 'Help me with my presentation'\n\nRefine this prompt through these steps:\n1. Add specific context and requirements\n2. Define a clear expert role\n3. Specify desired output format\n4. Set appropriate constraints\n5. Test and compare results\n\nDocument each change and explain why you made it."
            },
            {
              title: "Debugging Prompt Problems",
              description: "Analyze a problematic prompt and identify improvement opportunities",
              template: "Problematic prompt: 'You are a consultant. Write a strategy for my business that will increase revenue and reduce costs while improving customer satisfaction and employee engagement.'\n\nIdentify and fix these issues:\n• What's too vague or broad?\n• What context is missing?\n• What constraints are needed?\n• How can the output be better structured?\n\nCreate an improved version that addresses each problem."
            },
            {
              title: "A/B Testing for Prompts",
              description: "Create two versions of a prompt and design a test to compare their effectiveness",
              template: "Task: Get AI to write compelling social media captions\n\nCreate two prompt versions that differ in:\n• Approach A: Focus on emotional storytelling\n• Approach B: Focus on data and benefits\n\nDesign your test:\n• What metrics will you measure?\n• How will you ensure fair comparison?\n• What criteria determine the winner?\n• How will you document results?"
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
              title: "Business Strategy and Planning",
              content: "Transform your business planning process with strategic prompt engineering. Create comprehensive plans, analyze markets, and develop strategies by leveraging AI's analytical capabilities with well-structured prompts that guide systematic thinking and thorough analysis.",
              examples: [
                "Basic: 'Help me plan my business' → Vague, generic advice",
                "Strategic: 'You are a seasoned business strategist. Analyze the market opportunity for a SaaS project management tool targeting remote teams of 10-50 people. Include market size, competitive landscape, differentiation opportunities, and go-to-market strategy. Present as an executive summary with clear recommendations.'",
                "Comprehensive: 'Acting as a management consultant with expertise in SaaS businesses, create a detailed 12-month strategic plan for TechFlow, a project management startup. Current situation: Pre-revenue, 2 co-founders, $500k seed funding, competing against Asana/Monday. Target: 1000 paying customers, $1M ARR. Address product development, marketing strategy, hiring plan, and key milestones. Present in sections with timelines and success metrics.'"
              ]
            },
            {
              title: "Content Marketing and Communication",
              content: "Revolutionize your content creation process with prompt engineering. Generate targeted blog posts, social media content, email campaigns, and marketing materials that align with your brand voice and audience needs through strategic AI collaboration.",
              examples: [
                "Generic: 'Write a blog post about our product' → Unfocused content",
                "Targeted: 'Write a 1200-word blog post for software developers about how our API monitoring tool reduces debugging time by 60%. Include technical examples, code snippets, and a compelling ROI case study. Tone: Technical but approachable.'",
                "Strategic series: 'Create a 5-part blog series introducing AI prompt engineering to marketing professionals. Part 1: Basics and benefits, Part 2: Content creation applications, Part 3: Customer research and personas, Part 4: Campaign optimization, Part 5: Measuring success. Each post 800 words, actionable tips, real examples.'"
              ]
            },
            {
              title: "Customer Research and Analysis",
              content: "Use prompt engineering to analyze customer feedback, market trends, and competitive intelligence. Transform raw data into actionable insights through systematic AI analysis guided by expertly crafted prompts.",
              examples: [
                "Surface level: 'Analyze this customer feedback' → Basic summary",
                "Insightful: 'You are a customer experience analyst. Analyze these 100 support tickets to identify the top 5 pain points, their frequency, impact on customer satisfaction, and recommended solutions. Prioritize by business impact and implementation difficulty.'",
                "Comprehensive: 'Acting as a market research specialist, analyze our competitor's recent product launches, pricing changes, and customer reviews from the past 6 months. Identify their strategic direction, strengths/weaknesses, and 3 specific opportunities for us to gain competitive advantage. Support with data and examples.'"
              ]
            },
            {
              title: "Productivity and Automation",
              content: "Streamline your workflow and automate routine tasks using prompt engineering. Create systems for email templates, meeting summaries, project planning, and decision-making frameworks that save time and improve consistency.",
              examples: [
                "Basic automation: 'Summarize this meeting' → Simple notes",
                "Productive system: 'Create a meeting summary template that captures: Key decisions made, action items with owners and deadlines, unresolved issues requiring follow-up, next meeting agenda items. Apply this format to today's product planning meeting notes.'",
                "Advanced workflow: 'You are an executive assistant. Transform these rough project notes into a comprehensive project brief including: Objectives, scope, timeline, resource requirements, risk assessment, success metrics. Format for executive review with clear next steps and decision points.'"
              ]
            },
            {
              title: "Creative Problem Solving",
              content: "Unlock creative solutions and innovative thinking through strategic prompt engineering. Use AI to brainstorm ideas, explore alternatives, and approach challenges from multiple perspectives for breakthrough solutions.",
              examples: [
                "Standard approach: 'Give me ideas for improving our app' → Generic suggestions",
                "Creative exploration: 'You are an innovative product designer. Our mobile app has 20% user retention after 30 days. Brainstorm 10 unconventional approaches to increase engagement, thinking beyond typical features. Consider psychology, gamification, community, and unexpected use cases.'",
                "Systematic innovation: 'Use the SCAMPER method (Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse) to generate innovative solutions for reducing customer support volume. Apply each technique to our current support process and generate specific, actionable improvements.'"
              ]
            },
            {
              title: "Professional Development and Learning",
              content: "Accelerate your professional growth using AI as a personalized coach, mentor, and learning partner. Create customized learning paths, skill assessments, and development plans tailored to your goals and industry demands.",
              examples: [
                "General request: 'Help me learn data science' → Generic learning advice",
                "Personalized guidance: 'You are a senior data scientist and career mentor. Create a 6-month learning plan for a marketing professional transitioning to data science. Current skills: Excel proficiency, basic SQL, business analytics. Goal: Land entry-level data scientist role. Include specific resources, projects, and weekly milestones.'",
                "Comprehensive development: 'Acting as an executive coach, assess my leadership skills based on this 360-feedback summary. Identify top 3 development areas, create specific improvement strategies with measurable goals, and design a 90-day action plan with weekly check-ins and progress indicators.'"
              ]
            }
          ],
          exercises: [
            {
              title: "Complete Business Strategy Prompt",
              description: "Create a comprehensive business strategy prompt for a real-world scenario",
              template: "Scenario: A traditional retail clothing store wants to expand online\n\nCreate a strategic prompt that addresses:\n• Market analysis and opportunity sizing\n• Digital transformation roadmap\n• Competition and differentiation\n• Financial projections and resource needs\n• Implementation timeline with milestones\n• Risk assessment and mitigation strategies\n\nYour prompt should guide the AI to think like a senior business consultant."
            },
            {
              title: "Content Marketing Campaign Prompt",
              description: "Design a prompt for creating a complete content marketing campaign",
              template: "Challenge: Launch a thought leadership campaign for a B2B software company\n\nCreate a prompt that generates:\n• Content themes and topics (6 months)\n• Multi-channel distribution strategy\n• Audience segmentation and personalization\n• Content calendar with production timeline\n• Success metrics and measurement plan\n• Brand voice and messaging guidelines\n\nEnsure the prompt produces actionable, specific outputs."
            },
            {
              title: "Problem-Solving Workshop Prompt",
              description: "Create a prompt that facilitates creative problem-solving for complex business challenges",
              template: "Business Challenge: A SaaS company's customer churn rate is 15% monthly\n\nDesign a problem-solving prompt that:\n• Guides systematic root cause analysis\n• Generates creative solution alternatives\n• Evaluates solutions using multiple criteria\n• Prioritizes recommendations by impact/effort\n• Creates implementation roadmap\n• Identifies success metrics and monitoring\n\nYour prompt should think through the problem comprehensively and creatively."
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
