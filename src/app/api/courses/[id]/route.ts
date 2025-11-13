import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const { id } = await params
    
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // If user is authenticated, include their progress
    if (session) {
      const userProgress = await prisma.userProgress.findMany({
        where: {
          userId: session.user.id,
          moduleId: { in: course.modules.map((m) => m.id) },
        },
      })

      const modulesWithProgress = course.modules.map((module) => {
        const progress = userProgress.find((p) => p.moduleId === module.id)
        return {
          ...module,
          userProgress: progress || null,
        }
      })

      return NextResponse.json({
        ...course,
        modules: modulesWithProgress,
      })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    )
  }
}
