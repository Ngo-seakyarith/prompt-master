import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const certificates = await prisma.certificate.findMany({
      where: { userId: session.user.id },
      orderBy: { issuedAt: "desc" },
      include: {
        course: true,
      },
    })

    return NextResponse.json(certificates)
  } catch (error) {
    console.error("Error fetching certificates:", error)
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    )
  }
}
