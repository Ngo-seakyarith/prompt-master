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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error("Error fetching exercise attempts:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempts" },
      { status: 500 }
    );
  }
}
