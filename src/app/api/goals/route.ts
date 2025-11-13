import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createGoalSchema = z.object({
  courseId: z.string().optional(),
  targetDate: z.string(),
  targetModulesPerWeek: z.number().int().min(1),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goals = await prisma.goal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        course: true,
      },
    })

    return NextResponse.json(goals)
  } catch (error) {
    console.error("Error fetching goals:", error)
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { courseId, targetDate, targetModulesPerWeek, notes } =
      createGoalSchema.parse(body)

    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        courseId,
        targetDate: new Date(targetDate),
        targetModulesPerWeek,
        notes,
      },
    })

    return NextResponse.json(goal)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Error creating goal:", error)
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    )
  }
}
