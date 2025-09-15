export interface AIModel {
  name: string;
  company: string;
  url: string;
  description: string;
  category: string;
  isPremium: boolean;
  price?: string;
}

export const AI_MODELS: AIModel[] = [
  {
    name: "ChatGPT",
    company: "OpenAI",
    url: "https://chatgpt.com",
    description: "Advanced conversational AI with GPT-4o capabilities, voice conversations, and file uploads.",
    category: "General Purpose",
    isPremium: true,
    price: "$20/month"
  },
  {
    name: "Gemini",
    company: "Google",
    url: "https://gemini.google.com",
    description: "Google's AI assistant with Workspace integration and image generation capabilities.",
    category: "General Purpose",
    isPremium: true,
    price: "$20/month"
  },
  {
    name: "Copilot",
    company: "Microsoft",
    url: "https://copilot.microsoft.com",
    description: "Microsoft's AI assistant integrated with Office 365 and Bing search capabilities.",
    category: "Productivity",
    isPremium: true,
    price: "$20/month"
  },
  {
    name: "Claude",
    company: "Anthropic",
    url: "https://claude.ai",
    description: "Safety-focused AI assistant with large context window and strong reasoning capabilities.",
    category: "General Purpose",
    isPremium: true,
    price: "$18/month"
  },
  {
    name: "Grok",
    company: "xAI",
    url: "https://grok.com",
    description: "Real-time AI assistant with access to X (Twitter) data and current events.",
    category: "Real-time Info",
    isPremium: true,
    price: "$30/month"
  },
  {
    name: "DeepSeek",
    company: "DeepSeek",
    url: "https://chat.deepseek.com",
    description: "Advanced reasoning AI with chain-of-thought capabilities, completely free to use.",
    category: "Reasoning",
    isPremium: false
  },
  {
    name: "Perplexity",
    company: "Perplexity AI",
    url: "https://perplexity.ai",
    description: "AI-powered search engine with real-time information and source citations.",
    category: "Research",
    isPremium: true,
    price: "$20/month"
  }
];

// Create a map for quick lookups
export const AI_MODEL_MAP = new Map(
  AI_MODELS.map(model => [model.name.toLowerCase(), model])
);

// Helper functions for safe AI model operations

// Get model by name
export function getAIModel(name: string): AIModel | undefined {
  return AI_MODEL_MAP.get(name.toLowerCase());
}

// Get models by category
export function getModelsByCategory(category: string): AIModel[] {
  return AI_MODELS.filter(model => model.category === category);
}

// Get all categories
export function getModelCategories(): string[] {
  return Array.from(new Set(AI_MODELS.map(model => model.category)));
}