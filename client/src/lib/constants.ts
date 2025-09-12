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

export const SAMPLE_EXERCISES = {
  "basic-prompting": {
    title: "Create a prompt for content marketing strategy",
    description: "Write a prompt that would generate a comprehensive content marketing strategy for a B2B SaaS company.",
    template: `You are an expert content marketing strategist with 10+ years of experience.

Task: Create a comprehensive content marketing strategy for a B2B SaaS company.

Context: 
- Company: CloudFlow (project management software)
- Target audience: Small to medium businesses
- Budget: $10,000/month
- Timeline: Q1 2024

Requirements:
- Include content types, distribution channels, and KPIs
- Focus on lead generation and brand awareness
- Provide specific tactics and timelines`
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
