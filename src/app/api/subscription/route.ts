import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    let subscription = await prisma.userSubscription.findUnique({
      where: { userId },
    });

    // If no subscription exists, create a default free subscription
    if (!subscription) {
      subscription = await prisma.userSubscription.create({
        data: {
          userId,
          plan: "free",
          status: "active",
          dailyPromptLimit: 5,
        },
      });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
