import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { assessPrompt } from "@/lib/openrouter"
import { getTodayString } from "@/lib/utils"
import { z } from "zod"

const assessmentSchema = z.object({
  prompt: z.string().min(1),
  moduleId: z.string(),
  exerciseIndex: z.number().int().min(0),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { prompt, moduleId, exerciseIndex } = assessmentSchema.parse(body)

    // Check daily usage limit
    const today = getTodayString()
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId: session.user.id },
    })

    const dailyUsage = await prisma.dailyUsage.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
    })

    const limit = subscription?.dailyPromptLimit || 5
    const used = dailyUsage?.promptsUsed || 0

    if (limit !== -1 && used >= limit) {
      return NextResponse.json(
        { error: "Daily prompt limit reached. Please upgrade your plan." },
        { status: 429 }
      )
    }

    // Get module for context
    const moduleData = await prisma.module.findUnique({
      where: { id: moduleId },
    })

    if (!moduleData) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    // Assess the prompt
    const assessment = await assessPrompt(
      prompt,
      `Module: ${moduleData.title}\nExercise ${exerciseIndex + 1}`
    )

    // Save attempt
    await prisma.promptAttempt.create({
      data: {
        userId: session.user.id,
        moduleId,
        prompt,
        score: assessment.score,
        feedback: assessment.feedback,
      },
    })

    // Update or create user progress
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId,
        },
      },
    })

    if (existingProgress) {
      await prisma.userProgress.update({
        where: {
          userId_moduleId: {
            userId: session.user.id,
            moduleId,
          },
        },
        data: {
          score: Math.max(existingProgress.score, assessment.score),
          attempts: existingProgress.attempts + 1,
          lastAttempt: new Date(),
        },
      })
    } else {
      await prisma.userProgress.create({
        data: {
          userId: session.user.id,
          moduleId,
          score: assessment.score,
          attempts: 1,
        },
      })
    }

    // Update daily usage
    await prisma.dailyUsage.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
      update: {
        promptsUsed: { increment: 1 },
        lastActivity: new Date(),
      },
      create: {
        userId: session.user.id,
        date: today,
        promptsUsed: 1,
      },
    })

    return NextResponse.json(assessment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error assessing prompt:", error)
    return NextResponse.json(
      { error: "Failed to assess prompt" },
      { status: 500 }
    )
  }
}
