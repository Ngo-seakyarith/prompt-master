import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get all modules for a specific course
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const modules = await prisma.module.findMany({
      where: { courseId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error("Error fetching course modules:", error);
    return NextResponse.json(
      { error: "Failed to fetch course modules" },
      { status: 500 }
    );
  }
}
