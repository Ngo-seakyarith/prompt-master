import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Simple improvement suggestions based on common prompt engineering principles
    const suggestions = [];

    // Check for specificity
    if (prompt.length < 20) {
      suggestions.push({
        category: "specificity",
        suggestion: "Make your prompt more specific and detailed",
        example: "Add context, constraints, or desired output format",
        priority: "high",
      });
    }

    // Check for context
    if (!prompt.toLowerCase().includes("context")) {
      suggestions.push({
        category: "context",
        suggestion: "Add contextual information to help the AI understand better",
        example: "Include relevant background or use case information",
        priority: "medium",
      });
    }

    // Check for formatting instructions
    if (!prompt.toLowerCase().match(/format|structure|output/)) {
      suggestions.push({
        category: "format",
        suggestion: "Specify the desired output format",
        example: "Request specific structure like bullet points, JSON, or paragraph format",
        priority: "medium",
      });
    }

    // Check for role specification
    if (!prompt.toLowerCase().match(/you are|act as|role/)) {
      suggestions.push({
        category: "role",
        suggestion: "Define a role or persona for the AI",
        example: "Start with 'You are an expert in...' or 'Act as a...'",
        priority: "low",
      });
    }

    // Generate improved version (basic example)
    let improvedPrompt = prompt;
    
    if (suggestions.length > 0) {
      improvedPrompt = `Context: [Add relevant context here]\n\nTask: ${prompt}\n\nRequirements:\n- Be specific and detailed\n- Provide examples where applicable\n- Format the output clearly\n\nPlease provide a comprehensive response.`;
    }

    return NextResponse.json({
      originalPrompt: prompt,
      improvedPrompt,
      suggestions,
      score: Math.max(40, 100 - suggestions.length * 15),
    });
  } catch (error) {
    console.error("Error improving prompt:", error);
    return NextResponse.json(
      { error: "Failed to improve prompt" },
      { status: 500 }
    );
  }
}
