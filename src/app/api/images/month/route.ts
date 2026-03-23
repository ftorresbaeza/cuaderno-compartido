import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const courseId = searchParams.get("courseId")
  const year = parseInt(searchParams.get("year") || "0")
  const month = parseInt(searchParams.get("month") || "0")

  if (!courseId || !year || !month) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59, 999)

  const images = await prisma.imageNote.groupBy({
    by: ["date", "subjectId"],
    where: {
      subject: { courseId },
      date: { gte: startDate, lte: endDate },
    },
    _count: { id: true },
  })

  const subjects = await prisma.subject.findMany({
    where: { courseId },
    select: { id: true, name: true },
  })

  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]))

  const result = images.map((img) => ({
    date: img.date.toISOString().split("T")[0],
    subjectId: img.subjectId,
    subjectName: subjectMap.get(img.subjectId) || "Sin nombre",
    imageCount: img._count.id,
  }))

  return NextResponse.json(result)
}
