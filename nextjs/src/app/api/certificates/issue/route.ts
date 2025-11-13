import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Check if certificate already exists
    const existing = await prisma.certificate.findFirst({
      where: {
        userId,
        courseId,
      },
    });

    if (existing) {
      return NextResponse.json({
        message: "Certificate already exists",
        certificate: existing,
      });
    }

    // Generate unique serial number
    const serial = `CERT-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;

    // Issue certificate
    const certificate = await prisma.certificate.create({
      data: {
        userId,
        courseId,
        serial,
        issuedAt: new Date(),
      },
    });

    return NextResponse.json({ certificate });
  } catch (error) {
    console.error("Error issuing certificate:", error);
    return NextResponse.json(
      { error: "Failed to issue certificate" },
      { status: 500 }
    );
  }
}
