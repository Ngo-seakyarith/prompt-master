import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Get clipboard-friendly formatted export
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { testId } = await params;

    const test = await prisma.playgroundTest.findUnique({
      where: {
        id: testId,
        userId: session.user.id,
      },
      include: {
        prompt: true,
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Format for clipboard
    type TestResult = {
      model: string;
      response?: string;
      duration?: number;
      tokens?: number;
      cost?: string;
      rating?: number;
    };
    const results = test.results as TestResult[];
    let content = `📝 Prompt: ${test.prompt?.content || "N/A"}\n\n`;
    
    results.forEach((r, i: number) => {
      content += `🤖 Model ${i + 1}: ${r.model}\n`;
      content += `💬 Response:\n${r.response}\n`;
      content += `⏱️ Duration: ${r.duration}ms | 🎫 Tokens: ${r.tokens} | 💰 Cost: $${r.cost}\n`;
      if (r.rating) content += `⭐ Rating: ${r.rating}/5\n`;
      content += `\n${"─".repeat(60)}\n\n`;
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error generating clipboard content:", error);
    return NextResponse.json(
      { error: "Failed to generate clipboard content" },
      { status: 500 }
    );
  }
}
