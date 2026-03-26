import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

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

  const events = await prisma.event.findMany({
    where: {
      courseId,
      date: { gte: startDate, lte: endDate },
    },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      date: true,
      createdBy: true,
      subject: {
        select: { id: true, name: true },
      },
    },
    orderBy: { date: "asc" },
  })

  return NextResponse.json(events.map(e => ({
    ...e,
    subject: e.subject || undefined,
  })))
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params
  
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { createdBy: true },
  })
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }
  if (event.createdBy !== session.user.id) {
    return NextResponse.json({ error: "Only the creator can delete" }, { status: 403 })
  }
  
  try {
    await prisma.event.delete({
      where: { id: eventId },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Error deleting event" }, { status: 500 })
  }
}
