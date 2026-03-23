import { getCourseByCode } from "@/actions/course"
import { getEventsByMonth } from "@/actions/event"
import { getImagesByMonth } from "@/actions/image"
import { CalendarClient } from "@/components/calendar/CalendarClient"
import { Calendar } from "lucide-react"

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ courseCode: string }>
}) {
  const { courseCode } = await params
  const course = await getCourseByCode(courseCode)

  if (!course) {
    return <div>Curso no encontrado</div>
  }

  const now = new Date()
  const [events, images] = await Promise.all([
    getEventsByMonth(course.id, now.getFullYear(), now.getMonth() + 1),
    getImagesByMonth(course.id, now.getFullYear(), now.getMonth() + 1),
  ])

  const formattedEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    type: e.type,
    date: e.date.toISOString(),
    subject: e.subject ? { name: e.subject.name } : undefined,
  }))

  const formattedImages = images.map((img) => ({
    date: img.date.toISOString().split("T")[0],
    subjectId: img.subjectId,
    subjectName: course.subjects.find((s) => s.id === img.subjectId)?.name || "Sin nombre",
    imageCount: img.imageCount,
  }))

  return (
    <CalendarClient
      courseId={course.id}
      courseCode={courseCode}
      subjects={course.subjects.map((s) => ({ id: s.id, name: s.name }))}
      initialEvents={formattedEvents}
      initialImages={formattedImages}
    />
  )
}
