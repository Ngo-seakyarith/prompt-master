import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Get playground usage statistics
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get test count and aggregate stats
    const tests = await prisma.playgroundTest.findMany({
      where: { userId },
      select: {
        totalCredits: true,
        createdAt: true,
      },
    });

    // Calculate monthly tests (tests in current month)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyTests = tests.filter(t => new Date(t.createdAt) >= monthStart).length;

    // Calculate total credits
    const totalCredits = tests.reduce((sum, t) => sum + (t.totalCredits || 0), 0);

    // Get last active date
    const lastTest = tests.length > 0
      ? tests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      : null;

    return NextResponse.json({
      testsRun: tests.length,
      totalCredits: totalCredits,
      monthlyTests,
      lastActive: lastTest?.createdAt || null,
      monthlyReset: monthStart,
    });
  } catch (error) {
    console.error("Error fetching playground usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage" },
      { status: 500 }
    );
  }
}
