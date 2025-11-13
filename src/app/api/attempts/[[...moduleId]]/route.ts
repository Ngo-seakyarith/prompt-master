import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Get user's prompt attempts for a specific module (or all if no moduleId)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ moduleId?: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { moduleId } = await params;

    const attempts = await prisma.promptAttempt.findMany({
      where: {
        userId: session.user.id,
        ...(moduleId && { moduleId }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        module: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error("Error fetching attempts:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempts" },
      { status: 500 }
    );
  }
}
