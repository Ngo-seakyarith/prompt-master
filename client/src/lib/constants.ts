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
  },
  "prompt-structure": {
    sections: [
      {
        title: "Role & Context",
        content: `The foundation of any effective prompt begins with clearly defining who the AI should be (Role) and what situation it's operating in (Context). These two elements work together to establish the AI's expertise level, perspective, and understanding of your specific needs.

**The Power of Role Definition:**
A well-defined role tells the AI what expertise to draw upon and what perspective to take. Instead of generic responses, you get answers from a specific professional viewpoint with appropriate depth and focus.

**Examples of Role Definition:**
- Generic: "Help me with marketing" → Unclear expertise level
- Better: "You are a marketing manager" → Basic role clarity
- Best: "You are a senior digital marketing manager with 8+ years experience in B2B SaaS companies, specializing in content marketing and lead generation"

**Context: The Situational Foundation:**
Context provides the situational awareness that makes responses relevant and actionable. It includes background information, current challenges, available resources, and specific circumstances.

**Key Context Elements:**
- **Current Situation**: What's happening right now?
- **Background Information**: Relevant history or circumstances
- **Available Resources**: Budget, time, tools, team size
- **Specific Challenges**: What problems need solving?
- **Success Criteria**: How will you measure success?

**Role + Context in Action:**
❌ **Weak**: "Write a business plan"
✅ **Strong**: "You are an experienced business consultant specializing in technology startups. I'm a software engineer with a new app idea for time tracking, but I have no business experience. I need help creating a lean business plan to validate my idea before investing more time. I have $5,000 in savings and 10 hours per week to dedicate to this."`,
        examples: [
          "Role transformation: 'You are a fitness trainer' vs 'You are a certified personal trainer specializing in rehabilitation for desk workers with 10+ years experience'",
          "Context impact: Adding 'I'm 45, work 60-hour weeks, have lower back issues, and can only work out at home for 30 minutes' completely changes the fitness advice",
          "Combined power: Expert role + specific context = highly relevant, actionable recommendations"
        ]
      },
      {
        title: "Task & Template",
        content: `Once you've established who the AI is and the situation, you need to clearly define what you want done (Task) and how you want it presented (Template). These elements ensure your prompt produces exactly the output you need.

**Task Clarity: The Specific Action:**
The task component specifies exactly what you want the AI to accomplish. Vague tasks lead to vague outputs. Be specific about the action, scope, and desired outcome.

**Effective Task Definition:**
- **Action Verbs**: Use specific verbs like "analyze," "create," "evaluate," "design," "optimize"
- **Scope Definition**: Define boundaries and focus areas
- **Success Criteria**: What makes a good result?
- **Deliverable Type**: What exactly should be produced?

**Examples of Task Refinement:**
- Vague: "Help with my presentation"
- Better: "Create an outline for my presentation"
- Best: "Create a detailed slide-by-slide outline for a 20-minute presentation on renewable energy trends, targeting C-level executives, including 3 key statistics, 2 case studies, and a clear call-to-action"

**Template: Structuring the Output:**
The template defines how you want the information organized and presented. This ensures consistency, readability, and immediate usability of the response.

**Common Template Formats:**
- **Lists**: Numbered or bulleted for easy scanning
- **Tables**: Comparing options or organizing data
- **Step-by-step**: Process or instruction guides
- **Frameworks**: Structured analysis (SWOT, pros/cons)
- **Reports**: Executive summary, detailed sections, conclusions

**Template Specification Examples:**
- Basic: "Give me marketing tips"
- Structured: "List 5 marketing tips in bullet points"
- Detailed template: "Present 5 marketing tips using this format: 1) Tip Name (bold), 2) One-sentence description, 3) Implementation steps (3-5 bullets), 4) Expected results, 5) Required resources"

**Task + Template Success Formula:**
Clear Task + Specific Template = Actionable, Well-Organized Output`,
        examples: [
          "Task evolution: 'Review my website' → 'Analyze my e-commerce website for conversion rate optimization' → 'Conduct a comprehensive conversion rate analysis of my e-commerce website, focusing on product pages, checkout flow, and mobile experience'",
          "Template impact: Same analysis request with different templates produces lists vs tables vs detailed reports",
          "Professional formatting: 'Format as an executive summary with 3 sections: Current Performance, Key Issues, Recommended Actions (with priority levels)'"
        ]
      },
      {
        title: "Constraints & Guidelines",
        content: `Constraints are the boundaries and requirements that shape your output. They ensure the AI's response fits your specific needs, resources, and context. Well-defined constraints prevent irrelevant suggestions and keep solutions practical and implementable.

**Types of Constraints:**

**Length & Format Constraints:**
- Word/character limits for specific platforms or formats
- Number of items in lists or recommendations
- Specific formatting requirements

**Resource Constraints:**
- Budget limitations
- Time availability
- Team size and skills
- Available tools and technology

**Audience & Tone Constraints:**
- Technical level of audience
- Formality requirements
- Brand voice and style
- Cultural considerations

**Content Constraints:**
- What to include or exclude
- Required elements or information
- Compliance or legal requirements
- Industry-specific guidelines

**Practical Constraint Examples:**

**Budget Constraints:**
- "Marketing budget under $1,000/month"
- "Solutions must use only free tools"
- "Requiring minimal additional staff"

**Time Constraints:**
- "Can be implemented in 2 weeks"
- "Requires no more than 5 hours/week maintenance"
- "Must launch before holiday season"

**Skill Constraints:**
- "Team has no coding experience"
- "Must be executable by one person"
- "Requires only basic design skills"

**Platform Constraints:**
- "Must work on mobile devices"
- "Compatible with existing WordPress site"
- "Suitable for LinkedIn professional network"

**The Constraint Framework:**
1. **Must Have**: Non-negotiable requirements
2. **Should Have**: Preferred elements
3. **Could Have**: Nice-to-have features
4. **Won't Have**: Explicit exclusions

**Effective Constraint Communication:**
Instead of: "Keep it simple"
Use: "Use only free tools, require less than 2 hours setup time, and be manageable by someone with basic computer skills"

**Constraint Balance:**
Too few constraints = Generic, impractical advice
Too many constraints = Overly limited, rigid solutions
Right balance = Specific, actionable, implementable recommendations`,
        examples: [
          "Resource reality: 'Budget under $500, team of 2 people, must launch in 30 days' eliminates complex solutions",
          "Audience constraints: 'Explain to non-technical executives in under 200 words' shapes complexity and language",
          "Platform constraints: 'Must work on Instagram Stories with no external links' completely changes content strategy",
          "Compliance constraints: 'Must follow GDPR requirements and healthcare privacy laws' adds specific legal boundaries"
        ]
      }
    ],
    exercises: [
      {
        title: "Exercise 1: Defining Clear Roles",
        description: "Practice creating specific, effective role definitions that provide the right level of expertise and perspective for different scenarios.",
        template: `Create detailed role definitions for these three scenarios:

**Scenario A:** Getting help with personal finance and budgeting
**Scenario B:** Improving team communication in a remote startup
**Scenario C:** Creating content for a fitness blog

For each scenario, write:
1. A basic role definition (generic)
2. An improved role definition (more specific)
3. An expert role definition (highly detailed with relevant experience)

**Example format:**
Scenario A - Personal Finance:
- Basic: "You are a financial advisor"
- Improved: "You are a certified financial planner"
- Expert: "You are a certified financial planner with 15+ years experience helping young professionals in tech create sustainable budgeting systems and build long-term wealth"

Complete for all three scenarios:`
      },
      {
        title: "Exercise 2: Adding Comprehensive Context",
        description: "Learn to provide rich, relevant context that helps AI understand your specific situation and needs.",
        template: `Choose one of these business challenges and provide comprehensive context:

1. A small restaurant wants to increase customer retention
2. A freelance graphic designer needs to scale their business
3. A nonprofit organization wants to improve volunteer engagement

Provide context for your chosen scenario including:

**Situational Context:**
- Current state and main challenges
- Industry or market factors

**Resource Context:**
- Available budget and timeline
- Team size and skills
- Current tools and systems

**Goal Context:**
- Specific objectives and success metrics
- Priority areas for improvement
- Long-term vision

**Constraint Context:**
- Limitations and boundaries
- Must-avoid approaches
- Compliance or other requirements

Chosen scenario: [Select 1, 2, or 3]

Comprehensive context:`
      },
      {
        title: "Exercise 3: Structuring Specific Tasks",
        description: "Transform vague requests into clear, actionable tasks with specific outcomes and deliverables.",
        template: `Transform these vague task requests into clear, specific tasks:

**Vague Request 1:** "Help me improve my LinkedIn profile"
**Vague Request 2:** "Create a marketing strategy for my business"
**Vague Request 3:** "Write better emails to my team"

For each request, create:

**A. Clear Task Definition:**
- Specific action verb
- Defined scope and focus
- Clear success criteria

**B. Specific Deliverables:**
- What exactly will be produced
- Format and structure
- Key components to include

**Example transformation:**
Vague: "Help me improve my LinkedIn profile"
Clear Task: "Analyze my current LinkedIn profile and create an optimization plan to increase profile views by 50% and generate 5+ relevant connection requests per week"
Deliverables: "Provide a detailed audit with specific changes for headline, summary, experience sections, plus a content posting strategy with 3 sample posts"

Complete transformations for all three requests:`
      },
      {
        title: "Exercise 4: Creating Effective Templates",
        description: "Design output templates that organize information clearly and make it immediately actionable for your specific needs.",
        template: `Design templates for three different output types:

**Template A:** A competitive analysis comparing 3 business competitors
**Template B:** A step-by-step implementation guide for a new process
**Template C:** A weekly content calendar for social media

For each template, specify:

1. **Overall Structure:** How should the information be organized?
2. **Section Headers:** What main categories or sections?
3. **Data Fields:** What specific information should be included?
4. **Format Details:** Lists, tables, paragraphs, or other formats?
5. **Visual Organization:** How to make it easy to scan and use?

**Example template:**
Template A - Competitive Analysis:
- Overall Structure: Table format with companies as columns, analysis factors as rows
- Section Headers: Company Overview, Pricing Strategy, Marketing Approach, Strengths, Weaknesses
- Data Fields: Company name, website, target market, key products, pricing tiers, marketing channels, competitive advantages, vulnerabilities
- Format: Comparison table with summary insights below
- Visual Organization: Color-coded cells for quick comparison, bullet points for details

Design templates for all three output types:`
      },
      {
        title: "Exercise 5: Building Complete Structured Prompts",
        description: "Combine all five components (Role, Context, Task, Template, Constraints) into a comprehensive, well-structured prompt.",
        template: `Create a complete structured prompt for this scenario:
**Challenge:** A local gym owner wants to create a member retention program to reduce monthly cancellations by 40% within 6 months.

Build your prompt using all five components:

**ROLE:**
Define who the AI should be (expertise, experience, specialization)

**CONTEXT:**
Provide comprehensive background:
- Business situation and challenges
- Current performance metrics
- Available resources
- Market factors

**TASK:**
Specify exactly what to accomplish:
- Clear action and scope
- Specific deliverables
- Success criteria

**TEMPLATE:**
Define the output structure:
- Overall organization
- Required sections
- Format specifications

**CONSTRAINTS:**
Set boundaries and requirements:
- Resource limitations
- Implementation requirements
- Must-have vs nice-to-have elements

**Your Complete Structured Prompt:**
[Write out the full prompt incorporating all five components]

**Self-Assessment:**
Review your prompt and verify:
- Is the role specific and relevant?
- Does the context provide sufficient background?
- Is the task clear and actionable?
- Will the template produce organized output?
- Are constraints realistic and helpful?`
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
    title: "Module 2: Prompt Structure Mastery",
    description: "Master the 5 key components of effective prompt structure through progressive exercises that teach Role, Context, Task, Template, and Constraints.",
    exercises: MODULE_CONTENT["prompt-structure"].exercises
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
