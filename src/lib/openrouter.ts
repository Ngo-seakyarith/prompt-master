import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
})

export interface ModelConfig {
  id: string
  name: string
  provider: string
  contextLength: number
  creditCost: number
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  // State of the Art (1.0 credits)
  {
    id: "openai/gpt-5.1-chat",
    name: "GPT-5.1 Instant",
    provider: "OpenAI",
    contextLength: 128000,
    creditCost: 1.0,
  },
  {
    id: "openai/gpt-5.1",
    name: "GPT-5.1 Thinking",
    provider: "OpenAI",
    contextLength: 400000,
    creditCost: 1.0,
  },
  {
    id: "google/gemini-3-pro-preview",
    name: "Gemini 3 Pro Preview",
    provider: "Google",
    contextLength: 1048576,
    creditCost: 1.0,
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    contextLength: 1048576,
    creditCost: 1.0,
  },
  {
    id: "qwen/qwen3-max",
    name: "Qwen3 Max",
    provider: "Qwen",
    contextLength: 256000,
    creditCost: 1.0,
  },

  // Normal (0.5 credits)
  {
    id: "deepseek/deepseek-v3.2-exp",
    name: "DeepSeek V3.2 Experimental",
    provider: "DeepSeek",
    contextLength: 163840,
    creditCost: 0.5,
  },
  {
    id: "moonshotai/kimi-k2-thinking",
    name: "Kimi K2 Thinking",
    provider: "MoonshotAI",
    contextLength: 262144,
    creditCost: 0.5,
  },
  {
    id: "moonshotai/kimi-k2-0905",
    name: "Kimi K2 0905",
    provider: "MoonshotAI",
    contextLength: 262144,
    creditCost: 0.5,
  },
  {
    id: "z-ai/glm-4.6",
    name: "GLM 4.6",
    provider: "Z-AI",
    contextLength: 128000,
    creditCost: 0.5,
  },

  // Cheap (0.2 credits)
  {
    id: "x-ai/grok-4-fast",
    name: "Grok 4 Fast",
    provider: "xAI",
    contextLength: 2000000,
    creditCost: 0.2,
  },
  {
    id: "minimax/minimax-m2",
    name: "MiniMax M2",
    provider: "MiniMax",
    contextLength: 128000,
    creditCost: 0.2,
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    contextLength: 1048576,
    creditCost: 0.2,
  },
]

export async function assessPrompt(
  prompt: string,
  exerciseContext: string
): Promise<{
  score: number
  feedback: {
    overall_score: number
    clarity_structure: number
    context_completeness: number
    specificity: number
    actionability: number
    strengths: string[]
    improvements: string[]
    suggestions: string[]
  }
}> {
  const assessmentPrompt = `You are an expert prompt engineering instructor. Assess the following prompt for quality and effectiveness.

Exercise Context: ${exerciseContext}

Student's Prompt: ${prompt}

Provide a detailed assessment with:
1. Overall score (0-100)
2. Individual scores for: clarity_structure, context_completeness, specificity, actionability (each 0-10)
3. At least 2 strengths
4. At least 2 areas for improvement
5. At least 2 specific suggestions

Respond in JSON format only.`

  try {
    const { text } = await generateText({
      model: openrouter("anthropic/claude-3.5-sonnet"),
      prompt: assessmentPrompt,
      temperature: 0.7,
    })

    const feedback = JSON.parse(text)
    return {
      score: feedback.overall_score,
      feedback,
    }
  } catch (error) {
    console.error("Error assessing prompt:", error)
    throw new Error("Failed to assess prompt")
  }
}

export async function assessQuizAnswers(
  questions: Array<{ questionText: string; correctAnswerIndex: number }>,
  userAnswers: number[],
  timeSpent?: number
): Promise<{
  overallScore: number
  percentage: number
  correctAnswers: number
  totalQuestions: number
  timeSpent?: number
  strengths: string[]
  improvements: string[]
  detailedFeedback: Array<{
    questionIndex: number
    isCorrect: boolean
    explanation: string
  }>
}> {
  const correctCount = questions.reduce((count, q, idx) => {
    return count + (q.correctAnswerIndex === userAnswers[idx] ? 1 : 0)
  }, 0)

  const percentage = Math.round((correctCount / questions.length) * 100)

  const assessmentPrompt = `You are an expert instructor providing quiz feedback.

Questions and Answers:
${questions.map((q, idx) => `
Question ${idx + 1}: ${q.questionText}
Correct Answer: ${q.correctAnswerIndex}
User's Answer: ${userAnswers[idx]}
Result: ${q.correctAnswerIndex === userAnswers[idx] ? "Correct" : "Incorrect"}
`).join("\n")}

Score: ${correctCount}/${questions.length} (${percentage}%)
${timeSpent ? `Time Spent: ${Math.round(timeSpent / 60)} minutes` : ""}

Provide feedback with:
1. 2-3 strengths (what they did well)
2. 2-3 areas for improvement
3. Detailed explanation for each question (why correct/incorrect)

Respond in JSON format with: strengths (array), improvements (array), detailedFeedback (array of {questionIndex, isCorrect, explanation}).`

  try {
    const { text } = await generateText({
      model: openrouter("anthropic/claude-3.5-sonnet"),
      prompt: assessmentPrompt,
      temperature: 0.7,
    })

    const aiResponse = JSON.parse(text)

    return {
      overallScore: correctCount,
      percentage,
      correctAnswers: correctCount,
      totalQuestions: questions.length,
      timeSpent,
      strengths: aiResponse.strengths || [],
      improvements: aiResponse.improvements || [],
      detailedFeedback: aiResponse.detailedFeedback || [],
    }
  } catch (error) {
    console.error("Error assessing quiz:", error)
    // Return basic feedback without AI enhancement
    return {
      overallScore: correctCount,
      percentage,
      correctAnswers: correctCount,
      totalQuestions: questions.length,
      timeSpent,
      strengths: percentage >= 80 ? ["Good performance overall"] : [],
      improvements: percentage < 80 ? ["Review incorrect answers"] : [],
      detailedFeedback: questions.map((q, idx) => ({
        questionIndex: idx,
        isCorrect: q.correctAnswerIndex === userAnswers[idx],
        explanation: `The correct answer was option ${q.correctAnswerIndex + 1}.`,
      })),
    }
  }
}

export async function runMultiModelTest(
  promptText: string,
  models: string[]
) {
  const results = await Promise.all(
    models.map(async (modelId) => {
      const startTime = Date.now()
      try {
        const { text, usage } = await generateText({
          model: openrouter(modelId),
          prompt: promptText,
        })

        const responseTime = Date.now() - startTime
        const modelConfig = AVAILABLE_MODELS.find((m) => m.id === modelId)

        // Usage type changed in AI SDK - using totalTokens or defaults
        const totalTokens = (usage as any)?.totalTokens || 0
        const promptTokens = (usage as any)?.promptTokens || 0
        const completionTokens = (usage as any)?.completionTokens || 0

        // Flat credit cost per request
        const cost = modelConfig?.creditCost || 0

        return {
          modelName: modelId,
          response: text,
          tokenCount: totalTokens,
          cost: cost.toFixed(1),
          responseTime,
          error: undefined,
        }
      } catch (error) {
        return {
          modelName: modelId,
          response: "",
          tokenCount: 0,
          cost: "0",
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    })
  )

  const totalCredits = results
    .reduce((sum, r) => sum + parseFloat(r.cost), 0)

  return { results, totalCredits }
}
