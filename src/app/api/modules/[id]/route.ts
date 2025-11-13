import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const moduleData = await prisma.module.findUnique({
      where: { id },
    });

    if (!moduleData) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    return NextResponse.json(moduleData);
  } catch (error) {
    console.error("Error fetching module:", error);
    return NextResponse.json(
      { error: "Failed to fetch module" },
      { status: 500 }
    );
  }
}
