import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const dailyUsage = await prisma.dailyUsage.findFirst({
      where: {
        userId,
        date,
      },
    });

    const subscription = await prisma.userSubscription.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      usage: dailyUsage || {
        promptsUsed: 0,
        testsRun: 0,
        totalCost: "0",
      },
      subscription: subscription || { plan: "free", dailyPromptLimit: 5 },
      date,
    });
  } catch (error) {
    console.error("Error fetching daily usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage" },
      { status: 500 }
    );
  }
}
