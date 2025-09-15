import type { 
  PlaygroundTestResult, 
  PlaygroundParameters, 
  RunPlaygroundTestRequest 
} from "@shared/schema";

// Cached pricing data with 10-minute TTL
interface PricingData {
  data: Record<string, {
    prompt: number;
    completion: number;
  }>;
  timestamp: number;
}

let pricingCache: PricingData | null = null;
const PRICING_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// OpenRouter model mapping
const SUPPORTED_MODELS = {
  "gpt-4o": "openai/gpt-4o",
  "claude-3.5-sonnet": "anthropic/claude-3.5-sonnet", 
  "gemini-1.5-pro": "google/gemini-1.5-pro",
  "gpt-4o-mini": "openai/gpt-4o-mini"
} as const;

interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenRouterError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

interface TestSummary {
  successful: number;
  failed: number;
  durationMs: number;
}

interface MultiModelTestResult {
  results: PlaygroundTestResult[];
  totalCost: string;
  summary: TestSummary;
}

/**
 * Get configured OpenRouter client headers
 */
function getClient(): HeadersInit {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is required");
  }

  return {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "https://replit.com",
    "X-Title": "AI Playground - Replit"
  };
}

/**
 * Fetch and cache model pricing from OpenRouter API
 */
async function getPricing(): Promise<Record<string, { prompt: number; completion: number }>> {
  try {
    // Check cache first
    if (pricingCache && Date.now() - pricingCache.timestamp < PRICING_CACHE_TTL) {
      return pricingCache.data;
    }

    const headers = getClient();
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers,
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      console.warn("Failed to fetch pricing data, using fallback");
      return getFallbackPricing();
    }

    const modelsData = await response.json();
    const pricing: Record<string, { prompt: number; completion: number }> = {};
    
    // Extract pricing for our supported models
    if (modelsData.data && Array.isArray(modelsData.data)) {
      for (const model of modelsData.data) {
        if (model.id && model.pricing) {
          pricing[model.id] = {
            prompt: parseFloat(model.pricing.prompt || "0"),
            completion: parseFloat(model.pricing.completion || "0")
          };
        }
      }
    }

    // Cache the results
    pricingCache = {
      data: pricing,
      timestamp: Date.now()
    };

    return pricing;
  } catch (error) {
    console.warn("Error fetching pricing data:", error);
    return getFallbackPricing();
  }
}

/**
 * Fallback pricing data in case API call fails
 */
function getFallbackPricing(): Record<string, { prompt: number; completion: number }> {
  return {
    "openai/gpt-4o": { prompt: 0.005, completion: 0.015 },
    "anthropic/claude-3.5-sonnet": { prompt: 0.003, completion: 0.015 },
    "google/gemini-1.5-pro": { prompt: 0.00125, completion: 0.005 },
    "openai/gpt-4o-mini": { prompt: 0.00015, completion: 0.0006 }
  };
}

/**
 * Create AbortController with timeout
 */
function createTimeoutController(ms: number): AbortController {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort(new Error(`Operation timed out after ${ms}ms`));
  }, ms);
  
  // Clean up timeout if request completes normally
  controller.signal.addEventListener('abort', () => {
    clearTimeout(timeout);
  });
  
  return controller;
}

/**
 * Make API call to individual model
 */
async function callModel(
  modelId: string,
  promptText: string,
  parameters: PlaygroundParameters,
  signal?: AbortSignal
): Promise<OpenRouterResponse> {
  const headers = getClient();
  
  const body = {
    model: modelId,
    messages: [
      {
        role: "user",
        content: promptText
      }
    ],
    temperature: parameters.temperature,
    max_tokens: parameters.maxTokens,
    top_p: parameters.topP,
  };

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorData = await response.json() as OpenRouterError;
      errorMessage = errorData.error?.message || response.statusText;
    } catch {
      // If response.json() fails, use statusText
    }
    throw new Error(`Model ${modelId} failed: ${errorMessage}`);
  }

  return response.json() as Promise<OpenRouterResponse>;
}

/**
 * Calculate cost based on token usage and pricing
 */
