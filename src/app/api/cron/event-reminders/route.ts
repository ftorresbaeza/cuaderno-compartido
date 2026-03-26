import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPushToCourse } from "@/lib/webpush"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Mañana en hora Chile (UTC-3)
    const now = new Date()
    const chileOffset = -3
    const chileNow = new Date(now.getTime() + chileOffset * 60 * 60 * 1000)
    
    const tomorrow = new Date(chileNow)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const tomorrowEnd = new Date(tomorrow)
    tomorrowEnd.setHours(23, 59, 59, 999)

    const events = await prisma.event.findMany({
      where: {
        date: { gte: tomorrow, lte: tomorrowEnd },
      },
      include: {
        course: { select: { id: true, name: true, code: true } },
        subject: { select: { name: true } },
      },
    })

    if (events.length === 0) {
      return NextResponse.json({ success: true, notifications: 0 })
    }

    const eventTypeLabel: Record<string, string> = {
      TASK: "Tarea",
      TEST: "Prueba",
      ACTIVITY: "Actividad",
    }

    // Agrupar por curso para no spamear
    const byCourse = new Map<string, typeof events>()
    for (const event of events) {
      const list = byCourse.get(event.courseId) || []
      list.push(event)
      byCourse.set(event.courseId, list)
    }

    let sent = 0
    const results = await Promise.allSettled(
      Array.from(byCourse.entries()).map(async ([courseId, courseEvents]) => {
        const course = courseEvents[0].course
        const count = courseEvents.length

        if (count === 1) {
          const evt = courseEvents[0]
          const label = eventTypeLabel[evt.type] ?? "Evento"
          await sendPushToCourse(courseId, {
            title: `${course.name} · Mañana`,
            body: `${label}: ${evt.title}${evt.subject ? ` (${evt.subject.name})` : ""}`,
            url: `/${course.code}/calendar`,
          })
        } else {
          await sendPushToCourse(courseId, {
            title: `${course.name} · Mañana`,
            body: `${count} eventos programados`,
            url: `/${course.code}/calendar`,
          })
        }
        sent++
      })
    )

    return NextResponse.json({
      success: true,
      notifications: sent,
      totalEvents: events.length,
    })
  } catch (error) {
    console.error("Event reminder error:", error)
    return NextResponse.json({ error: "Reminder failed" }, { status: 500 })
  }
}
