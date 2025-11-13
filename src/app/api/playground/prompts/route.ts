import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Get all saved prompts for the user
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prompts = await prisma.playgroundPrompt.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(prompts);
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompts" },
      { status: 500 }
    );
  }
}

// Save a new prompt
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, tags, category } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const prompt = await prisma.playgroundPrompt.create({
      data: {
        userId: session.user.id,
        title,
        content,
        tags: tags || [],
        category: category || "general",
      },
    });

    return NextResponse.json(prompt);
  } catch (error) {
    console.error("Error saving prompt:", error);
    return NextResponse.json(
      { error: "Failed to save prompt" },
      { status: 500 }
    );
  }
}
