import { createOpenRouter } from "@ai-sdk/openrouter"
import { generateText } from "ai"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
})

export interface ModelConfig {
  id: string
  name: string
  provider: string
  contextLength: number
  pricing: {
    prompt: number
    completion: number
  }
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    contextLength: 200000,
    pricing: { prompt: 0.003, completion: 0.015 },
  },
  {
    id: "openai/gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    contextLength: 128000,
    pricing: { prompt: 0.01, completion: 0.03 },
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    contextLength: 128000,
    pricing: { prompt: 0.005, completion: 0.015 },
  },
  {
    id: "google/gemini-pro-1.5",
    name: "Gemini Pro 1.5",
    provider: "Google",
    contextLength: 1000000,
    pricing: { prompt: 0.00125, completion: 0.005 },
  },
  {
    id: "meta-llama/llama-3.1-70b-instruct",
    name: "Llama 3.1 70B",
    provider: "Meta",
    contextLength: 131072,
    pricing: { prompt: 0.0004, completion: 0.0004 },
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
      maxTokens: 1500,
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
      maxTokens: 2000,
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
  models: string[],
  parameters: {
    temperature: number
    maxTokens: number
    topP: number
  }
) {
  const results = await Promise.all(
    models.map(async (modelId) => {
      const startTime = Date.now()
      try {
        const { text, usage } = await generateText({
          model: openrouter(modelId),
          prompt: promptText,
          temperature: parameters.temperature,
          maxTokens: parameters.maxTokens,
          topP: parameters.topP,
        })

        const responseTime = Date.now() - startTime
        const modelConfig = AVAILABLE_MODELS.find((m) => m.id === modelId)
        const promptTokens = usage?.promptTokens || 0
        const completionTokens = usage?.completionTokens || 0
        
        const cost = modelConfig
          ? (promptTokens * modelConfig.pricing.prompt + 
             completionTokens * modelConfig.pricing.completion) / 1000
          : 0

        return {
          modelName: modelId,
          response: text,
          tokenCount: promptTokens + completionTokens,
          cost: cost.toFixed(6),
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

  const totalCost = results
    .reduce((sum, r) => sum + parseFloat(r.cost), 0)
    .toFixed(6)

  return { results, totalCost }
}
