import type { AssessmentFeedback, QuizFeedback, QuizQuestion } from "@shared/schema";

// Using OpenRouter for all AI calls - easier to manage usage
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const DEFAULT_MODEL = "openai/gpt-4o"; // Still using GPT-4 for quality, but through OpenRouter

function getClient(): HeadersInit {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY environment variable is required");
  }

  return {
    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.BETTER_AUTH_URL || "http://localhost:5000",
    "X-Title": "PromptMaster LMS"
  };
}

async function callOpenRouter(messages: Array<{role: string, content: string}>, temperature = 0.7, jsonMode = false) {
  const headers = getClient();
  
  const body: any = {
    model: DEFAULT_MODEL,
    messages,
    temperature,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000) // 60 second timeout
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: "Unknown error" }}));
    throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function assessPrompt(prompt: string, moduleId: string): Promise<AssessmentFeedback> {
  try {
    // Get module-specific assessment criteria
    const getModuleSystemPrompt = (moduleId: string) => {
      const basePrompt = "You are an expert prompt engineering instructor. Assess the quality of the given prompt and provide detailed feedback.";
      
      let moduleSpecificCriteria = "";
      
      switch (moduleId) {
        case "basic-prompting":
          moduleSpecificCriteria = `
This is the Basic Prompting module focusing on fundamentals and context usage.

Evaluate the prompt on these criteria (score 0-100 each):
1. Clarity & Structure: How clear and well-organized is the prompt?
2. Context Completeness: Does it provide sufficient context and background information?
3. Specificity: How specific and detailed are the instructions?
4. Actionability: Can the AI produce the desired outcome effectively?

For this foundational module, prioritize clear communication and adequate context over complex techniques.`;
          break;
          
        case "prompt-structure":
          moduleSpecificCriteria = `
This is the Prompt Structure module focusing on the RTCTC framework (Role, Task, Context, Template, Constraints).

Evaluate the prompt on these criteria (score 0-100 each):
1. Clarity & Structure: How well-structured is the prompt using RTCTC elements?
2. Context Completeness: Does it provide comprehensive context and background?
3. Specificity: Are role, task, and constraints clearly defined?
4. Actionability: How effectively does it guide the AI with structured expectations?

Look for: clear role definition, specific task description, relevant context, output format/template, and necessary constraints.`;
          break;
          
        case "advanced-techniques":
          moduleSpecificCriteria = `
This is the Advanced Techniques module focusing on chain-of-thought, few-shot learning, and sophisticated strategies.

Evaluate the prompt on these criteria (score 0-100 each):
1. Clarity & Structure: How well does it organize complex instructions?
2. Context Completeness: Does it provide examples or reasoning frameworks?
3. Specificity: How precisely does it implement advanced techniques?
4. Actionability: How effectively does it guide sophisticated AI reasoning?

Look for: step-by-step reasoning, examples/demonstrations, complex problem decomposition, or advanced prompting patterns.`;
          break;
          
        case "prompt-refinement":
          moduleSpecificCriteria = `
This is the Prompt Refinement module focusing on iterative improvement and testing strategies.

Evaluate the prompt on these criteria (score 0-100 each):
1. Clarity & Structure: How refined and polished is the prompt structure?
2. Context Completeness: Does it show evidence of iterative improvement?
3. Specificity: How precisely refined are the instructions and requirements?
4. Actionability: How well-optimized is it for consistent, quality outputs?

Look for: refined language, specific success criteria, clear quality indicators, or evidence of thoughtful optimization.`;
          break;
          
        case "practical-applications":
          moduleSpecificCriteria = `
This is the Practical Applications module focusing on real-world business and productivity use cases.

Evaluate the prompt on these criteria (score 0-100 each):
1. Clarity & Structure: How professionally structured is the prompt?
2. Context Completeness: Does it address real-world constraints and requirements?
3. Specificity: How well does it define practical outcomes and deliverables?
4. Actionability: How effectively does it drive business or productivity value?

Look for: practical business context, realistic constraints, measurable outcomes, professional tone, and real-world applicability.`;
          break;
          
        default:
          moduleSpecificCriteria = `
Evaluate the prompt on these criteria (score 0-100 each):
1. Clarity & Structure: How clear and well-organized is the prompt?
2. Context Completeness: Does it provide sufficient context and background?
3. Specificity: How specific and detailed are the instructions?
4. Actionability: Can the AI produce the desired outcome?`;
      }
      
      return `${basePrompt}

${moduleSpecificCriteria}

Provide an overall score (0-100) and specific feedback. Be reasonably generous with scoring for well-structured prompts that demonstrate the key concepts for this module level.

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
    };

    const systemPrompt = getModuleSystemPrompt(moduleId);

    const responseContent = await callOpenRouter([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Module: ${moduleId}\n\nPrompt to assess:\n${prompt}` }
    ], 0.7, true);

    // ERROR HANDLING FIX: Add try/catch around JSON.parse with fallback structure
    let result;
    try {
      result = JSON.parse(responseContent || "{}");
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      result = {
        overall_score: 50,
        clarity_structure: 50,
        context_completeness: 50,
        specificity: 50,
        actionability: 50,
        strengths: ["Unable to analyze due to parsing error"],
        improvements: ["Please try again"],
        suggestions: ["Resubmit your prompt for assessment"]
      };
    }

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
    const responseContent = await callOpenRouter([
      {
        role: "system",
        content: "You are a prompt engineering expert. Given a prompt and its assessment feedback, generate an improved version that addresses the identified weaknesses while maintaining the original intent."
      },
      {
        role: "user",
        content: `Original prompt:\n${prompt}\n\nFeedback:\nOverall Score: ${feedback.overall_score}/100\nImprovements needed: ${feedback.improvements.join(", ")}\nSuggestions: ${feedback.suggestions.join(", ")}\n\nPlease provide an improved version of this prompt:`
      }
    ]);

    return responseContent || "";
  } catch (error) {
    console.error("OpenAI suggestion error:", error);
    throw new Error("Failed to generate suggestions: " + (error as Error).message);
  }
}

