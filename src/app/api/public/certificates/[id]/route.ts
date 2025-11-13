import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint to view certificate details
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        course: {
          select: {
            titleKey: true,
            descriptionKey: true,
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      certificate: {
        id: certificate.id,
        serial: certificate.serial,
        issuedAt: certificate.issuedAt,
        courseId: certificate.courseId,
      },
      user: {
        name: certificate.user.name,
        email: certificate.user.email,
        image: certificate.user.image,
      },
      course: {
        titleKey: certificate.course.titleKey,
        descriptionKey: certificate.course.descriptionKey,
        title: certificate.course.titleKey || "Unknown Course",
      },
    });
  } catch (error) {
    console.error("Error fetching public certificate:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificate" },
      { status: 500 }
    );
  }
}
