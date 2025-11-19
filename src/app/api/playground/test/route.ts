import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { runMultiModelTest } from "@/lib/openrouter"
import { z } from "zod"

const testSchema = z.object({
  promptText: z.string().min(1),
  models: z.array(z.string()).min(1).max(10),
  promptId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { promptText, models, promptId } = testSchema.parse(body)

    // Run the test
    const testResults = await runMultiModelTest(promptText, models)

    // Save test
    await prisma.playgroundTest.create({
      data: {
        userId: session.user.id,
        promptId,
        promptText,
        models,
        results: testResults.results,
        totalCredits: testResults.totalCredits,
      },
    })

    // Update usage
    const existingUsage = await prisma.playgroundUsage.findUnique({
      where: { userId: session.user.id },
    })

    const newTotalCredits = existingUsage
      ? existingUsage.totalCredits + testResults.totalCredits
      : testResults.totalCredits

    await prisma.playgroundUsage.upsert({
      where: { userId: session.user.id },
      update: {
        testsRun: { increment: 1 },
        totalCredits: newTotalCredits,
        lastActive: new Date(),
      },
      create: {
        userId: session.user.id,
        testsRun: 1,
        totalCredits: testResults.totalCredits,
      },
    })

    return NextResponse.json(testResults)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
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
