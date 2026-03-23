import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateCourseCode } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get("name") as string

    if (!name || name.trim().length === 0) {
      return NextResponse.redirect(new URL("/?error=name_required", request.url))
    }

    let code = generateCourseCode()
    let attempts = 0

    while (attempts < 10) {
      const existing = await prisma.course.findUnique({ where: { code } })
      if (!existing) break
      code = generateCourseCode()
      attempts++
    }

    const course = await prisma.course.create({
      data: { name: name.trim(), code },
    })

    return NextResponse.redirect(
      new URL(`/${course.code}?created=true`, request.url),
      { status: 302 }
    )
  } catch (error) {
    console.error("Error creating course:", error)
    return NextResponse.redirect(new URL("/?error=create_failed", request.url))
  }
}
