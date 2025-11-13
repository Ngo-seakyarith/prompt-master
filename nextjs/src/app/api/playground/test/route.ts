import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { runMultiModelTest } from "@/lib/openrouter"
import { z } from "zod"

const testSchema = z.object({
  promptText: z.string().min(1),
  models: z.array(z.string()).min(1).max(10),
  parameters: z.object({
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().int().min(1).max(8192).default(1000),
    topP: z.number().min(0).max(1).default(1),
  }),
  promptId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { promptText, models, parameters, promptId } = testSchema.parse(body)

    // Run the test
    const testResults = await runMultiModelTest(promptText, models, parameters)

    // Save test
    await prisma.playgroundTest.create({
      data: {
        userId: session.user.id,
        promptId,
        promptText,
        models,
        parameters,
        results: testResults.results,
        totalCost: testResults.totalCost,
      },
    })

    // Update usage
    const existingUsage = await prisma.playgroundUsage.findUnique({
      where: { userId: session.user.id },
    })

    const newTotalCost = existingUsage
      ? (parseFloat(existingUsage.totalCost) + parseFloat(testResults.totalCost)).toFixed(6)
      : testResults.totalCost

    await prisma.playgroundUsage.upsert({
      where: { userId: session.user.id },
      update: {
        testsRun: { increment: 1 },
        totalCost: newTotalCost,
        lastActive: new Date(),
      },
      create: {
        userId: session.user.id,
        testsRun: 1,
        totalCost: testResults.totalCost,
      },
    })

    return NextResponse.json(testResults)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error running playground test:", error)
    return NextResponse.json(
      { error: "Failed to run test" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tests = await prisma.playgroundTest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json(tests)
  } catch (error) {
    console.error("Error fetching tests:", error)
    return NextResponse.json(
      { error: "Failed to fetch tests" },
      { status: 500 }
    )
  }
}
