export default {
  // Navigation
  nav: {
    dashboard: "Dashboard",
    courses: "Courses",
    modules: "Modules",
    aiModels: "AI Models",
    playground: "Playground",
    goals: "Goals",
    practice: "Practice",
    progress: "Progress",
    certificates: "Certificates",
    logo: "PromptMaster",
    learn: "Learn",
    quiz: "Quiz"
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
    assessmentFailedDesc: "There was an error analyzing your prompt. Please try again.",
    unlockRequirement: "Complete previous module to unlock",
    sequentialLearning: "Complete modules in order for the best learning experience",
    moduleBlocked: "This module is currently locked",
    moduleBlockedDesc: "Complete the previous module to unlock this content",
    progressToUnlock: "{{progress}}% progress to unlock next module",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    optional: "Optional",
    view: "View",
    download: "Download",
    print: "Print",
    verify: "Verify",
    share: "Share",
    congratulations: "Congratulations!",
    achievement: "Achievement Unlocked",
    earned: "Earned",
    pending: "Pending",
    expired: "Expired",
    certificateId: "Certificate ID",
    unknownError: "An unknown error occurred",
    tryAgain: "Try Again",
    more: "more",
    filterBy: "Filter by",
    testInPlayground: "Test in Playground",
    importToPlayground: "Import to Playground",
    openPlayground: "Open Playground",
    promptImported: "Prompt imported to Playground",
    playgroundIntegration: "Playground Integration",
    difficulty: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced"
    }
  },

  // Certificates
  certificates: {
    title: "Certificates",
    myCertificates: "My Certificates",
    earnedCertificates: "Earned Certificates",
    noCertificates: "No Certificates Yet",
    noCertificatesDesc: "Complete courses to earn your first certificate!",
    certificateEarned: "Certificate Earned!",
    certificateEarnedDesc: "Congratulations! You have successfully completed the course and earned your certificate.",
    viewCertificate: "View Certificate",
    downloadCertificate: "Download Certificate",
    printCertificate: "Print Certificate",
    shareCertificate: "Share Certificate",
    certificateDetails: "Certificate Details",
    issuedTo: "This certificate is awarded to",
    forCompletion: "for successful completion of",
    issuedOn: "Issued on",
    completedOn: "Completed on",
    serialNumber: "Serial Number",
    verificationId: "Verification ID",
    courseTitle: "Course Title",
    completionDate: "Completion Date",
    finalScore: "Final Score",
    modules: "Modules",
    modulesCompleted: "{{completed}} of {{total}} modules completed",
    certificateOfCompletion: "Certificate of Completion",
    certificateOfAchievement: "Certificate of Achievement",
    officialCertificate: "Official Certificate",
    promptMasterAcademy: "PromptMaster Academy",
    certifies: "This certifies that",
    hasSuccessfully: "has successfully completed",
    withScore: "with a score of {{score}}%",
    onDate: "on {{date}}",
    signature: "Authorized Signature",
    seal: "Official Seal",
    verify: "Verify this certificate at",
    validCertificate: "This is a valid certificate",
    invalidCertificate: "This certificate could not be verified",
    loadingCertificate: "Loading certificate...",
    certificateError: "Error loading certificate",
    achievements: "Achievements",
    recentCertificates: "Recent Certificates",
    allCertificates: "All Certificates",
    viewAllCertificates: "View All Certificates",
    filterBy: "Filter by",
    sortBy: "Sort by",
    newest: "Newest First",
    oldest: "Oldest First",
    courseAZ: "Course A-Z",
    courseZA: "Course Z-A",
    allCourses: "All Courses",
    status: "Status",
    allStatus: "All Status",
    completed: "Completed",
    inProgress: "In Progress",
    notStarted: "Not Started"
  },

  // Recommendations
  recommendations: {
    title: "Personalized Recommendations",
    subtitle: "AI-powered suggestions tailored to your learning journey and goals",
    suggestions: "suggestions",
    loadError: "Failed to Load Recommendations",
    loadErrorDesc: "We couldn't fetch your personalized recommendations. Please check your connection and try again.",
    noRecommendations: "No Recommendations Available",
    noRecommendationsDesc: "Complete some modules or set learning goals to receive personalized recommendations.",
    filterByType: "Filter by Type",
    filterByPriority: "Filter by Priority",
    allTypes: "All Types",
    allPriorities: "All Priorities",
    showAll: "Show All Recommendations",
    currentProgress: "Current Progress",
    prerequisitesMet: "Prerequisites met",
    prerequisitesNotMet: "Prerequisites not met",
    modulesCompleted: "Modules Completed",
    averageScore: "Average Score",
    learningVelocity: "Modules/Week",
    goalAlignment: "Goal Alignment",
    
    // Recommendation Types
    types: {
      "next-in-sequence": "Continue Learning",
      "goal-aligned": "Goal Priority",
      "review-needed": "Review Needed",
      "similar-interests": "Recommended for You",
      "difficulty-progressive": "Level Up",
      "time-based": "Keep Momentum"
    },

    // Priority Levels
    priority: {
      high: "High Priority",
      medium: "Medium Priority",
      low: "Low Priority"
    },

    // Action Labels
    actions: {
      "next-in-sequence": "Continue Module",
      "goal-aligned": "Work Toward Goal",
      "review-needed": "Review Content",
      "similar-interests": "Explore Topic",
      "difficulty-progressive": "Level Up",
      "time-based": "Keep Going"
    }
  },

  // Authentication
  auth: {
    loginRequired: "Please log in to continue",
    loginRequiredDescription: "You need to be logged in to access this feature. Click the button below to sign in with your Replit account.",
    loginButton: "Log in with Replit",
    loginRedirectNotice: "You will be redirected to Replit for authentication."
  },

  // AI Models
  aiModels: {
    title: "Key AI Models & Platforms",
    subtitle: "Explore and access the leading AI models and platforms mentioned in our courses. Click any link to visit the official platform and start using these powerful AI tools.",
    allModels: "All Models",
    categories: {
      "General Purpose": "General Purpose",
      "Productivity": "Productivity",
      "Real-time Info": "Real-time Info",
      "Reasoning": "Reasoning",
      "Research": "Research"
    },
    pricing: {
      free: "Free",
      premium: "Premium",
      perMonth: "/month"
    },
    actions: {
      visit: "Visit Platform",
      learnMore: "Learn More"
    },
    modelInfo: {
      company: "Company",
      category: "Category",
      pricing: "Pricing",
      description: "Description"
    }
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
    learningModules: "Learning Modules",
    myGoals: "My Goals"
  },

  // Courses
  courses: {
    promptEngineeringFundamentals: {
      title: "Prompt Engineering Fundamentals",
      description: "Master the art of AI communication through structured, progressive learning. Build expertise from basic prompting to advanced techniques."
    },
    aiFundamentals: {
      title: "AI Fundamentals",
      description: "Understand the core concepts of artificial intelligence, machine learning, and how AI systems like ChatGPT, Claude, and Gemini work in the modern world."
    },
    aiProductivityImprovement: {
      title: "AI for Productivity Improvement",
      description: "Leverage AI tools like Copilot, ChatGPT, and Claude to streamline workflows, optimize processes, and boost personal and team productivity."
    },
    aiCriticalThinkingProblemSolving: {
      title: "AI for Critical Thinking & Problem Solving",
      description: "Enhance analytical skills and decision-making capabilities using AI-powered frameworks and logical reasoning approaches."
    },
    aiCreativesMarketing: {
      title: "AI for Creatives and Marketing",
      description: "Transform creative processes and marketing strategies with AI-powered content creation, design tools, and campaign optimization."
    },
    aiStrategicPlanning: {
      title: "AI for Strategic Planning",
      description: "Utilize AI for business strategy development, market analysis, competitive intelligence, and long-term planning initiatives."
    },
    aiCreativityInnovation: {
      title: "AI for Creativity and Innovation",
      description: "Unlock creative potential and drive innovation using AI for ideation, creative processes, and breakthrough thinking."
    },
    aiPoweredCoaching: {
      title: "AI-powered Coaching",
      description: "Master personalized coaching techniques using AI for skill development, performance optimization, and human potential enhancement."
    },
    aiBusinessPlanDevelopmentExecution: {
      title: "AI for Business Plan Development & Execution",
      description: "Create comprehensive business plans and execution strategies using AI for modeling, projections, and implementation guidance."
    },
    aiResearchStudy: {
      title: "AI for Research & Study",
      description: "Enhance research capabilities and academic performance using AI for information gathering, analysis, and knowledge synthesis."
    },
    genaiDataAnalysisDecisionMaking: {
      title: "GenAI for Data Analysis & Decision-making",
      description: "Master generative AI for data interpretation, statistical analysis, and informed decision-making in business contexts."
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

  // Goals
  goals: {
    title: "Learning Goals",
    subtitle: "Set goals to track your learning progress and stay motivated on your journey.",
    createGoal: "Create Goal",
    editGoal: "Edit Goal",
    updateGoal: "Update Goal",
    createGoalDescription: "Set a learning goal to help track your progress and stay motivated.",
    editGoalDescription: "Update your learning goal details.",
    manageGoals: "Manage Goals",
    setYourGoals: "Set Your Learning Goals",
    setGoalsDescription: "Create personalized learning goals to stay motivated and track your progress effectively.",
    createFirstGoal: "Create Your First Goal",
    viewAllGoals: "View All Goals",
    noActiveGoals: "No Active Goals",
    noActiveGoalsDescription: "You don't have any active goals yet. Create your first goal to start tracking your learning progress.",
    noCompletedGoals: "No Completed Goals",
    noCompletedGoalsDescription: "You haven't completed any goals yet. Keep learning to achieve your first goal!",
    noExpiredGoals: "No Expired Goals",
    noExpiredGoalsDescription: "Great job! You don't have any expired goals.",
    activeGoals: "Active Goals",
    completedGoals: "Completed Goals",
    expiredGoals: "Expired Goals",
    totalGoals: "Total Goals",
    active: "Active",
    completed: "Completed",
    expired: "Expired",
    confirmDelete: "Are you sure you want to delete this goal?",
    
    // Goal Types
    goalType: "Goal Type",
    types: {
      course_completion: "Course Completion",
      module_count: "Module Count",
      streak: "Learning Streak",
      progress_percentage: "Progress Percentage"
    },
    typeDescriptions: {
      course_completion: "Complete all modules in a specific course",
      module_count: "Complete a target number of modules",
      streak: "Maintain a learning streak for consecutive days",
      progress_percentage: "Reach a target percentage of progress in a course"
    },
    
    // Goal Form
    goalTitle: "Goal Title",
    goalTitlePlaceholder: "Enter a descriptive title for your goal",
    goalTitleDescription: "Give your goal a clear, motivating title",
    selectCourse: "Select Course",
    selectCoursePlaceholder: "Choose a course for this goal",
    selectCourseDescription: "Select the course this goal relates to",
    targetValue: "Target Value",
    targetLabels: {
      modules: "modules",
      course: "course completion",
      percentage: "% progress",
      days: "days"
    },
    targetValueDescriptions: {
      moduleCount: "Number of modules you want to complete",
      courseCompletion: "Complete the entire course",
      percentage: "Target percentage of progress (0-100%)",
      streak: "Number of consecutive days to maintain your learning streak"
    },
    targetDate: "Target Date",
    pickDate: "Pick a date",
    targetDateDescription: "When do you want to achieve this goal?",
    description: "Description",
    descriptionPlaceholder: "Optional: Add more details about your goal",
    descriptionDescription: "Provide additional context or motivation for your goal",
    
    // Progress Descriptions
    progressDescriptions: {
      courseCompletion: "{{current}} of {{target}} modules completed",
      moduleCount: "{{current}} of {{target}} modules completed", 
      streak: "{{current}} of {{target}} days streak",
      progressPercentage: "{{current}}% of {{target}}% progress"
    },
    
    // Status and Progress
    completedOn: "Completed on",
    expiredOn: "Expired on",
    daysRemaining: "{{days}} days remaining",
    overdue: "Overdue",
    relatedCourse: "Related course",
    congratulations: "Congratulations!",
    goalCompleted: "You have successfully achieved this goal!",
    noDescription: "No description provided"
  },

  // Module Content
  modules: {
    // General module content terms
    exercise: "Exercise",
    exercises: "Exercises", 
    singleQuiz: "Quiz",
    quizzes: "Quizzes",
    
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
    },
    // AI Fundamentals Modules
    aiFundamentalsBasics: {
      title: "AI Basics and Concepts",
      description: "Understand what artificial intelligence is, its history, and core concepts that drive modern AI systems."
    },
    aiFundamentalsMachineLearning: {
      title: "Machine Learning Fundamentals",
      description: "Learn about machine learning, neural networks, and how AI systems learn from data."
    },
    aiFundamentalsApplications: {
      title: "AI Applications and Use Cases",
      description: "Explore real-world applications of AI across industries and understand how AI is transforming business."
    },
    aiFundamentalsEthicsFuture: {
      title: "AI Ethics and Future",
      description: "Understand the ethical implications of AI, bias considerations, and future trends in artificial intelligence."
    },
    // AI Productivity Improvement Modules
    aiProductivityAutomationBasics: {
      title: "Automation Basics",
      description: "Learn how AI can automate repetitive tasks and streamline everyday workflows."
    },
    aiProductivityWorkflowOptimization: {
      title: "Workflow Optimization",
      description: "Optimize business processes and personal workflows using AI-powered tools and strategies."
    },
    aiProductivityTimeManagement: {
      title: "AI-Powered Time Management",
      description: "Use AI tools for scheduling, prioritization, and effective time management strategies."
    },
    aiProductivityCollaborationTools: {
      title: "AI Collaboration Tools",
      description: "Enhance team collaboration and communication using AI-powered platforms and tools."
    },
    // AI Critical Thinking & Problem Solving Modules
    aiCriticalThinkingFrameworks: {
      title: "Critical Thinking Frameworks",
      description: "Learn analytical frameworks and structured thinking approaches enhanced by AI capabilities."
    },
    aiCriticalThinkingDecisionMaking: {
      title: "AI-Enhanced Decision Making",
      description: "Improve decision-making processes using AI for data analysis and scenario modeling."
    },
    aiCriticalThinkingProblemSolvingMethods: {
      title: "Problem Solving Methods",
      description: "Master systematic problem-solving approaches using AI tools for analysis and solution generation."
    },
    aiCriticalThinkingLogicalReasoning: {
      title: "Logical Reasoning with AI",
      description: "Develop logical reasoning skills and use AI to validate arguments and identify logical fallacies."
    },
    // AI Creatives and Marketing Modules
    aiCreativesContentCreation: {
      title: "AI Content Creation",
      description: "Create compelling content using AI tools for writing, design, and multimedia production."
    },
    aiCreativesDesignTools: {
      title: "AI Design Tools",
      description: "Master AI-powered design tools for graphics, logos, and visual content creation."
    },
    aiCreativesCampaignOptimization: {
      title: "Campaign Optimization",
      description: "Optimize marketing campaigns using AI for targeting, personalization, and performance analysis."
    },
    aiCreativesBrandStrategy: {
      title: "AI-Driven Brand Strategy",
      description: "Develop brand strategies and positioning using AI insights and market analysis."
    },
    // AI Strategic Planning Modules
    aiStrategicPlanningBusinessStrategy: {
      title: "AI in Business Strategy",
      description: "Develop comprehensive business strategies using AI-powered analysis and forecasting."
    },
    aiStrategicPlanningMarketAnalysis: {
      title: "Market Analysis with AI",
      description: "Conduct thorough market research and analysis using AI tools for data collection and insights."
    },
    aiStrategicPlanningCompetitiveIntelligence: {
      title: "Competitive Intelligence",
      description: "Gather and analyze competitive intelligence using AI for strategic advantage."
    },
    aiStrategicPlanningImplementation: {
      title: "Strategy Implementation",
      description: "Execute strategic plans effectively using AI for monitoring, adjustment, and optimization."
    },
    // AI Creativity and Innovation Modules
    aiCreativityIdeationTechniques: {
      title: "AI Ideation Techniques",
      description: "Generate innovative ideas using AI-powered brainstorming and creative thinking methods."
    },
    aiCreativityCreativeProcesses: {
      title: "Creative Processes with AI",
      description: "Enhance creative workflows and processes using AI tools for inspiration and refinement."
    },
    aiCreativityInnovationFrameworks: {
      title: "Innovation Frameworks",
      description: "Apply structured innovation frameworks enhanced by AI for systematic breakthrough thinking."
    },
    aiCreativityBreakthroughThinking: {
      title: "Breakthrough Thinking",
      description: "Develop breakthrough solutions and disruptive innovations using AI-assisted thinking methods."
    },
    // AI-powered Coaching Modules
    aiCoachingFundamentals: {
      title: "AI Coaching Fundamentals",
      description: "Learn the principles of coaching enhanced by AI for personalized guidance and development."
    },
    aiCoachingSkillDevelopment: {
      title: "AI Skill Development",
      description: "Design personalized skill development programs using AI for assessment and progression tracking."
    },
    aiCoachingPerformanceOptimization: {
      title: "Performance Optimization",
      description: "Optimize human performance using AI analytics and personalized coaching strategies."
    },
    aiCoachingHumanPotential: {
      title: "Human Potential Enhancement",
      description: "Unlock human potential through AI-powered coaching techniques and personal development."
    },
    // AI Business Plan Development & Execution Modules
    aiBusinessPlanModeling: {
      title: "Business Modeling with AI",
      description: "Create comprehensive business models using AI for market analysis and validation."
    },
    aiBusinessPlanFinancialProjections: {
      title: "Financial Projections",
      description: "Develop accurate financial projections and forecasts using AI-powered analysis tools."
    },
    aiBusinessPlanStrategyDevelopment: {
      title: "Strategy Development",
      description: "Formulate business strategies and go-to-market plans using AI insights and competitive analysis."
    },
    aiBusinessPlanExecutionMonitoring: {
      title: "Execution and Monitoring",
      description: "Execute business plans effectively and monitor progress using AI-powered tracking systems."
    },
    // AI Research & Study Modules
    aiResearchMethodology: {
      title: "AI Research Methodology",
      description: "Learn research methodologies enhanced by AI for efficient and comprehensive academic research."
    },
    aiResearchInformationGathering: {
      title: "Information Gathering",
      description: "Master AI-powered tools for data collection, literature review, and information synthesis."
    },
    aiResearchAnalysisSynthesis: {
      title: "Analysis and Synthesis",
      description: "Analyze research data and synthesize knowledge using AI for pattern recognition and insights."
    },
    aiResearchAcademicWriting: {
      title: "Academic Writing with AI",
      description: "Enhance academic writing and publication processes using AI for clarity and impact."
    },
    // GenAI Data Analysis & Decision-making Modules
    genaiDataAnalysisFundamentals: {
      title: "GenAI Data Analysis Fundamentals",
      description: "Master generative AI fundamentals for data interpretation and statistical analysis."
    },
    genaiDataAnalysisStatisticalMethods: {
      title: "Statistical Methods with GenAI",
      description: "Apply statistical methods and data science techniques enhanced by generative AI capabilities."
    },
    genaiDataAnalysisBusinessIntelligence: {
      title: "Business Intelligence",
      description: "Transform data into actionable business intelligence using generative AI for insights and reporting."
    },
    genaiDataAnalysisDecisionFrameworks: {
      title: "Decision-making Frameworks",
      description: "Make informed decisions using GenAI-powered frameworks for data-driven decision making."
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
  },

  // Quiz System
  quiz: {
    // Quiz Overview
    moduleQuizzes: "Module Quizzes",
    totalQuizzes: "Total Quizzes",
    completedQuizzes: "Completed Quizzes",
    
    // Quiz Instructions
    instructions: "Quiz Instructions",
    instruction1: "Complete all practice exercises before taking quizzes",
    instruction2: "You need 80% or higher to pass each quiz",
    instruction3: "You can retake quizzes to improve your score",
    instruction4: "Quiz completion contributes to overall module progress",
    
    // Module-specific Quiz Content
    basicPrompting: {
      title: "Basic Prompting Fundamentals Quiz",
      description: "Test your understanding of basic prompt engineering principles and the importance of context in AI communication."
    },
    promptStructure: {
      title: "Prompt Structure Mastery Quiz",
      description: "Assess your knowledge of effective prompt anatomy including roles, tasks, context, templates, and constraints."
    },
    advancedTechniques: {
      title: "Advanced Prompting Techniques Quiz",
      description: "Evaluate your understanding of chain-of-thought reasoning, few-shot learning, and advanced prompting strategies."
    },
    promptRefinement: {
      title: "Prompt Refinement Patterns Quiz",
      description: "Test your mastery of key prompt patterns including persona, question refinement, and cognitive verifier techniques."
    },
    practicalApplications: {
      title: "Practical Applications Quiz",
      description: "Assess your ability to apply prompt engineering to real-world scenarios including productivity, automation, and business planning."
    },
    
    // Quiz Card
    available: "Available",
    moduleRequired: "Module Required",
    retakeQuiz: "Retake Quiz",
    startQuiz: "Start Quiz",
    completeModule: "Complete Module",
    completeExercises: "Complete Exercises",
    quizLockedDesc: "Complete the module to unlock this quiz",
    completeModuleFirst: "Complete module first",
    moduleCompletionRequired: "Finish all module content before taking the quiz",
    completeExercisesFirst: "Complete exercises first",
    exerciseCompletionRequired: "Finish all required exercises before taking the quiz",
    bestScore: "Best Score",
    attempts: "Attempts",
    lastAttempt: "Last Attempt",
    passed: "Passed",
    canImprove: "Can Improve",
    notAttempted: "Not Attempted",

    // Quiz Taker
    loadingQuiz: "Loading quiz...",
    loadError: "Quiz Load Error",
    loadErrorDesc: "Failed to load quiz questions. Please try again.",
    questionOf: "Question {{current}} of {{total}}",
    progress: "Progress", 
    previousQuestion: "Previous",
    nextQuestion: "Next",
    submitQuiz: "Submit Quiz",
    submitting: "Submitting...",
    allQuestionsAnswered: "All questions answered",
    quizOverview: "Quiz Overview",
    overviewDesc: "Click any number to jump to that question",
    incompleteQuiz: "Incomplete Quiz",
    answerAllQuestions: "Please answer all questions before submitting",
    submitError: "Submit Error",
    
    // Quiz Results
    results: {
      excellent: "Excellent",
      good: "Good", 
      fair: "Fair",
      needsImprovement: "Needs Improvement",
      correct: "Correct",
      total: "Total",
      timeSpent: "Time Spent",
      notRecorded: "Not recorded",
      minutes: "m",
      seconds: "s",
      performanceBreakdown: "Performance Breakdown",
      overallScore: "Overall Score",
      accuracy: "Accuracy",
      averageTimePerQuestion: "Avg. time per question",
      strengths: "Your Strengths",
      areasForImprovement: "Areas for Improvement",
      detailedFeedback: "Question-by-Question Review",
      questionNumber: "Question {{number}}",
      incorrect: "Incorrect",
      retakeQuiz: "Retake Quiz",
      reviewQuestions: "Review Questions",
      continue: "Continue Learning",
      passingScoreNotMet: "Passing score not reached",
      passingScoreRequirement: "You need 80% or higher to pass this quiz",
    },

    // Quiz Management
    createQuiz: "Create Quiz",
    editQuiz: "Edit Quiz",
    deleteQuiz: "Delete Quiz",
    quizTitle: "Quiz Title",
    quizDescription: "Quiz Description",
    addQuestion: "Add Question",
    questionText: "Question Text",
    answerOptions: "Answer Options",
    correctAnswer: "Correct Answer",
    questionType: "Question Type",
    multipleChoice: "Multiple Choice",
    trueFalse: "True/False",
    points: "Points",
    saveQuiz: "Save Quiz",
    publishQuiz: "Publish Quiz",
    unpublishQuiz: "Unpublish Quiz",
    
    // Quiz Statistics
    stats: {
      totalQuizzes: "Total Quizzes",
      completedQuizzes: "Completed",
      averageScore: "Average Score",
      timeSpent: "Total Time",
      bestPerformance: "Best Performance",
      recentActivity: "Recent Quiz Activity",
      passingRate: "Passing Rate",
      improvementNeeded: "Improvement Needed",
      excellentPerformance: "Excellent Performance"
    },

    // Common Quiz Actions
    takeQuiz: "Take Quiz",
    viewResults: "View Results",
    shareResults: "Share Results",
    printCertificate: "Print Certificate",
    downloadResults: "Download Results",
    
    // Certificate Generation Notifications
    quizCompleted: "Quiz Completed!",
    quizCompletedDesc: "Congratulations! You've successfully completed the quiz.",
    certificateGenerated: "Certificate Earned!",
    certificateGeneratedDesc: "You've earned a certificate! Check your certificates page to download it.",
    moduleCompleted: "Module Completed!",
    moduleCompletedDesc: "Great job! You've completed all requirements for this module.",
    courseCompleted: "Course Completed!",
    courseCompletedDesc: "Outstanding! You've completed the entire course.",
    viewCertificates: "View Certificates"
  },

  // AI Playground
  playground: {
    title: "AI Playground",
    description: "Test and compare prompts across multiple AI models. Fine-tune parameters and save your best prompts.",
    savedPrompts: "Saved Prompts",
    loadSavedPrompt: "Load a saved prompt...",
    noSavedPrompts: "No saved prompts yet. Save your first prompt below!",
    promptEditor: "Prompt Editor",
    promptPlaceholder: "Enter your prompt here...",
    promptTitle: "Prompt title (for saving)",
    modelSelection: "Model Selection",
    noModelsAvailable: "No models available",
    modelsLoadError: "Failed to load available models. Please check your configuration.",
    configureApiKey: "Configure OPENROUTER_API_KEY in your environment to access AI models.",
    parameters: "Parameters",
    temperatureLabel: "Temperature",
    temperatureHelp: "Controls randomness. Lower = more focused, Higher = more creative",
    maxTokensLabel: "Max Tokens",
    maxTokensHelp: "Maximum length of the response",
    topPLabel: "Top P",
    topPHelp: "Controls diversity via nucleus sampling",
    runTest: "Run Test",
    runningTest: "Running Test...",
    testResults: "Test Results",
    testingModels: "Testing models...",
    noTestResults: "Run a test to see results from multiple AI models",
    tokens: "tokens",
    copiedToClipboard: "Copied to clipboard",
    responseCopied: "Response has been copied to your clipboard.",
    failedToCopy: "Failed to copy",
    couldNotCopy: "Could not copy to clipboard.",
    promptSaved: "Prompt saved successfully!",
    promptSavedDesc: "Your prompt has been added to your collection.",
    promptDeleted: "Prompt deleted",
    promptDeletedDesc: "Prompt has been removed from your collection.",
    failedToSavePrompt: "Failed to save prompt",
    failedToDeletePrompt: "Failed to delete prompt",
    errorWhileSaving: "An error occurred while saving.",
    errorWhileDeleting: "An error occurred while deleting.",
    emptyPromptTitle: "Empty prompt",
    emptyPromptDesc: "Please enter a prompt to test.",
    noModelsSelected: "No models selected",
    noModelsSelectedDesc: "Please select at least one model to test.",
    missingTitle: "Missing title",
    missingTitleDesc: "Please enter a title for your prompt.",
    emptyPromptContent: "Empty prompt",
    emptyPromptContentDesc: "Please enter prompt content to save.",
    testCompleted: "Test completed successfully!",
    testCompletedDesc: "Tested {{count}} models with total cost ${{cost}}",
    testFailed: "Test failed",
    testFailedGeneric: "Failed to run test",
    charactersCount: "Characters",
    estimatedTokens: "Estimated tokens",
    testsThisMonth: "Tests This Month",
    totalSpent: "Total Spent",
    totalTests: "Total Tests",
    usageAnalytics: "Usage Analytics",
    usageLoadError: "Failed to load usage analytics",
    promptsLoadError: "Failed to load saved prompts",
    loadingModels: "Loading models...",
    loadingPrompts: "Loading prompts...",
    loadingUsage: "Loading usage..."
  },

  // Prompt Library
  promptLibrary: {
    title: "Prompt Library",
    subtitle: "Organize, discover, and share your best prompts with advanced search and collaboration features.",
    
    // Navigation and Tabs
    myPrompts: "My Prompts",
    sharedPrompts: "Shared with Me",
    community: "Community",
    
    // Actions
    createPrompt: "Create Prompt",
    createFirstPrompt: "Create Your First Prompt",
    import: "Import",
    export: "Export",
    use: "Use",
    edit: "Edit", 
    delete: "Delete",
    fork: "Fork",
    share: "Share",
    create: "Create",
    update: "Update",
    save: "Save",
    cancel: "Cancel",
    
    // Search and Filters
    searchPlaceholder: "Search prompts, tags, or content...",
    allCategories: "All Categories",
    filters: "Filters",
    sortBy: "Sort By",
    dateRange: "Date Range",
    tags: "Tags",
    selectedCount: "{{count}} selected",
    loading: "Loading prompts...",
    
    // Sort Options
    sortOptions: {
      recent: "Most Recent",
      title: "Title A-Z", 
      popular: "Most Popular",
      rating: "Highest Rated"
    },
    
    // Date Range Options
    dateRangeOptions: {
      all: "All Time",
      week: "Past Week",
      month: "Past Month", 
      year: "Past Year"
    },
    
    // Categories
    categories: {
      business: "Business",
      creative: "Creative",
      technical: "Technical", 
      research: "Research",
      productivity: "Productivity",
      education: "Education",
      marketing: "Marketing",
      analysis: "Analysis"
    },
    
    // Form Fields
    promptTitle: "Prompt Title",
    promptTitlePlaceholder: "Enter a descriptive title for your prompt",
    promptContent: "Prompt Content", 
    promptContentPlaceholder: "Write your prompt here...",
    category: "Category",
    selectCategory: "Select a category",
    makePublic: "Make Public",
    
    // States and Messages
    noPrompts: "No Prompts Found",
    noPromptsDesc: "No prompts match your current filters. Try adjusting your search or create a new prompt.",
    loadError: "Failed to load prompts",
    
    // Create/Edit Dialog
    editPrompt: "Edit Prompt",
    editPromptDesc: "Modify your prompt details and content.",
    createPromptDesc: "Create a new prompt to add to your library.",
    
    // Success Messages
    promptCreated: "Prompt Created",
    promptCreatedDesc: "Your new prompt has been saved to your library.",
    promptUpdated: "Prompt Updated", 
    promptUpdatedDesc: "Your prompt changes have been saved.",
    promptDeleted: "Prompt Deleted",
    promptDeletedDesc: "The prompt has been removed from your library.",
    promptForked: "Prompt Forked",
    promptForkedDesc: "A copy of the prompt has been added to your library.",
    exportSuccess: "Export Successful",
    exportSuccessDesc: "{{count}} prompts exported successfully.",
    bulkDeleteSuccess: "Prompts Deleted",
    bulkDeleteSuccessDesc: "{{count}} prompts have been deleted.",
    
    // Error Messages
    createFailed: "Failed to Create Prompt",
    updateFailed: "Failed to Update Prompt", 
    deleteFailed: "Failed to Delete Prompt",
    forkFailed: "Failed to Fork Prompt",
    bulkDeleteFailed: "Failed to Delete Prompts",
    missingTitle: "Title Required",
    missingTitleDesc: "Please enter a title for your prompt.",
    missingContent: "Content Required",
    missingContentDesc: "Please enter content for your prompt.",
    
    // Confirmations
    confirmDelete: "Are you sure you want to delete this prompt?",
    confirmBulkDelete: "Are you sure you want to delete {{count}} prompts?",
    
    // Bulk Actions
    deleteSelected: "Delete Selected",
    exportSelected: "Export Selected",
    
    // Metadata and Stats
    uses: "uses",
    createdOn: "Created",
    updatedOn: "Updated",
    usageCount: "{{count}} uses",
    rating: "Rating",
    author: "Author",
    forkedFrom: "Forked from",
    forks: "{{count}} forks",
    
    // View Modes
    gridView: "Grid View",
    listView: "List View",
    
    // Versioning
    versions: "Versions",
    currentVersion: "Current",
    previousVersion: "Previous",
    compareVersions: "Compare Versions",
    restoreVersion: "Restore Version",
    versionHistory: "Version History",
    
    // Sharing
    publicPrompt: "Public Prompt",
    privatePrompt: "Private Prompt", 
    sharedBy: "Shared by {{author}}",
    sharePrompt: "Share Prompt",
    shareLink: "Share Link",
    copyLink: "Copy Link",
    linkCopied: "Link Copied",
    linkCopiedDesc: "Share link has been copied to clipboard.",
    
    // Import/Export
    importPrompts: "Import Prompts", 
    importSuccess: "Import Successful",
    importSuccessDesc: "{{count}} prompts imported successfully.",
    importFailed: "Import Failed",
    exportPrompts: "Export Prompts",
    selectFile: "Select File",
    uploadFile: "Upload File",
    
    // Popular Tags
    popularTags: "Popular Tags",
    suggestedTags: "Suggested Tags",
    addTag: "Add Tag",
    removeTag: "Remove Tag",
    
    // Empty States
    noSearchResults: "No Search Results",
    noSearchResultsDesc: "No prompts found matching your search criteria.",
    emptyLibrary: "Your Library is Empty",
    emptyLibraryDesc: "Start building your prompt collection by creating your first prompt.",
    noCommunityPrompts: "No Community Prompts",
    noCommunityPromptsDesc: "Check back later as the community shares more prompts.",
    
    // Tooltips and Help Text
    forkTooltip: "Create a copy of this prompt in your library",
    shareTooltip: "Share this prompt with others",
    ratingTooltip: "Rate this prompt (1-5 stars)",
    usageTooltip: "Number of times this prompt has been used",
    categoryTooltip: "Prompt category for organization",
    tagsTooltip: "Tags for easy searching and filtering",
    versionTooltip: "View version history and changes",
    
    // Advanced Features
    advancedSearch: "Advanced Search",
    searchInContent: "Search in content",
    searchInTags: "Search in tags", 
    searchInTitles: "Search in titles",
    exactMatch: "Exact match",
    caseSensitive: "Case sensitive",
    regexSearch: "Regex search",
    
    // Statistics
    stats: {
      totalPrompts: "Total Prompts",
      publicPrompts: "Public Prompts", 
      recentlyUsed: "Recently Used",
      mostPopular: "Most Popular",
      topRated: "Top Rated",
      trending: "Trending"
    },
    
    // Templates
    templates: "Templates",
    useTemplate: "Use Template",
    businessTemplate: "Business Template",
    creativeTemplate: "Creative Template",
    technicalTemplate: "Technical Template",
    
    // Collections
    collections: "Collections",
    createCollection: "Create Collection",
    addToCollection: "Add to Collection", 
    removeFromCollection: "Remove from Collection",
    collectionName: "Collection Name",
    collectionDescription: "Collection Description",
    
    // Collaboration
    collaborate: "Collaborate",
    inviteCollaborators: "Invite Collaborators",
    collaborators: "Collaborators", 
    permissions: "Permissions",
    canView: "Can View",
    canEdit: "Can Edit",
    canShare: "Can Share",
    
    // Favorites
    favorites: "Favorites",
    addToFavorites: "Add to Favorites",
    removeFromFavorites: "Remove from Favorites",
    favoriteAdded: "Added to Favorites",
    favoriteRemoved: "Removed from Favorites"
  },

  // Page Metadata
  pageMetadata: {
    playground: {
      title: "AI Playground - PromptMaster",
      description: "Test and compare prompts across multiple AI models including GPT-4, Claude, and Gemini. Fine-tune parameters and optimize your prompts with real-time feedback."
    }
  }
};