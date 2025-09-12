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
  },
  "advanced-techniques": {
    sections: [
      {
        title: "Zero-shot & Few-shot Prompting",
        content: `Zero-shot and few-shot prompting are fundamental advanced techniques that leverage the AI's training to perform tasks with minimal or no examples. These techniques unlock the AI's ability to generalize and adapt to new tasks without extensive training data.

**Zero-shot Prompting:**
Zero-shot prompting asks the AI to perform a task without providing any examples. It relies entirely on the AI's training and your prompt's clarity to understand and execute the request. This technique is powerful for well-understood tasks where the AI can draw from its extensive training.

**Key Principles of Zero-shot Prompting:**
- **Clear Task Definition**: Be explicit about what you want accomplished
- **Context Setting**: Provide enough background for the AI to understand the situation  
- **Output Specification**: Define exactly what format and type of response you need
- **Role Assignment**: Give the AI a specific expertise role to draw upon

**Few-shot Prompting:**
Few-shot prompting provides 2-5 examples to teach the AI the desired pattern, format, or approach. This technique is incredibly effective for establishing consistency and showing rather than just telling the AI what you want.

**When to Use Each Technique:**
- **Zero-shot**: Well-understood tasks, general knowledge questions, standard business processes
- **Few-shot**: Custom formats, specific styles, complex patterns, maintaining consistency

**Zero-shot vs Few-shot Impact:**
The difference in output quality can be dramatic. Few-shot prompting often produces significantly more consistent and targeted results because it demonstrates the exact pattern you want replicated.`,
        examples: [
          "Zero-shot: 'Write a product description for a wireless mouse' → Generic description with standard features",
          "Few-shot with 3 examples: 'Write product descriptions following these patterns: [Example 1: Feature-Benefit-Social Proof], [Example 2: Problem-Solution-Results], [Example 3: Story-Feature-CTA]' → Highly consistent, formatted descriptions",
          "Zero-shot business analysis: 'Analyze the competitive landscape for food delivery apps' → Broad, general analysis",
          "Few-shot business analysis: 'Analyze competitive landscapes like these examples: [3 detailed competitor analyses with specific frameworks]' → Structured, consistent analysis following proven patterns"
        ]
      },
      {
        title: "Chain-of-thought Prompting",
        content: `Chain-of-thought prompting explicitly guides the AI through step-by-step reasoning processes. This advanced technique dramatically improves accuracy for complex problems by making the AI's thinking process visible and systematic.

**The Power of Explicit Reasoning:**
By asking the AI to "show its work" and think through problems step-by-step, you get more reliable, traceable, and often more creative solutions. This technique is especially powerful for analysis, problem-solving, and decision-making tasks.

**Core Components of Chain-of-thought:**
- **Step-by-step Instructions**: Break complex tasks into logical sequences
- **Reasoning Requests**: Ask the AI to explain its thinking process  
- **Verification Steps**: Include checkpoints to validate logic
- **Multiple Perspectives**: Consider different angles and approaches

**Advanced Chain-of-thought Techniques:**
1. **Sequential Reasoning**: "First analyze X, then consider Y, finally evaluate Z"
2. **Conditional Logic**: "If condition A, then approach B, otherwise approach C"
3. **Iterative Refinement**: "Start with initial analysis, then refine based on these criteria"
4. **Multi-perspective Analysis**: "Examine this from technical, business, and user perspectives"

**Chain-of-thought for Complex Business Problems:**
This technique excels at strategic planning, risk assessment, market analysis, and any situation requiring systematic thinking. By making the reasoning explicit, you can verify the logic and identify potential flaws or oversights.

**Quality Improvement:**
Studies show chain-of-thought prompting can improve accuracy by 20-50% on complex reasoning tasks compared to direct instruction prompts. The key is structuring the reasoning process appropriately for your specific problem type.`,
        examples: [
          "Basic request: 'Should we launch in Europe?' → Simple yes/no with basic reasoning",
          "Chain-of-thought: 'Analyze European expansion step-by-step: 1) Assess market size and demand, 2) Evaluate regulatory requirements, 3) Calculate resource needs, 4) Identify risks and mitigation strategies, 5) Compare ROI to other opportunities, 6) Make recommendation with supporting logic' → Comprehensive, traceable analysis",
          "Problem-solving: 'Customer retention dropped 15%. Walk through a systematic diagnosis: 1) Analyze when the drop started, 2) Identify potential causes, 3) Prioritize by likelihood and impact, 4) Design tests to validate hypotheses, 5) Recommend action plan'",
          "Strategic decision: 'We're choosing between Product A and Product B. Think through this systematically: First, define success criteria. Then evaluate each option against these criteria. Consider resource requirements, market timing, and competitive dynamics. Finally, weigh risks and recommend with clear reasoning.'"
        ]
      },
      {
        title: "Creative Prompting",
        content: `Creative prompting unlocks the AI's innovative potential while maintaining practical applicability. This advanced technique balances creative freedom with strategic direction to generate novel solutions, breakthrough ideas, and original content that drives real business value.

**The Art of Structured Creativity:**
Effective creative prompting doesn't just ask for "creative ideas." It provides frameworks that channel creativity toward productive outcomes. The best creative prompts combine imaginative freedom with strategic constraints that ensure usefulness.

**Key Creative Prompting Strategies:**
- **Constraint-based Creativity**: Use limitations to spark innovation
- **Perspective Shifting**: Ask for ideas from unusual viewpoints  
- **Combination Techniques**: Merge unrelated concepts for novel solutions
- **Scenario Building**: Create hypothetical situations to explore possibilities
- **Analogical Thinking**: Draw insights from different industries or domains

**Advanced Creative Frameworks:**
1. **SCAMPER Method**: Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse
2. **Six Thinking Hats**: Explore ideas from emotional, logical, creative, cautious, optimistic, and process perspectives
3. **"What if" Scenarios**: Push boundaries with hypothetical constraints or opportunities
4. **Cross-industry Innovation**: Apply solutions from one field to another

**Balancing Creativity and Practicality:**
The most valuable creative prompts generate ideas that are both innovative and implementable. Include constraints like budget, timeline, resources, and target audience to ensure creative outputs remain grounded in reality.

**Creative Prompting for Business Innovation:**
This technique excels at product development, marketing campaigns, problem-solving, process improvement, and strategic planning. By systematically exploring creative possibilities, you can discover breakthrough solutions that competitors miss.`,
        examples: [
          "Basic creative request: 'Give me marketing ideas for our app' → Generic marketing tactics",
          "Structured creative prompt: 'Generate 10 unconventional marketing ideas for our meditation app by applying successful strategies from these 3 different industries: gaming, fitness, and food delivery. For each idea, explain the cross-industry inspiration and how to adapt it for our audience' → Innovative, actionable ideas",
          "Creative problem-solving: 'Our remote team feels disconnected. Think like a theme park designer: How would Disney create magical connection experiences for distributed teams? Generate 5 ideas that bring that same engagement and wonder to remote work'",
          "Product innovation: 'What if our project management tool worked like a cooking show? Brainstorm features that make project planning as engaging and collaborative as following a recipe with friends. Consider the storytelling, timing, and social elements.'",
          "Creative strategy: 'Imagine our B2B software company operates like a Netflix series. How would we structure our customer journey, product releases, and marketing to create the same anticipation and binge-worthy engagement? Think in terms of seasons, episodes, and cliffhangers.'"
        ]
      }
    ],
    exercises: [
      {
        title: "Exercise 1: Zero-shot Prompting Mastery",
        description: "Master the art of zero-shot prompting by creating clear, comprehensive prompts that achieve specific outcomes without examples.",
        template: `Choose one of these business scenarios for zero-shot prompting:

1. Create a customer onboarding email sequence for a SaaS product
2. Develop a crisis communication plan for a product recall
3. Design a performance review framework for remote employees

**Your Task:**
Create a zero-shot prompt that produces high-quality results without any examples. Your prompt should include:

**Role Definition:**
- Specific expertise the AI should draw upon
- Years of experience and specialization areas
- Industry context and background

**Clear Context:**
- Detailed situation and background
- Stakeholders and constraints
- Success criteria and objectives

**Specific Task Instructions:**
- Exact deliverables needed
- Format and structure requirements
- Quality standards and criteria

**Chosen Scenario:** [Select 1, 2, or 3]

**Your Zero-shot Prompt:**
[Write your complete prompt here - aim for 150-250 words]

**Expected Outcome:**
Briefly describe what type of response you expect and why your prompt structure should produce quality results.`
      },
      {
        title: "Exercise 2: Few-shot Learning Examples",
        description: "Design few-shot prompts that teach specific patterns and ensure consistent, high-quality outputs through strategic examples.",
        template: `Create a few-shot prompting system for generating customer case studies that convert prospects into buyers.

**Your Task:**
Design 3 example case studies that demonstrate the pattern you want the AI to follow, then create a prompt that uses these examples to generate new case studies.

**Pattern Elements to Include:**
- Hook that grabs attention
- Customer challenge description
- Solution implementation details
- Specific results with metrics
- Customer quote or testimonial
- Call-to-action

**Example 1: [Industry/Company Type]**
[Write a 100-150 word case study following your chosen pattern]

**Example 2: [Different Industry/Company Type]**
[Write a 100-150 word case study following the same pattern]

**Example 3: [Third Industry/Company Type]**
[Write a 100-150 word case study following the same pattern]

**Your Few-shot Prompt:**
Now create the complete prompt that uses these examples to generate new case studies. Include:
- Instructions to follow the demonstrated pattern
- Explanation of what makes the pattern effective
- Specific requirements for new case studies

**Test Case:**
Describe a hypothetical customer scenario you'd use to test your few-shot prompt and explain why this approach would be more effective than zero-shot prompting.`
      },
      {
        title: "Exercise 3: Chain-of-thought Reasoning",
        description: "Build sophisticated reasoning prompts that guide AI through complex analysis and decision-making processes.",
        template: `Business Challenge: A mid-sized company (200 employees) is considering whether to build an internal app or hire an external development team.

**Your Task:**
Create a chain-of-thought prompt that systematically analyzes this decision through logical steps.

**Design Your Reasoning Chain:**

**Step 1 - Initial Assessment:**
What should the AI analyze first and why?

**Step 2 - Cost Analysis:**
What cost factors should be considered and how?

**Step 3 - Capability Evaluation:**
How should internal capabilities be assessed?

**Step 4 - Risk Assessment:**
What risks should be identified and evaluated?

**Step 5 - Timeline Considerations:**
How should time-to-market factors be weighed?

**Step 6 - Quality and Maintenance:**
What long-term factors need consideration?

**Step 7 - Final Decision Framework:**
How should all factors be synthesized into a recommendation?

**Your Complete Chain-of-thought Prompt:**
Write the full prompt (200-300 words) that guides the AI through this reasoning process. Include:
- Clear step-by-step instructions
- What to consider at each step
- How steps build on each other
- Request for explicit reasoning at each stage

**Validation Questions:**
List 3 follow-up questions you could ask to verify the quality of the AI's reasoning process.`
      },
      {
        title: "Exercise 4: Creative Prompt Development",
        description: "Develop creative prompts that generate innovative solutions while maintaining practical applicability and business value.",
        template: `Challenge: Your company's employee engagement scores have plateaued. Traditional solutions (team building, surveys, benefits) aren't creating breakthrough improvements.

**Your Task:**
Create a creative prompt that generates innovative engagement solutions by thinking outside conventional approaches.

**Choose Your Creative Framework:**
Select one approach for your creative prompt:

A) **Cross-Industry Inspiration**: Apply engagement strategies from entertainment, sports, or hospitality
B) **"What If" Scenarios**: Reimagine work through hypothetical constraints or possibilities  
C) **Analogical Thinking**: Treat your workplace like something completely different (ecosystem, game, community, etc.)
D) **Constraint-Based Innovation**: Use specific limitations to spark creative solutions

**Your Creative Prompt Structure:**

**Creative Framework:** [Choose A, B, C, or D above]

**Setup and Context:**
- Current engagement challenge details
- What hasn't worked and why
- Creative direction and inspiration source

**Creative Challenge:**
- Specific creative task with imaginative elements
- Practical constraints to keep ideas implementable
- Success criteria that balance innovation with feasibility

**Output Requirements:**
- Number and type of ideas needed
- Format for presenting solutions
- Implementation considerations

**Your Complete Creative Prompt:**
[Write your full creative prompt - 150-250 words]

**Innovation Catalyst:**
Explain what specific element of your prompt is designed to spark breakthrough thinking and why this approach could generate solutions that traditional brainstorming might miss.`
      },
      {
        title: "Exercise 5: Advanced Technique Combination",
        description: "Master the integration of multiple advanced techniques to create sophisticated, multi-layered prompts for complex business challenges.",
        template: `Complex Business Scenario: A B2B software company needs to pivot their product strategy due to changing market conditions. They need comprehensive analysis and creative solutions that consider multiple stakeholder perspectives.

**Your Task:**
Create a sophisticated prompt that combines multiple advanced techniques to address this complex challenge.

**Required Integration:**
Your prompt must incorporate at least 3 of these advanced techniques:
- Zero-shot or few-shot prompting
- Chain-of-thought reasoning  
- Creative problem-solving
- Multi-perspective analysis
- Iterative refinement

**Design Your Multi-layered Prompt:**

**Phase 1 - Initial Analysis:**
What technique will you use for foundational assessment?
- Chosen technique: _______________
- Why this technique for this phase: _______________

**Phase 2 - Creative Exploration:**
How will you generate innovative solutions?
- Chosen technique: _______________  
- Why this technique for this phase: _______________

**Phase 3 - Systematic Evaluation:**
How will you analyze and refine solutions?
- Chosen technique: _______________
- Why this technique for this phase: _______________

**Integration Strategy:**
How will these techniques work together and build upon each other?

**Your Complete Advanced Prompt:**
Write your sophisticated, multi-technique prompt (300-400 words) that seamlessly integrates your chosen approaches.

**Expected Outcome:**
Describe the type and quality of response you expect from this advanced prompt and explain how combining techniques creates superior results compared to using any single technique alone.

**Technique Synergy Analysis:**
Explain how your chosen techniques complement each other and what unique insights this combination should produce.`
      }
    ]
  },
  "prompt-refinement": {
    sections: [
      {
        title: "Persona & Audience Patterns",
        content: `The Persona and Audience Persona patterns are fundamental refinement techniques that dramatically improve prompt effectiveness by establishing clear identity and context.

**The Persona Pattern:**
This pattern assigns a specific role, expertise, or character to the AI, enabling it to respond from a particular perspective with appropriate knowledge and tone.

**Structure:**
"You are [specific role/expertise]. [Your task/request]"

**Why Persona Patterns Work:**
- Activates relevant knowledge domains in the AI
- Sets appropriate tone and communication style  
- Provides context for decision-making and advice
- Reduces generic or unfocused responses

**Persona Pattern Examples:**

❌ **Generic**: "Help me with my resume"
✅ **Persona Pattern**: "You are a senior HR manager with 15+ years of experience in tech recruiting. Review my software engineer resume and provide specific feedback to increase interview callbacks."

❌ **Basic**: "Write a workout plan"  
✅ **Persona Pattern**: "You are a certified personal trainer specializing in strength training for beginners. Create a 12-week progressive workout plan for someone who has never lifted weights before."

**The Audience Persona Pattern:**
This pattern defines who the output is for, allowing the AI to tailor complexity, tone, and content appropriately.

**Structure:** 
"Create [content] for [specific audience with details]. [Additional context]"

**Audience Persona Examples:**

❌ **Vague**: "Explain blockchain technology"
✅ **Audience Persona**: "Explain blockchain technology to a 65-year-old small business owner who is comfortable with basic computer use but has no technical background. Focus on practical benefits and avoid jargon."

❌ **Generic**: "Write a product description"
✅ **Audience Persona**: "Write a product description for our noise-canceling headphones targeting remote workers aged 28-45 who struggle with home office distractions. Focus on productivity benefits and work-from-home use cases."

**Combining Persona + Audience Patterns:**
The most powerful approach combines both patterns for maximum specificity and relevance.

**Combined Pattern Template:**
"You are [expert persona]. Create [content] for [target audience]. [Specific requirements and context]"

**Combined Example:**
"You are a pediatric nutritionist with expertise in picky eaters. Create a meal planning guide for parents of children aged 4-8 who refuse to eat vegetables. Include 14 kid-friendly recipes, shopping lists, and strategies for introducing new foods gradually."`,
        examples: [
          "Marketing persona: 'You are a growth marketing specialist at a B2B SaaS company' → Activates specific marketing knowledge and context",
          "Teaching persona: 'You are a middle school science teacher' → Adjusts complexity and explanation style appropriately", 
          "Target audience: 'Create content for busy executives who have 30 seconds to understand the key points' → Shapes format and depth",
          "Combined power: Expert persona + specific audience = highly targeted, relevant content"
        ]
      },
      {
        title: "Question Refinement Techniques",
        content: `Question refinement transforms vague requests into precise, actionable prompts that generate focused, valuable responses. This pattern systematically improves prompt clarity and specificity.

**The Question Refinement Process:**

**Step 1: Identify the Core Need**
What is the fundamental goal or problem you're trying to address?

**Step 2: Add Specificity Layers**
- Context: What's the situation?
- Scope: What should be included/excluded?
- Format: How should the response be structured?
- Constraints: What limitations exist?

**Step 3: Define Success Criteria**
What would make this response truly useful?

**Question Refinement Examples:**

**Example 1: Business Strategy**
❌ **Vague**: "How can I grow my business?"
🔄 **Better**: "How can I grow my consulting business?"
🔄 **More specific**: "How can I grow my marketing consulting business from $10K to $50K monthly revenue?"
✅ **Refined**: "You are a business growth consultant. I run a digital marketing consulting firm serving small businesses, currently at $10K monthly revenue with 2 clients. I want to reach $50K monthly revenue within 18 months. I have 20 hours/week available and a $2K monthly budget. What's a systematic growth strategy focusing on service expansion and client acquisition?"

**Example 2: Technical Learning**
❌ **Vague**: "How do I learn Python?"
🔄 **Better**: "What's the best way to learn Python programming?"
🔄 **More specific**: "How should I learn Python for data analysis as a complete beginner?"
✅ **Refined**: "You are a senior data scientist and programming instructor. Create a 90-day learning plan for Python data analysis targeted at a marketing professional with no programming experience. I can dedicate 1 hour daily and prefer hands-on projects. Include specific resources, milestone projects, and ways to measure progress toward analyzing real business data."

**The 5W+H Framework for Question Refinement:**
- **Who**: Who is involved? Who is the audience?
- **What**: What exactly do you want to accomplish?
- **When**: What's the timeline or urgency?
- **Where**: What's the context or environment?
- **Why**: What's the underlying goal or motivation?
- **How**: What approach, format, or method do you prefer?

**Refinement Checklist:**
✅ Is the request specific enough to avoid generic responses?
✅ Have I provided relevant background context?
✅ Are my constraints and preferences clear?
✅ Is the desired outcome well-defined?
✅ Would someone else understand exactly what I need?

**Common Refinement Mistakes to Avoid:**
- Adding too much irrelevant context
- Making the prompt overly complex
- Not specifying the output format
- Forgetting to mention important constraints
- Being too narrow and limiting creativity

**Progressive Refinement Technique:**
Start with your basic question, then systematically add layers:
1. Basic question → Add context
2. Add context → Specify format  
3. Specify format → Include constraints
4. Include constraints → Define success criteria`,
        examples: [
          "Context refinement: 'Help with presentation' → 'Create a 20-minute investor pitch for a fintech startup seeking Series A funding'",
          "Format specification: 'Analyze competitors' → 'Create a competitor analysis table comparing 5 key features across 3 main rivals'",
          "Constraint addition: 'Marketing plan' → 'Marketing plan using only organic social media with $0 ad budget for B2B software'",
          "Success criteria: 'Improve website' → 'Increase website conversion rate by 25% through UX improvements targeting mobile users'"
        ]
      },
      {
        title: "Cognitive Verification Methods",
        content: `The Cognitive Verifier pattern builds quality control directly into your prompts, ensuring more accurate, reliable, and well-reasoned responses by asking the AI to verify its own work.

**What is Cognitive Verification?**
This pattern instructs the AI to double-check its reasoning, validate its conclusions, or examine its response from multiple angles before providing the final output.

**Core Verification Approaches:**

**1. Self-Verification Pattern**
Ask the AI to check its own work and reasoning process.

**Template**: "[Your main request]. Before responding, verify your answer by [specific verification method]."

**Example:**
❌ **No verification**: "Calculate the ROI for this marketing campaign with $10K spend and $45K revenue."
✅ **With verification**: "Calculate the ROI for this marketing campaign with $10K spend and $45K revenue. Before providing your final answer, double-check your calculation method and verify the formula you're using is correct for marketing ROI."

**2. Multi-Perspective Verification**
Have the AI examine the topic from different viewpoints or stakeholder perspectives.

**Example:**
"Analyze this business decision to switch to remote work. Before concluding, examine this decision from three perspectives: employee satisfaction, operational costs, and productivity metrics. Note any conflicting considerations."

**3. Step-by-Step Reasoning Verification**
Ask the AI to show its work and verify each step of its reasoning process.

**Template**: "[Request]. Show your step-by-step reasoning and verify each step before moving to the next."

**Example:**
"Create a pricing strategy for our SaaS product. Walk through your reasoning step-by-step: 1) Market analysis, 2) Cost calculations, 3) Competitor comparison, 4) Value proposition alignment. Verify each step makes logical sense before proceeding to the next."

**4. Assumption Checking**
Have the AI identify and validate the assumptions underlying its recommendations.

**Example:**
"Recommend a marketing channel for our B2B startup. Before finalizing your recommendation, list the key assumptions you're making about our target market, budget, and goals. Verify these assumptions align with the information provided."

**5. Error Detection Pattern**
Ask the AI to actively look for potential errors or problems in its response.

**Template**: "[Main request]. After generating your response, review it specifically looking for [potential error types] and correct any issues you find."

**Advanced Verification Techniques:**

**Cross-Reference Verification:**
"Research the benefits of intermittent fasting. Cross-reference your findings with at least 3 different types of evidence (scientific studies, medical expert opinions, and documented case studies) before summarizing."

**Scenario Testing:**
"Recommend a crisis communication strategy. Test your strategy against these three scenarios: social media backlash, product recall, and data breach. Adjust your recommendations based on how well they work across all scenarios."

**Bias Detection:**
"Analyze the pros and cons of remote work policies. Before concluding, check your analysis for potential bias toward either position and ensure you're presenting balanced viewpoints with equal depth."

**Practical Verification Integration:**

**For Research Tasks:**
"[Research request]. Verify your information by cross-checking with multiple sources and flag any claims where sources conflict or provide limited evidence."

**For Creative Work:**  
"[Creative request]. Review your output to ensure it meets all specified criteria and constraints. Check for consistency in tone, style, and messaging throughout."

**For Technical Solutions:**
"[Technical request]. Verify your solution by walking through a test case and checking for potential edge cases or failure points."

**Building Verification Habits:**
- Add verification requests to complex or high-stakes prompts
- Use verification when accuracy is critical
- Include verification for multi-step processes
- Apply verification when dealing with sensitive topics`,
        examples: [
          "Research verification: 'Find data on market size, then verify by cross-referencing at least 2 independent sources and noting any discrepancies'",
          "Logic verification: 'Create a business model, then check if all revenue streams align with your target customer segments'",
          "Completeness verification: 'Design an onboarding process, then review to ensure you've covered all user journey stages from signup to activation'",
          "Assumption verification: 'Recommend a technology stack, then list and validate all assumptions about team size, budget, and technical requirements'"
        ]
      }
    ],
    exercises: [
      {
        title: "Exercise 1: Persona Pattern Mastery",
        description: "Practice implementing the persona pattern to transform generic prompts into expert-level requests with appropriate perspective and knowledge.",
        template: `Transform these generic prompts using the persona pattern:

**Prompt A:** "Help me write better emails"
**Prompt B:** "Create a budget for my small business" 
**Prompt C:** "Explain how to improve customer service"

For each prompt, create a persona-enhanced version that:
1. Assigns a specific expert role to the AI
2. Includes relevant experience/specialization details
3. Maintains the core request while adding expert perspective

**Format for each:**
- **Original prompt:** [paste the generic prompt]
- **Expert persona:** [define who the AI should be]
- **Persona-enhanced prompt:** [complete refined prompt]

**Example:**
- Original prompt: "Help me write better emails"
- Expert persona: Senior communications director at a Fortune 500 company with expertise in executive communication
- Persona-enhanced prompt: "You are a senior communications director at a Fortune 500 company with 12+ years of experience in executive communication. Help me improve my email writing to be more concise, professional, and action-oriented for cross-functional stakeholder communication."

Complete this exercise for all three prompts:`
      },
      {
        title: "Exercise 2: Question Refinement Workshop", 
        description: "Master the systematic process of refining vague questions into precise, actionable prompts using the 5W+H framework.",
        template: `Take this vague business question through the complete refinement process:

**Initial Question:** "How can I improve my website?"

**Step 1: Apply 5W+H Analysis**
Answer each question to add specificity:
- **Who:** Who is your target audience? Who will use the website?
- **What:** What specific improvements are you seeking? (traffic, sales, user experience, etc.)
- **When:** What's your timeline for improvements?
- **Where:** What part of the website needs the most attention?
- **Why:** What's driving this need for improvement? What's the business goal?
- **How:** What's your budget and available resources?

**Step 2: Progressive Refinement**
Show 4 versions of the question, each adding more specificity:
- Version 1: [Original vague question]
- Version 2: [Add basic context]
- Version 3: [Add specific goals and constraints]
- Version 4: [Add format and success criteria]

**Step 3: Final Refined Prompt**
Create a comprehensive, specific prompt that includes:
- Clear context and background
- Specific measurable goals
- Resource constraints
- Desired output format
- Success criteria

Your refined question should be specific enough that two different people would interpret it the same way.`
      },
      {
        title: "Exercise 3: Cognitive Verifier Implementation",
        description: "Learn to build quality control into your prompts using cognitive verification methods to ensure accurate, well-reasoned responses.",
        template: `Add cognitive verification to these three scenarios:

**Scenario A:** Data Analysis Request
Original: "Analyze this customer feedback data and recommend improvements."

**Scenario B:** Strategic Decision
Original: "Should we expand to the European market next year?"

**Scenario C:** Technical Recommendation  
Original: "What's the best database solution for our e-commerce platform?"

For each scenario:

**1. Choose Your Verification Method:**
- Self-verification (double-check calculations/logic)
- Multi-perspective analysis (different stakeholder views)
- Step-by-step reasoning (show and verify each step)
- Assumption checking (identify and validate assumptions)
- Error detection (actively look for flaws)

**2. Enhanced Prompt with Verification:**
Rewrite the prompt to include your chosen verification method

**3. Verification Rationale:**
Explain why you chose that verification method and what specific errors or issues it helps prevent

**Example for Scenario A:**
- Verification Method: Step-by-step reasoning + assumption checking
- Enhanced Prompt: "Analyze this customer feedback data and recommend improvements. Use this process: 1) Categorize feedback themes, 2) Identify top issues by frequency and impact, 3) Research industry best practices for each issue, 4) Propose specific solutions. Before finalizing, list the key assumptions you're making about customer priorities and business constraints, then verify these align with the data provided."
- Rationale: Step-by-step ensures thorough analysis; assumption checking prevents recommendations based on unstated assumptions about business priorities.

Complete this exercise for all three scenarios:`
      },
      {
        title: "Exercise 4: Audience Persona Pattern Practice",
        description: "Develop expertise in tailoring prompts for specific audiences to ensure content matches their needs, knowledge level, and context.",
        template: `Create audience-specific versions of this content request:

**Base Request:** "Explain artificial intelligence and its business applications"

Create versions for these four distinct audiences:

**Audience 1:** 60-year-old traditional retail store owner, comfortable with basic technology but unfamiliar with AI

**Audience 2:** 28-year-old marketing manager at a tech startup, familiar with marketing automation and analytics tools

**Audience 3:** Board of directors at a manufacturing company, focused on ROI and competitive advantage

**Audience 4:** High school students considering future career paths, interested in practical applications

For each audience, create:

**1. Audience Analysis:**
- Age/demographics and context
- Current knowledge level about AI
- Primary concerns and interests
- Preferred communication style
- Specific goals or needs

**2. Tailored Prompt:**
Rewrite the base request to be perfectly suited for this audience, including:
- Appropriate complexity level
- Relevant examples and use cases
- Terminology that resonates
- Format that matches their needs

**3. Key Adaptations:**
List 3-5 specific changes you made and why they're important for this audience

**Example for Audience 1:**
- Audience Analysis: Established business owner, practical focus, may be skeptical of new technology, needs clear ROI justification
- Tailored Prompt: "Explain artificial intelligence in simple terms for a traditional retail business owner. Focus on practical AI tools that could help with inventory management, customer service, or sales, using real examples from similar businesses. Avoid technical jargon and emphasize cost-effectiveness and ease of implementation."
- Key Adaptations: Simplified language, practical retail examples, ROI focus, addressed tech skepticism, concrete implementation focus

Complete this exercise for all four audiences:`
      },
      {
        title: "Exercise 5: Combined Pattern Mastery",
        description: "Integrate multiple refinement patterns (Persona + Question Refinement + Cognitive Verification + Audience Persona) into a single, highly effective prompt.",
        template: `Create a comprehensive prompt that combines all four refinement patterns for this business scenario:

**Challenge:** A small fitness studio owner wants to create a client retention strategy to reduce membership cancellations by 30% over the next 6 months.

**Your Mission:** Build a prompt that incorporates:

**1. Persona Pattern:**
Define what expert the AI should be (role, experience, specialization)

**2. Question Refinement:**
Use 5W+H to add comprehensive context:
- Who: Target clients, staff, stakeholders
- What: Specific retention goals and current challenges  
- When: Timeline and urgency factors
- Where: Studio context and local market
- Why: Underlying business motivations
- How: Resources, constraints, and preferences

**3. Audience Persona Pattern:**
Define who the final strategy is for (the studio owner's background, experience level, priorities)

**4. Cognitive Verification:**
Build in quality control to ensure the strategy is practical and well-reasoned

**Build Your Master Prompt:**

**A. Planning Section:**
- Expert persona you're assigning to AI
- Comprehensive context using 5W+H
- Target audience details
- Verification method you'll use

**B. Complete Integrated Prompt:**
Write the full prompt incorporating all four patterns seamlessly

**C. Pattern Integration Analysis:**
Explain how each pattern contributes to the prompt's effectiveness and how they work together

**Success Criteria:**
Your final prompt should be comprehensive enough to generate a detailed, practical retention strategy while being specific enough that any business consultant could understand exactly what's needed.`
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
    sections: [
      {
        title: "Persona & Audience Patterns",
        content: `The Persona and Audience Persona patterns are fundamental refinement techniques that dramatically improve prompt effectiveness by establishing clear identity and context.

**The Persona Pattern:**
This pattern assigns a specific role, expertise, or character to the AI, enabling it to respond from a particular perspective with appropriate knowledge and tone.

**Structure:**
"You are [specific role/expertise]. [Your task/request]"

**Why Persona Patterns Work:**
- Activates relevant knowledge domains in the AI
- Sets appropriate tone and communication style  
- Provides context for decision-making and advice
- Reduces generic or unfocused responses

**Persona Pattern Examples:**

❌ **Generic**: "Help me with my resume"
✅ **Persona Pattern**: "You are a senior HR manager with 15+ years of experience in tech recruiting. Review my software engineer resume and provide specific feedback to increase interview callbacks."

❌ **Basic**: "Write a workout plan"  
✅ **Persona Pattern**: "You are a certified personal trainer specializing in strength training for beginners. Create a 12-week progressive workout plan for someone who has never lifted weights before."

**The Audience Persona Pattern:**
This pattern defines who the output is for, allowing the AI to tailor complexity, tone, and content appropriately.

**Structure:** 
"Create [content] for [specific audience with details]. [Additional context]"

**Audience Persona Examples:**

❌ **Vague**: "Explain blockchain technology"
✅ **Audience Persona**: "Explain blockchain technology to a 65-year-old small business owner who is comfortable with basic computer use but has no technical background. Focus on practical benefits and avoid jargon."

❌ **Generic**: "Write a product description"
✅ **Audience Persona**: "Write a product description for our noise-canceling headphones targeting remote workers aged 28-45 who struggle with home office distractions. Focus on productivity benefits and work-from-home use cases."

**Combining Persona + Audience Patterns:**
The most powerful approach combines both patterns for maximum specificity and relevance.

**Combined Pattern Template:**
"You are [expert persona]. Create [content] for [target audience]. [Specific requirements and context]"

**Combined Example:**
"You are a pediatric nutritionist with expertise in picky eaters. Create a meal planning guide for parents of children aged 4-8 who refuse to eat vegetables. Include 14 kid-friendly recipes, shopping lists, and strategies for introducing new foods gradually."`,
        examples: [
          "Marketing persona: 'You are a growth marketing specialist at a B2B SaaS company' → Activates specific marketing knowledge and context",
          "Teaching persona: 'You are a middle school science teacher' → Adjusts complexity and explanation style appropriately", 
          "Target audience: 'Create content for busy executives who have 30 seconds to understand the key points' → Shapes format and depth",
          "Combined power: Expert persona + specific audience = highly targeted, relevant content"
        ]
      },
      {
        title: "Question Refinement Techniques",
        content: `Question refinement transforms vague requests into precise, actionable prompts that generate focused, valuable responses. This pattern systematically improves prompt clarity and specificity.

**The Question Refinement Process:**

**Step 1: Identify the Core Need**
What is the fundamental goal or problem you're trying to address?

**Step 2: Add Specificity Layers**
- Context: What's the situation?
- Scope: What should be included/excluded?
- Format: How should the response be structured?
- Constraints: What limitations exist?

**Step 3: Define Success Criteria**
What would make this response truly useful?

**Question Refinement Examples:**

**Example 1: Business Strategy**
❌ **Vague**: "How can I grow my business?"
🔄 **Better**: "How can I grow my consulting business?"
🔄 **More specific**: "How can I grow my marketing consulting business from $10K to $50K monthly revenue?"
✅ **Refined**: "You are a business growth consultant. I run a digital marketing consulting firm serving small businesses, currently at $10K monthly revenue with 2 clients. I want to reach $50K monthly revenue within 18 months. I have 20 hours/week available and a $2K monthly budget. What's a systematic growth strategy focusing on service expansion and client acquisition?"

**Example 2: Technical Learning**
❌ **Vague**: "How do I learn Python?"
🔄 **Better**: "What's the best way to learn Python programming?"
🔄 **More specific**: "How should I learn Python for data analysis as a complete beginner?"
✅ **Refined**: "You are a senior data scientist and programming instructor. Create a 90-day learning plan for Python data analysis targeted at a marketing professional with no programming experience. I can dedicate 1 hour daily and prefer hands-on projects. Include specific resources, milestone projects, and ways to measure progress toward analyzing real business data."

**The 5W+H Framework for Question Refinement:**
- **Who**: Who is involved? Who is the audience?
- **What**: What exactly do you want to accomplish?
- **When**: What's the timeline or urgency?
- **Where**: What's the context or environment?
- **Why**: What's the underlying goal or motivation?
- **How**: What approach, format, or method do you prefer?

**Refinement Checklist:**
✅ Is the request specific enough to avoid generic responses?
✅ Have I provided relevant background context?
✅ Are my constraints and preferences clear?
✅ Is the desired outcome well-defined?
✅ Would someone else understand exactly what I need?

**Common Refinement Mistakes to Avoid:**
- Adding too much irrelevant context
- Making the prompt overly complex
- Not specifying the output format
- Forgetting to mention important constraints
- Being too narrow and limiting creativity

**Progressive Refinement Technique:**
Start with your basic question, then systematically add layers:
1. Basic question → Add context
2. Add context → Specify format  
3. Specify format → Include constraints
4. Include constraints → Define success criteria`,
        examples: [
          "Context refinement: 'Help with presentation' → 'Create a 20-minute investor pitch for a fintech startup seeking Series A funding'",
          "Format specification: 'Analyze competitors' → 'Create a competitor analysis table comparing 5 key features across 3 main rivals'",
          "Constraint addition: 'Marketing plan' → 'Marketing plan using only organic social media with $0 ad budget for B2B software'",
          "Success criteria: 'Improve website' → 'Increase website conversion rate by 25% through UX improvements targeting mobile users'"
        ]
      },
      {
        title: "Cognitive Verification Methods",
        content: `The Cognitive Verifier pattern builds quality control directly into your prompts, ensuring more accurate, reliable, and well-reasoned responses by asking the AI to verify its own work.

**What is Cognitive Verification?**
This pattern instructs the AI to double-check its reasoning, validate its conclusions, or examine its response from multiple angles before providing the final output.

**Core Verification Approaches:**

**1. Self-Verification Pattern**
Ask the AI to check its own work and reasoning process.

**Template**: "[Your main request]. Before responding, verify your answer by [specific verification method]."

**Example:**
❌ **No verification**: "Calculate the ROI for this marketing campaign with $10K spend and $45K revenue."
✅ **With verification**: "Calculate the ROI for this marketing campaign with $10K spend and $45K revenue. Before providing your final answer, double-check your calculation method and verify the formula you're using is correct for marketing ROI."

**2. Multi-Perspective Verification**
Have the AI examine the topic from different viewpoints or stakeholder perspectives.

**Example:**
"Analyze this business decision to switch to remote work. Before concluding, examine this decision from three perspectives: employee satisfaction, operational costs, and productivity metrics. Note any conflicting considerations."

**3. Step-by-Step Reasoning Verification**
Ask the AI to show its work and verify each step of its reasoning process.

**Template**: "[Request]. Show your step-by-step reasoning and verify each step before moving to the next."

**Example:**
"Create a pricing strategy for our SaaS product. Walk through your reasoning step-by-step: 1) Market analysis, 2) Cost calculations, 3) Competitor comparison, 4) Value proposition alignment. Verify each step makes logical sense before proceeding to the next."

**4. Assumption Checking**
Have the AI identify and validate the assumptions underlying its recommendations.

**Example:**
"Recommend a marketing channel for our B2B startup. Before finalizing your recommendation, list the key assumptions you're making about our target market, budget, and goals. Verify these assumptions align with the information provided."

**5. Error Detection Pattern**
Ask the AI to actively look for potential errors or problems in its response.

**Template**: "[Main request]. After generating your response, review it specifically looking for [potential error types] and correct any issues you find."

**Advanced Verification Techniques:**

**Cross-Reference Verification:**
"Research the benefits of intermittent fasting. Cross-reference your findings with at least 3 different types of evidence (scientific studies, medical expert opinions, and documented case studies) before summarizing."

**Scenario Testing:**
"Recommend a crisis communication strategy. Test your strategy against these three scenarios: social media backlash, product recall, and data breach. Adjust your recommendations based on how well they work across all scenarios."

**Bias Detection:**
"Analyze the pros and cons of remote work policies. Before concluding, check your analysis for potential bias toward either position and ensure you're presenting balanced viewpoints with equal depth."

**Practical Verification Integration:**

**For Research Tasks:**
"[Research request]. Verify your information by cross-checking with multiple sources and flag any claims where sources conflict or provide limited evidence."

**For Creative Work:**  
"[Creative request]. Review your output to ensure it meets all specified criteria and constraints. Check for consistency in tone, style, and messaging throughout."

**For Technical Solutions:**
"[Technical request]. Verify your solution by walking through a test case and checking for potential edge cases or failure points."

**Building Verification Habits:**
- Add verification requests to complex or high-stakes prompts
- Use verification when accuracy is critical
- Include verification for multi-step processes
- Apply verification when dealing with sensitive topics`,
        examples: [
          "Research verification: 'Find data on market size, then verify by cross-referencing at least 2 independent sources and noting any discrepancies'",
          "Logic verification: 'Create a business model, then check if all revenue streams align with your target customer segments'",
          "Completeness verification: 'Design an onboarding process, then review to ensure you've covered all user journey stages from signup to activation'",
          "Assumption verification: 'Recommend a technology stack, then list and validate all assumptions about team size, budget, and technical requirements'"
        ]
      }
    ],
    exercises: [
      {
        title: "Exercise 1: Persona Pattern Mastery",
        description: "Practice implementing the persona pattern to transform generic prompts into expert-level requests with appropriate perspective and knowledge.",
        template: `Transform these generic prompts using the persona pattern:

**Prompt A:** "Help me write better emails"
**Prompt B:** "Create a budget for my small business" 
**Prompt C:** "Explain how to improve customer service"

For each prompt, create a persona-enhanced version that:
1. Assigns a specific expert role to the AI
2. Includes relevant experience/specialization details
3. Maintains the core request while adding expert perspective

**Format for each:**
- **Original prompt:** [paste the generic prompt]
- **Expert persona:** [define who the AI should be]
- **Persona-enhanced prompt:** [complete refined prompt]

**Example:**
- Original prompt: "Help me write better emails"
- Expert persona: Senior communications director at a Fortune 500 company with expertise in executive communication
- Persona-enhanced prompt: "You are a senior communications director at a Fortune 500 company with 12+ years of experience in executive communication. Help me improve my email writing to be more concise, professional, and action-oriented for cross-functional stakeholder communication."

Complete this exercise for all three prompts:`
      },
      {
        title: "Exercise 2: Question Refinement Workshop", 
        description: "Master the systematic process of refining vague questions into precise, actionable prompts using the 5W+H framework.",
        template: `Take this vague business question through the complete refinement process:

**Initial Question:** "How can I improve my website?"

**Step 1: Apply 5W+H Analysis**
Answer each question to add specificity:
- **Who:** Who is your target audience? Who will use the website?
- **What:** What specific improvements are you seeking? (traffic, sales, user experience, etc.)
- **When:** What's your timeline for improvements?
- **Where:** What part of the website needs the most attention?
- **Why:** What's driving this need for improvement? What's the business goal?
- **How:** What's your budget and available resources?

**Step 2: Progressive Refinement**
Show 4 versions of the question, each adding more specificity:
- Version 1: [Original vague question]
- Version 2: [Add basic context]
- Version 3: [Add specific goals and constraints]
- Version 4: [Add format and success criteria]

**Step 3: Final Refined Prompt**
Create a comprehensive, specific prompt that includes:
- Clear context and background
- Specific measurable goals
- Resource constraints
- Desired output format
- Success criteria

Your refined question should be specific enough that two different people would interpret it the same way.`
      },
      {
        title: "Exercise 3: Cognitive Verifier Implementation",
        description: "Learn to build quality control into your prompts using cognitive verification methods to ensure accurate, well-reasoned responses.",
        template: `Add cognitive verification to these three scenarios:

**Scenario A:** Data Analysis Request
Original: "Analyze this customer feedback data and recommend improvements."

**Scenario B:** Strategic Decision
Original: "Should we expand to the European market next year?"

**Scenario C:** Technical Recommendation  
Original: "What's the best database solution for our e-commerce platform?"

For each scenario:

**1. Choose Your Verification Method:**
- Self-verification (double-check calculations/logic)
- Multi-perspective analysis (different stakeholder views)
- Step-by-step reasoning (show and verify each step)
- Assumption checking (identify and validate assumptions)
- Error detection (actively look for flaws)

**2. Enhanced Prompt with Verification:**
Rewrite the prompt to include your chosen verification method

**3. Verification Rationale:**
Explain why you chose that verification method and what specific errors or issues it helps prevent

**Example for Scenario A:**
- Verification Method: Step-by-step reasoning + assumption checking
- Enhanced Prompt: "Analyze this customer feedback data and recommend improvements. Use this process: 1) Categorize feedback themes, 2) Identify top issues by frequency and impact, 3) Research industry best practices for each issue, 4) Propose specific solutions. Before finalizing, list the key assumptions you're making about customer priorities and business constraints, then verify these align with the data provided."
- Rationale: Step-by-step ensures thorough analysis; assumption checking prevents recommendations based on unstated assumptions about business priorities.

Complete this exercise for all three scenarios:`
      },
      {
        title: "Exercise 4: Audience Persona Pattern Practice",
        description: "Develop expertise in tailoring prompts for specific audiences to ensure content matches their needs, knowledge level, and context.",
        template: `Create audience-specific versions of this content request:

**Base Request:** "Explain artificial intelligence and its business applications"

Create versions for these four distinct audiences:

**Audience 1:** 60-year-old traditional retail store owner, comfortable with basic technology but unfamiliar with AI

**Audience 2:** 28-year-old marketing manager at a tech startup, familiar with marketing automation and analytics tools

**Audience 3:** Board of directors at a manufacturing company, focused on ROI and competitive advantage

**Audience 4:** High school students considering future career paths, interested in practical applications

For each audience, create:

**1. Audience Analysis:**
- Age/demographics and context
- Current knowledge level about AI
- Primary concerns and interests
- Preferred communication style
- Specific goals or needs

**2. Tailored Prompt:**
Rewrite the base request to be perfectly suited for this audience, including:
- Appropriate complexity level
- Relevant examples and use cases
- Terminology that resonates
- Format that matches their needs

**3. Key Adaptations:**
List 3-5 specific changes you made and why they're important for this audience

**Example for Audience 1:**
- Audience Analysis: Established business owner, practical focus, may be skeptical of new technology, needs clear ROI justification
- Tailored Prompt: "Explain artificial intelligence in simple terms for a traditional retail business owner. Focus on practical AI tools that could help with inventory management, customer service, or sales, using real examples from similar businesses. Avoid technical jargon and emphasize cost-effectiveness and ease of implementation."
- Key Adaptations: Simplified language, practical retail examples, ROI focus, addressed tech skepticism, concrete implementation focus

Complete this exercise for all four audiences:`
      },
      {
        title: "Exercise 5: Combined Pattern Mastery",
        description: "Integrate multiple refinement patterns (Persona + Question Refinement + Cognitive Verification + Audience Persona) into a single, highly effective prompt.",
        template: `Create a comprehensive prompt that combines all four refinement patterns for this business scenario:

**Challenge:** A small fitness studio owner wants to create a client retention strategy to reduce membership cancellations by 30% over the next 6 months.

**Your Mission:** Build a prompt that incorporates:

**1. Persona Pattern:**
Define what expert the AI should be (role, experience, specialization)

**2. Question Refinement:**
Use 5W+H to add comprehensive context:
- Who: Target clients, staff, stakeholders
- What: Specific retention goals and current challenges  
- When: Timeline and urgency factors
- Where: Studio context and local market
- Why: Underlying business motivations
- How: Resources, constraints, and preferences

**3. Audience Persona Pattern:**
Define who the final strategy is for (the studio owner's background, experience level, priorities)

**4. Cognitive Verification:**
Build in quality control to ensure the strategy is practical and well-reasoned

**Build Your Master Prompt:**

**A. Planning Section:**
- Expert persona you're assigning to AI
- Comprehensive context using 5W+H
- Target audience details
- Verification method you'll use

**B. Complete Integrated Prompt:**
Write the full prompt incorporating all four patterns seamlessly

**C. Pattern Integration Analysis:**
Explain how each pattern contributes to the prompt's effectiveness and how they work together

**Success Criteria:**
Your final prompt should be comprehensive enough to generate a detailed, practical retention strategy while being specific enough that any business consultant could understand exactly what's needed.`
      }
    ]
  },
  "practical-applications": {
    title: "Business planning prompt",
    description: "Create prompts for various business planning scenarios including strategic planning, marketing plans, and functional planning.",
    template: `Create a prompt for developing a comprehensive business plan that includes market analysis, competitive landscape, financial projections, and operational strategy.`
  }
};
