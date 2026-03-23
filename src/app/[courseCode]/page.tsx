import Link from "next/link"
import { getCourseByCode } from "@/actions/course"
import { SubjectList } from "@/components/subject/SubjectList"
import { CourseDialogs } from "@/components/course/CourseDialogs"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, CheckCircle, AlertCircle, Star, Image, Users } from "lucide-react"
import { format, isToday } from "date-fns"
import { es } from "date-fns/locale"

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseCode: string }>
}) {
  const { courseCode } = await params
  const course = await getCourseByCode(courseCode)

  if (!course) {
    return <div>Curso no encontrado</div>
  }

  const today = new Date()
  const todayEvents = course.events.filter((e) => {
    const eventDate = new Date(e.date)
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    )
  })

  const totalImages = course.subjects.reduce((acc, s) => acc + s._count.images, 0)

  const eventIcons = {
    TASK: CheckCircle,
    TEST: AlertCircle,
    ACTIVITY: Star,
  }

  const eventColors = {
    TASK: "text-green-600 bg-green-50",
    TEST: "text-red-600 bg-red-50",
    ACTIVITY: "text-blue-600 bg-blue-50",
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <h1 className="text-2xl font-display font-bold text-text-primary mb-1">
          {course.name}
        </h1>
        <p className="text-text-muted text-sm">
          {isToday(today)
            ? "Hoy"
            : format(today, "EEEE d 'de' MMMM", { locale: es })}
        </p>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-accent-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent-primary/10 rounded-xl">
                <Image className="h-5 w-5 text-accent-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{totalImages}</p>
                <p className="text-xs text-text-muted">imágenes totales</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent-secondary/10 rounded-xl">
                <Users className="h-5 w-5 text-accent-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {course.subjects.length}
                </p>
                <p className="text-xs text-text-muted">asignaturas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {todayEvents.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Eventos de hoy
          </h2>
          <div className="space-y-2">
            {todayEvents.map((event) => {
              const Icon = eventIcons[event.type]
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 bg-bg-card rounded-xl border-2 border-border"
                >
                  <div className={`p-2 rounded-lg ${eventColors[event.type]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {event.title}
                    </p>
                    {event.subject && (
                      <p className="text-xs text-text-muted">{event.subject.name}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-secondary">
            Asignaturas
          </h2>
          <CourseDialogs
            courseId={course.id}
            courseCode={courseCode}
            subjects={course.subjects.map(s => ({ id: s.id, name: s.name }))}
          />
        </div>
        <SubjectList subjects={course.subjects} courseCode={courseCode} />
      </div>

      {course.events.filter((e) => new Date(e.date) >= today).length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Próximos eventos
          </h2>
          <div className="space-y-2">
            {course.events
              .filter((e) => new Date(e.date) >= today)
              .slice(0, 3)
              .map((event) => {
                const Icon = eventIcons[event.type]
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 bg-bg-card rounded-xl border-2 border-border"
                  >
                    <div className={`p-2 rounded-lg ${eventColors[event.type]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-text-muted">
                        {format(new Date(event.date), "d 'de' MMM", { locale: es })}
                      </p>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
