import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const code = (formData.get("code") as string)?.toUpperCase().trim()

    if (!code || code.length !== 6) {
      return NextResponse.redirect(new URL("/?error=invalid_code", request.url))
    }

    const course = await prisma.course.findUnique({ where: { code } })

    if (!course) {
      return NextResponse.redirect(new URL("/?error=not_found", request.url))
    }

    return NextResponse.redirect(
      new URL(`/${course.code}`, request.url),
      { status: 302 }
    )
  } catch (error) {
    console.error("Error joining course:", error)
    return NextResponse.redirect(new URL("/?error=join_failed", request.url))
  }
}
