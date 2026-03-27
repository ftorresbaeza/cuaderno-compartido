import { getCourseByCode } from "@/actions/course"
import { getEventsByMonth } from "@/actions/event"
import { getImagesByMonth } from "@/actions/image"
import { CalendarClient } from "@/components/calendar/CalendarClient"
import { Calendar } from "lucide-react"
import { auth } from "@/auth"

export default async function CalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseCode: string }>
  searchParams: Promise<{ date?: string }>
}) {
  const { courseCode } = await params
  const { date: dateParam } = await searchParams
  const [course, session] = await Promise.all([
    getCourseByCode(courseCode),
    auth(),
  ])

  if (!course) {
    return <div>Curso no encontrado</div>
  }

  const now = dateParam ? new Date(dateParam) : new Date()
  const [events, images] = await Promise.all([
    getEventsByMonth(course.id, now.getFullYear(), now.getMonth() + 1),
    getImagesByMonth(course.id, now.getFullYear(), now.getMonth() + 1),
  ])

  const formattedEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    type: e.type,
    date: e.date.toISOString(),
    subject: e.subject ? { id: e.subject.id, name: e.subject.name } : undefined,
    createdBy: e.createdBy,
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
      currentUserId={session?.user?.id}
      initialDate={dateParam ? new Date(dateParam) : undefined}
    />
  )
}
