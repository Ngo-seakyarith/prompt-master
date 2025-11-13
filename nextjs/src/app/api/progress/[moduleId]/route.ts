import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Get user progress for a specific module
export async function GET(
  _request: Request,
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

    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId,
        },
      },
    });

    return NextResponse.json(progress || null);
  } catch (error) {
    console.error("Error fetching module progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch module progress" },
      { status: 500 }
    );
  }
}
