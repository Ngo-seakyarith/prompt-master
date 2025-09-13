export default {
  // Navigation
  nav: {
    dashboard: "Dashboard",
    courses: "Courses",
    modules: "Modules",
    practice: "Practice",
    progress: "Progress",
    logo: "PromptMaster"
  },

  // Common UI Elements
  common: {
    loading: "Loading...",
    progress: "Progress",
    score: "Score",
    completed: "Completed",
    available: "Available",
    locked: "Locked",
    inProgress: "In Progress",
    start: "Start",
    continue: "Continue",
    review: "Review",
    notStarted: "Not started",
    backToModules: "Back to Modules",
    backToCourses: "Back to Courses",
    clear: "Clear",
    useTemplate: "Use Template",
    analyzePrompt: "Analyze Prompt",
    analyzing: "Analyzing...",
    previousExercise: "Previous Exercise",
    nextExercise: "Next Exercise",
    applySuggestions: "Apply Suggestions",
    tryNewExercise: "Try New Exercise",
    generating: "Generating...",
    characters: "Characters",
    words: "Words",
    exerciseOf: "Exercise {{current}} of {{total}}",
    completedCount: "{{completed}}/{{total}}",
    moduleNotFound: "Module Not Found",
    moduleNotFoundDesc: "The requested module could not be found.",
    emptyPrompt: "Empty Prompt",
    emptyPromptDesc: "Please write a prompt before analyzing.",
    assessmentFailed: "Assessment Failed",
    assessmentFailedDesc: "There was an error analyzing your prompt. Please try again."
  },

  // Dashboard
  dashboard: {
    heroTitle: "Master the Art of Prompt Engineering",
    heroSubtitle: "Learn to communicate effectively with AI through structured, progressive courses and hands-on practice.",
    enrolledCourses: "My Courses",
    allCourses: "Browse All Courses",
    interactivePractice: "Interactive Practice",
    yourLearningJourney: "Your Learning Journey",
    currentScore: "Current Score",
    masterArt: "Master the art of AI communication",
    recentActivity: "Recent Activity",
    continueLearning: "Continue Learning",
    exploreMore: "Explore More Courses",
    learningModules: "Learning Modules"
  },

  // Courses
  courses: {
    promptEngineeringFundamentals: {
      title: "Prompt Engineering Fundamentals",
      description: "Master the art of AI communication through structured, progressive learning. Build expertise from basic prompting to advanced techniques."
    },
    allCourses: "All Courses",
    courseOverview: "Course Overview",
    startCourse: "Start Course",
    continueCourse: "Continue Course",
    courseModules: "Course Modules",
    difficulty: "Difficulty",
    duration: "Duration",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    enrolled: "Enrolled",
    notEnrolled: "Not Enrolled",
    moduleCount: "{{count}} Modules",
    courseProgress: "Course Progress",
    backToCourses: "Back to Courses"
  },

  // Module Content
  modules: {
    basicPrompting: {
      title: "Basic Prompting",
      description: "Learn the fundamentals of prompting with and without context. Understand how context shapes AI responses."
    },
    promptStructure: {
      title: "Prompt Structure",
      description: "Master the anatomy of effective prompts: role, task, context, template, and constraints."
    },
    advancedTechniques: {
      title: "Advanced Techniques",
      description: "Explore chain-of-thought, few-shot learning, and advanced prompting strategies."
    },
    promptRefinement: {
      title: "Prompt Refinement",
      description: "Master key prompt patterns: persona, question refinement, cognitive verifier, and audience persona."
    },
    practicalApplications: {
      title: "Practical Applications",
      description: "Apply prompt engineering to productivity, automation, creativity, and business planning."
    }
  },

  // Module Detail
  moduleDetail: {
    learn: "Learn",
    practice: "Practice",
    examples: "Examples",
    yourPrompt: "Your Prompt",
    writePromptPlaceholder: "Write your prompt here...",
    exerciseCompleted: "Exercise Completed!",
    exerciseCompletedDesc: "Great work! You scored {{score}}/100",
    practiceInstruction: "Complete an exercise to see your assessment and feedback."
  },

  // Assessment & Feedback
  feedback: {
    assessmentFeedback: "AI Assessment & Feedback",
    overallScore: "Overall Score",
    clarityStructure: "Clarity & Structure",
    contextCompleteness: "Context Completeness",
    specificity: "Specificity",
    actionability: "Actionability",
    strengths: "Strengths",
    areasForImprovement: "Areas for Improvement",
    suggestions: "Suggestions",
    excellentReady: "Excellent! Ready for next module",
    scoreToUnlock: "Score 80+ to unlock next module",
    writeAndAnalyze: "Write a prompt and click \"Analyze Prompt\" to get detailed feedback and scoring.",
    exerciseProgressOverview: "Exercise Progress Overview"
  },

  // Footer
  footer: {
    help: "Help",
    documentation: "Documentation",
    community: "Community",
    contact: "Contact"
  },

  // Progress Tracker
  progressTracker: {
    overall: "Overall Progress",
    moduleProgress: "Module Progress",
    recentActivity: "Recent Activity",
    completionRate: "Completion Rate",
    averageScore: "Average Score",
    timeSpent: "Time Spent",
    exercisesCompleted: "Exercises Completed",
    badgesEarned: "Badges Earned",
    streak: "Current Streak",
    lastActivity: "Last Activity"
  },

  // Course Content - Basic Prompting
  content: {
    basicPrompting: {
      promptsWithContext: {
        title: "Prompts with Context",
        content: `Context is the key to unlocking AI's full potential. When you provide context, you give the AI crucial information about the situation, background, and specific requirements for your task.

**Why Context Matters:**
- Provides background information the AI needs to understand your request
- Sets the scope and boundaries for the response
- Helps the AI tailor its output to your specific needs
- Reduces ambiguity and improves accuracy

**Types of Context to Include:**
- **Situational Context**: Where, when, and why this task is happening
- **Audience Context**: Who will be reading or using the output
- **Background Information**: Relevant facts, data, or circumstances
- **Constraints**: Limitations, requirements, or specific parameters
- **Format Preferences**: How you want the information structured

**Example with Context:**
Instead of: "Write a marketing plan"
Try: "You are a marketing consultant working with a startup fintech company that provides budgeting apps for millennials. Create a 3-month digital marketing plan with a $5,000 budget that focuses on social media and content marketing to acquire 1,000 new users."`,
        examples: [
          "Context-rich prompt: 'You are helping a small restaurant owner in Portland who wants to increase weekend dinner reservations by 30%. The restaurant serves farm-to-table cuisine and has a $500/month marketing budget. Create a targeted marketing strategy.'",
          "Context-rich prompt: 'As a hiring manager for a remote-first tech startup, create interview questions for a senior software engineer role. The candidate should have React experience and strong communication skills for cross-functional collaboration.'"
        ]
      },
      promptsWithoutContext: {
        title: "Prompts without Context",
        content: `While context enhances AI responses, there are times when you need to understand basic prompting without extensive context. This helps you grasp the fundamentals and know when context is truly necessary.

**When to Use Basic Prompts:**
- Quick information requests
- General knowledge questions
- Simple creative tasks
- Initial brainstorming
- Testing AI capabilities

**Basic Prompt Structure:**
1. **Clear Action Word**: Start with verbs like "write," "explain," "create," "analyze"
2. **Specific Subject**: Define exactly what you want
3. **Basic Parameters**: Include essential details only

**Limitations of Context-Free Prompts:**
- Generic, one-size-fits-all responses
- May not address your specific needs
- Often require follow-up clarification
- Can produce irrelevant information

**Example without Context:**
"Write a marketing plan"
- Result: Generic marketing plan template
- Issues: No industry focus, budget consideration, or specific goals

**When Basic Prompts Work Well:**
- "Explain the water cycle"
- "List 10 creative writing prompts"
- "What are the benefits of exercise?"
- "Generate 5 business name ideas"`,
        examples: [
          "Basic prompt: 'Write a job description' → Generic template",
          "Basic prompt: 'Create a workout plan' → General fitness routine",
          "Basic prompt: 'Explain machine learning' → Broad overview"
        ]
      },
      examples: {
        title: "Examples",
        content: `Let's examine real examples that demonstrate the power of context in prompt engineering.

**Example 1: Content Creation**

❌ **Without Context**: "Write a blog post about productivity"
✅ **With Context**: "Write a 1,500-word blog post about productivity tips for remote software developers. Target audience is mid-level developers struggling with work-life balance while working from home. Include actionable tips, tool recommendations, and personal anecdotes. Write in a conversational tone for a tech blog."

**Example 2: Business Analysis**

❌ **Without Context**: "Analyze this business idea"
✅ **With Context**: "You are a venture capitalist with 15 years of experience in SaaS investments. Analyze this business idea: a subscription-based meal planning app for busy professionals. Consider market size, competition, revenue potential, and implementation challenges. The founder has $50K initial investment and technical background."

**Example 3: Creative Writing**

❌ **Without Context**: "Write a story"
✅ **With Context**: "Write a 500-word short story about a time traveler who accidentally changes a small detail in the past. The story should be written from first person perspective, have a twist ending, and be suitable for a science fiction magazine targeting adult readers."

**Example 4: Technical Documentation**

❌ **Without Context**: "Explain APIs"
✅ **With Context**: "Explain REST APIs to a junior frontend developer who understands JavaScript but has never worked with backends. Include practical examples using JavaScript fetch, common HTTP methods, and how to handle responses. Keep explanations simple and include code snippets."`,
        examples: [
          "Marketing: Context transforms 'promote our product' into targeted campaigns for specific audiences",
          "Education: Context turns 'explain a concept' into grade-appropriate, curriculum-aligned content",
          "Technical: Context converts 'write documentation' into user-specific, actionable guides"
        ]
      }
    }
  },

  // Exercises
  exercises: {
    basicPromptCreation: {
      title: "Exercise 1: Basic Prompt Creation",
      description: "Create a simple, clear prompt for generating a social media post. Focus on clarity and specific action words without adding context yet.",
      template: `Create a basic prompt that asks for a social media post about a topic of your choice.

Your prompt should:
- Start with a clear action word
- Specify the platform (Twitter, LinkedIn, Instagram, etc.)
- Include the main topic
- Be under 25 words

Example format: "Write a [platform] post about [topic]"

Your prompt:`
    },
    addingContext: {
      title: "Exercise 2: Adding Context for Better Results",
      description: "Take your basic prompt from Exercise 1 and enhance it with meaningful context to improve the AI's response quality.",
      template: `Enhance your Exercise 1 prompt by adding context. Transform your basic social media prompt into a context-rich version.

Add these context elements:
- Target audience (who will see this post?)
- Business context (what type of business/personal brand?)
- Goal (what do you want to achieve?)
- Tone/style preferences
- Any constraints (character limits, hashtag requirements, etc.)

Original prompt: [Your Exercise 1 prompt]

Enhanced prompt with context:`
    },
    comparingPrompts: {
      title: "Exercise 3: Comparing Contextual vs Non-Contextual Prompts",
      description: "Create two versions of a prompt for the same task - one without context and one with rich context. Analyze the difference in expected outcomes.",
      template: `Create two prompts for writing a product description:

**Version A (No Context):**
Write a basic prompt asking for a product description.

**Version B (With Context):**
Add specific context including:
- Product details and target market
- Where the description will be used
- Brand voice and key selling points
- Specific requirements or constraints

**Version A (No Context):**

**Version B (With Context):**

**Analysis:**
Explain how adding context would improve the AI's response quality and relevance.`
    },
    businessScenario: {
      title: "Exercise 4: Business Scenario with Context",
      description: "Create a comprehensive prompt for a real business scenario. Include all necessary context elements to get a practical, actionable response.",
      template: `Scenario: You're helping a small local bakery create an email marketing campaign to increase weekend sales.

Create a detailed prompt that includes:
- Clear role definition for the AI
- Specific business context and challenges
- Target audience information
- Budget and resource constraints
- Specific deliverables needed
- Success metrics

Your comprehensive prompt:`
    },
    creativePrompt: {
      title: "Exercise 5: Creative Prompt with Specific Constraints",
      description: "Design a creative prompt that balances creative freedom with specific constraints and context to achieve a targeted outcome.",
      template: `Create a prompt for generating creative content with specific constraints.

Choose one scenario:
1. A children's story with educational elements
2. A marketing slogan for a specific industry
3. A social media campaign concept for a non-profit
4. A training exercise for employees

Your prompt should include:
- Creative freedom elements (tone, style, approach)
- Specific constraints (length, audience, format)
- Context about purpose and use case
- Clear success criteria

Chosen scenario: [Select one from above]

Your creative prompt with constraints:`
    }
  }
};