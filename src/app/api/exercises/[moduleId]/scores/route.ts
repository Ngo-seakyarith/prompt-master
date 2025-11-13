import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { moduleId } = await params;
    const userId = session.user.id;

    const attempts = await prisma.exerciseAttempt.findMany({
      where: {
        userId,
        moduleId,
      },
      select: {
        score: true,
      },
    });

    const scores = attempts.map((a: { score: number }) => a.score);

    return NextResponse.json({
      scores,
      average: scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0,
      count: scores.length,
    });
  } catch (error) {
    console.error("Error fetching scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch scores" },
      { status: 500 }
    );
  }
}