export async function assessQuizAnswers(
  questions: QuizQuestion[],
  userAnswers: number[],
  timeSpent?: number
): Promise<QuizFeedback> {
  try {
    // Calculate basic scores
    let correctAnswers = 0;
    let totalScore = 0;
    const detailedFeedback: { question_index: number; is_correct: boolean; explanation: string; }[] = [];
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const userAnswer = userAnswers[i];
      const isCorrect = userAnswer === question.correctAnswerIndex;
      
      if (isCorrect) {
        correctAnswers++;
        // SCORING FIX: Use question.points instead of hardcoded value
        totalScore += question.points || 1;
      }
      
      detailedFeedback.push({
        question_index: i,
        is_correct: isCorrect,
        explanation: "" // Will be filled by AI
      });
    }
    
    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    // Prepare questions and answers for AI analysis
    const quizData = questions.map((q, index) => ({
      question: q.questionText,
      options: q.answerOptions,
      correct_answer: q.correctAnswerIndex,
      user_answer: userAnswers[index],
      is_correct: userAnswers[index] === q.correctAnswerIndex
    }));
    
    const systemPrompt = `You are an expert educator and quiz assessor. Analyze the quiz performance and provide constructive feedback.

For each question, provide a brief explanation of why the answer is correct or incorrect, focusing on the learning concept.
Also provide overall strengths and areas for improvement based on the pattern of answers.

Respond with JSON in this exact format:
{
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "detailed_feedback": [
    {
      "question_index": 0,
      "explanation": "Brief explanation for question 1"
    }
  ]
}`;
    
    const userMessage = `Quiz Performance Analysis:
Total Questions: ${totalQuestions}
Correct Answers: ${correctAnswers}
Percentage: ${percentage}%
${timeSpent ? `Time Spent: ${Math.round(timeSpent / 60)} minutes` : ""}

Questions and Answers:
${JSON.stringify(quizData, null, 2)}`;
    
    const responseContent = await callOpenRouter([
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ], 0.7, true);
    
    // ERROR HANDLING FIX: Add try/catch around JSON.parse with fallback structure
    let aiResult;
    try {
      aiResult = JSON.parse(responseContent || "{}");
    } catch (parseError) {
      console.error("Failed to parse AI quiz feedback response:", parseError);
      aiResult = {
        strengths: ["Unable to analyze due to parsing error"],
        improvements: ["Please try again"],
        detailed_feedback: detailedFeedback.map((_, index) => ({
          question_index: index,
          explanation: "Unable to provide feedback due to AI response parsing error"
        }))
      };
    }
    
    // Merge AI feedback with our detailed feedback
    if (aiResult.detailed_feedback && Array.isArray(aiResult.detailed_feedback)) {
      aiResult.detailed_feedback.forEach((aiFeedback: any) => {
        const index = aiFeedback.question_index;
        if (index >= 0 && index < detailedFeedback.length) {
          detailedFeedback[index].explanation = aiFeedback.explanation || "";
        }
      });
    }
    
    return {
      overallScore: totalScore,
      percentage,
      correctAnswers: correctAnswers,
      totalQuestions: totalQuestions,
      timeSpent: timeSpent,
      strengths: Array.isArray(aiResult.strengths) ? aiResult.strengths : [],
      improvements: Array.isArray(aiResult.improvements) ? aiResult.improvements : [],
      detailedFeedback: detailedFeedback.map(item => ({
        questionIndex: item.question_index,
        isCorrect: item.is_correct,
        explanation: item.explanation
      }))
    };
  } catch (error) {
    console.error("Quiz assessment error:", error);
    throw new Error("Failed to assess quiz: " + (error as Error).message);
  }
}
