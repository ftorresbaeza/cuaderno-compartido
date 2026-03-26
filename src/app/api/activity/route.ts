import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const VALID_TYPES = ["REQUEST_IMAGES", "SHARE_LINK"]

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { courseId, type } = await req.json()

  if (!courseId || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  await prisma.userActivity.create({
    data: { userId: session.user.id, courseId, type },
  })

  return NextResponse.json({ success: true })
}
