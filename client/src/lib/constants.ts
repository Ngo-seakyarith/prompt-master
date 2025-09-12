export const MODULES = [
  {
    id: "basic-prompting",
    title: "Basic Prompting",
    description: "Learn the fundamentals of prompting with and without context. Understand how context shapes AI responses.",
    icon: "fas fa-play",
    order: 1
  },
  {
    id: "prompt-structure", 
    title: "Prompt Structure",
    description: "Master the anatomy of effective prompts: role, task, context, template, and constraints.",
    icon: "fas fa-layer-group",
    order: 2
  },
  {
    id: "advanced-techniques",
    title: "Advanced Techniques", 
    description: "Explore chain-of-thought, few-shot learning, and advanced prompting strategies.",
    icon: "fas fa-rocket",
    order: 3
  },
  {
    id: "prompt-refinement",
    title: "Prompt Refinement",
    description: "Learn iterative improvement techniques and testing strategies for optimal results.",
    icon: "fas fa-tools", 
    order: 4
  },
  {
    id: "practical-applications",
    title: "Practical Applications",
    description: "Apply prompt engineering to productivity, automation, creativity, and business planning.",
    icon: "fas fa-briefcase",
    order: 5
  }
];

export const MODULE_CONTENT = {
  "basic-prompting": {
    sections: [
      {
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
      {
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
      {
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
    ],
    exercises: [
      {
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
      {
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
      {
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
      {
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
      {
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
    ]
  }
};

export const SAMPLE_EXERCISES = {
  "basic-prompting": {
    title: "Module 1: Basic Prompting Fundamentals",
    description: "Master the fundamentals of effective prompting through 5 progressive exercises that teach you when and how to use context.",
    exercises: MODULE_CONTENT["basic-prompting"].exercises
  },
  "prompt-structure": {
    title: "Structure a business analysis prompt",
    description: "Create a well-structured prompt using the RTCTC framework for business analysis.",
    template: `Role: You are a senior business analyst with expertise in market research...
Task: Your task is to...
Context: The situation is...
Template: Format your response as...
Constraints: You must...`
  },
  "advanced-techniques": {
    title: "Chain-of-thought reasoning",
    description: "Create a prompt that uses chain-of-thought to solve a complex business problem.",
    template: `Think through this step by step:

1. First, analyze the current situation...
2. Then, identify the key challenges...
3. Next, evaluate potential solutions...
4. Finally, recommend the best approach...`
  },
  "prompt-refinement": {
    title: "Iterative prompt improvement",
    description: "Take a basic prompt and refine it through multiple iterations.",
    template: `Version 1 (Basic): Write a marketing plan.

Version 2 (Improved): ...

Version 3 (Further refined): ...`
  },
  "practical-applications": {
    title: "Business planning prompt",
    description: "Create prompts for various business planning scenarios including strategic planning, marketing plans, and functional planning.",
    template: `Create a prompt for developing a comprehensive business plan that includes market analysis, competitive landscape, financial projections, and operational strategy.`
  }
};
