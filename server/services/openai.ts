import OpenAI from "openai";
import type { AssessmentFeedback } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function assessPrompt(prompt: string, moduleId: string): Promise<AssessmentFeedback> {
  try {
    const systemPrompt = `You are an expert prompt engineering instructor. Assess the quality of the given prompt and provide detailed feedback.

Evaluate the prompt on these criteria (score 0-100 each):
1. Clarity & Structure: How clear and well-organized is the prompt?
2. Context Completeness: Does it provide sufficient context and background?
3. Specificity: How specific and detailed are the instructions?
4. Actionability: Can the AI produce the desired outcome?

Provide an overall score (0-100) and specific feedback.

Respond with JSON in this exact format:
{
  "overall_score": number,
  "clarity_structure": number,
  "context_completeness": number,
  "specificity": number,
  "actionability": number,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "suggestions": ["specific suggestion1", "specific suggestion2"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Module: ${moduleId}\n\nPrompt to assess:\n${prompt}` }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    // Ensure scores are within valid range
    return {
      overall_score: Math.max(0, Math.min(100, result.overall_score || 0)),
      clarity_structure: Math.max(0, Math.min(100, result.clarity_structure || 0)),
      context_completeness: Math.max(0, Math.min(100, result.context_completeness || 0)),
      specificity: Math.max(0, Math.min(100, result.specificity || 0)),
      actionability: Math.max(0, Math.min(100, result.actionability || 0)),
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      improvements: Array.isArray(result.improvements) ? result.improvements : [],
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : []
    };
  } catch (error) {
    console.error("OpenAI assessment error:", error);
    throw new Error("Failed to assess prompt: " + (error as Error).message);
  }
}

export async function generatePromptSuggestions(prompt: string, feedback: AssessmentFeedback): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a prompt engineering expert. Given a prompt and its assessment feedback, generate an improved version that addresses the identified weaknesses while maintaining the original intent."
        },
        {
          role: "user",
          content: `Original prompt:\n${prompt}\n\nFeedback:\nOverall Score: ${feedback.overall_score}/100\nImprovements needed: ${feedback.improvements.join(", ")}\nSuggestions: ${feedback.suggestions.join(", ")}\n\nPlease provide an improved version of this prompt:`
        }
      ]
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("OpenAI suggestion error:", error);
    throw new Error("Failed to generate suggestions: " + (error as Error).message);
  }
}
