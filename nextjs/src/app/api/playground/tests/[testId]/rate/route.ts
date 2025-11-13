import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Rate a model response in a test
export async function POST(
  request: Request,
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
    const { modelName, rating } = await request.json();

    if (!modelName || typeof rating !== "number") {
      return NextResponse.json(
        { error: "Model name and rating are required" },
        { status: 400 }
      );
    }

    // Verify test belongs to user
    const test = await prisma.playgroundTest.findUnique({
      where: {
        id: testId,
        userId: session.user.id,
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Update the results JSON to add rating
    const results = test.results as Array<{
      model: string;
      response?: string;
      rating?: number;
    }>;
    if (results && Array.isArray(results)) {
      const modelResult = results.find((r) => r.model === modelName);
      if (modelResult) {
        modelResult.rating = rating;
      }
    }

    await prisma.playgroundTest.update({
      where: { id: testId },
      data: { results },
    });

    return NextResponse.json({ message: "Rating saved", rating });
  } catch (error) {
    console.error("Error saving rating:", error);
    return NextResponse.json(
      { error: "Failed to save rating" },
      { status: 500 }
    );
  }
}
