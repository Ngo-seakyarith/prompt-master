import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        modules: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
      },
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}
