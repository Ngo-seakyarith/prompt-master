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

    const count = await prisma.exerciseAttempt.count({
      where: {
        userId,
        moduleId,
        score: {
          gte: 80, // Consider 80% as completed
        },
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching completed exercises:", error);
    return NextResponse.json(
      { error: "Failed to fetch completion status" },
      { status: 500 }
    );
  }
}