function computeCost(
  modelId: string, 
  usage: { prompt_tokens: number; completion_tokens: number }, 
  pricing: Record<string, { prompt: number; completion: number }>
): string {
  try {
    const modelPricing = pricing[modelId];
    if (!modelPricing || typeof modelPricing.prompt !== 'number' || typeof modelPricing.completion !== 'number') {
      console.warn(`Missing or invalid pricing data for model ${modelId}`);
      return "0.00";
    }

    // Guard against invalid token counts
    const promptTokens = typeof usage.prompt_tokens === 'number' && !isNaN(usage.prompt_tokens) ? usage.prompt_tokens : 0;
    const completionTokens = typeof usage.completion_tokens === 'number' && !isNaN(usage.completion_tokens) ? usage.completion_tokens : 0;

    const promptCost = (promptTokens / 1000) * modelPricing.prompt;
    const completionCost = (completionTokens / 1000) * modelPricing.completion;
    const totalCost = promptCost + completionCost;

    // Guard against NaN result
    if (isNaN(totalCost)) {
      console.warn(`Cost calculation resulted in NaN for model ${modelId}`);
      return "0.00";
    }

    return totalCost.toFixed(6);
  } catch (error) {
    console.warn(`Error calculating cost for model ${modelId}:`, error);
    return "0.00";
  }
}

/**
 * Convert model name to OpenRouter model ID
 */
function getOpenRouterModelId(modelName: string): string {
  const mapped = SUPPORTED_MODELS[modelName as keyof typeof SUPPORTED_MODELS];
  if (mapped) {
    return mapped;
  }
  
  // If already an OpenRouter model ID, return as-is
  if (modelName.includes("/")) {
    return modelName;
  }
  
  throw new Error(`Unsupported model: ${modelName}`);
}

/**
 * Execute tasks with proper concurrency control
 */
async function runWithConcurrency<T, R>(
  items: T[],
  asyncTask: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchPromises = batch.map(item => asyncTask(item));
    const batchResults = await Promise.allSettled(batchPromises);
    
    // Extract results, preserving order and ensuring all results are included
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        // Since testSingleModel already handles errors internally,
        // this case should be rare, but we need to handle it gracefully
        console.error('Unexpected error in batch execution:', result.reason);
        throw result.reason;
      }
    }
  }
  
  return results;
}

/**
 * Test individual model with proper error handling and cancellation
 */
async function testSingleModel(
  modelName: string,
  promptText: string,
  parameters: PlaygroundParameters,
  pricing: Record<string, { prompt: number; completion: number }>,
  timeoutMs: number
): Promise<PlaygroundTestResult> {
  const modelStartTime = Date.now();
  const controller = createTimeoutController(timeoutMs);
  
  try {
    const modelId = getOpenRouterModelId(modelName);
    
    const response = await callModel(modelId, promptText, parameters, controller.signal);
    
    const responseTime = Date.now() - modelStartTime;
    const cost = computeCost(modelId, response.usage, pricing);
    
    return {
      modelName,
      response: response.choices[0]?.message?.content || "",
      tokenCount: response.usage.total_tokens,
      cost,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - modelStartTime;
    
    return {
      modelName,
      response: "",
      tokenCount: 0,
      cost: "0.00",
      responseTime,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

/**
 * Run multi-model test across different AI models with proper concurrency control
 */
export async function runMultiModelTest(
  request: RunPlaygroundTestRequest,
  options?: { timeoutMs?: number; concurrency?: number }
): Promise<MultiModelTestResult> {
  const { promptText, models, parameters } = request;
  const { timeoutMs = 30000, concurrency = 3 } = options || {};
  
  const startTime = Date.now();

  try {
    // Get pricing data first
    const pricing = await getPricing();

    // Execute tests with true concurrency control
    const results = await runWithConcurrency(
      models,
      (modelName) => testSingleModel(modelName, promptText, parameters, pricing, timeoutMs),
      concurrency
    );

    // Compute summary statistics from results
    const successful = results.filter(r => !r.error).length;
    const failed = results.filter(r => r.error).length;
    const totalCostValue = results.reduce((sum, r) => sum + parseFloat(r.cost || "0"), 0);
    const durationMs = Date.now() - startTime;
    
    return {
      results,
      totalCost: totalCostValue.toFixed(6),
      summary: {
        successful,
        failed,
        durationMs
      }
    };

  } catch (error) {
    // If everything fails, still return a proper structure
    const durationMs = Date.now() - startTime;
    
    return {
      results: models.map(modelName => ({
        modelName,
        response: "",
        tokenCount: 0,
        cost: "0.00",
        responseTime: 0,
        error: error instanceof Error ? error.message : "Critical system error"
      })),
      totalCost: "0.00",
      summary: {
        successful: 0,
        failed: models.length,
        durationMs
      }
    };
  }
}

/**
 * Get list of supported models
 */
export function getSupportedModels(): string[] {
  return Object.keys(SUPPORTED_MODELS);
}

/**
 * Validate if a model is supported
 */
export function isModelSupported(modelName: string): boolean {
  return modelName in SUPPORTED_MODELS || modelName.includes("/");
}