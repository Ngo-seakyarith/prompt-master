import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Simple recommendation algorithm - you can enhance this later
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user progress
    const progress = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        module: true,
      },
    });

    // Get all modules for recommendations
    const modules = await prisma.module.findMany();

    // Simple recommendation logic
    const recommendations = [];
    const completedModuleIds = progress
      .filter((p) => p.isCompleted)
      .map((p) => p.moduleId);

    // Recommend next modules in sequence
    for (const mod of modules) {
      if (!completedModuleIds.includes(mod.id)) {
        // Check if prerequisites are met
        const prerequisitesMet = true; // Simplified - check actual prerequisites
        
        recommendations.push({
          id: `rec-${mod.id}`,
          type: "next-in-sequence" as const,
          moduleId: mod.id,
          courseId: mod.courseId,
          title: mod.title,
          description: mod.description || "Continue your learning journey",
          reasoning: "Next recommended module in your learning path",
          priorityScore: 85,
          estimatedTime: "30 mins",
          difficulty: "beginner" as const,
          metadata: {
            currentProgress: 0,
            prerequisitesMet,
          },
        });
      }
    }

    // User profile summary
    const userProfile = {
      totalModulesCompleted: completedModuleIds.length,
      averageScore: progress.length > 0 
        ? progress.reduce((sum, p) => sum + (p.score || 0), 0) / progress.length 
        : 0,
      preferredDifficulty: "beginner",
      learningVelocity: 1.0,
      strongAreas: [],
      improvementAreas: [],
      goalAlignment: 75,
    };

    return NextResponse.json({
      recommendations: recommendations.slice(0, 8),
      userProfile,
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
