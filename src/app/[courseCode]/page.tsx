import Link from "next/link"
import { getCourseByCode } from "@/actions/course"
import { SubjectList } from "@/components/subject/SubjectList"
import { CourseDialogs } from "@/components/course/CourseDialogs"
import { ShareButton } from "@/components/course/ShareButton"
import { RequestPhotosButton } from "@/components/course/RequestPhotosButton"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, CheckCircle, AlertCircle, Star, Image, Users, Settings, LogIn } from "lucide-react"
import { auth, signIn } from "@/auth"
import { format, isToday } from "date-fns"
import { es } from "date-fns/locale"

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseCode: string }>
  searchParams: Promise<{ date?: string }>
}) {
  const { courseCode } = await params
  const { date: dateParam } = await searchParams
  const course = await getCourseByCode(courseCode)
  const session = await auth()

  if (!course) {
    return <div>Curso no encontrado</div>
  }

  // Verificar si es admin o owner
  const currentMember = course.members.find(m => m.userId === session?.user?.id)
  const canManage = currentMember?.role === "OWNER" || currentMember?.role === "ADMIN"

  const selectedDate = dateParam ? new Date(dateParam) : new Date()
  selectedDate.setHours(12, 0, 0, 0)
  
  const displayDate = dateParam ? new Date(dateParam) : new Date()

  const todayEvents = course.events.filter((e) => {
    const eventDate = new Date(e.date)
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
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
      {/* Banner: invitar a loguearse si es anónimo */}
      {!session?.user && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-2xl border border-blue-100">
          <LogIn className="h-5 w-5 text-accent-primary flex-shrink-0" />
          <p className="text-sm text-blue-800 flex-1 leading-snug">
            <span className="font-semibold">¿Quieres recordar este curso?</span>{" "}
            Inicia sesión con Google y aparecerá automáticamente la próxima vez.
          </p>
          <form action={async () => {
            "use server"
            await signIn("google")
          }}>
            <button type="submit" className="text-xs font-bold text-accent-primary whitespace-nowrap">
              Entrar
            </button>
          </form>
        </div>
      )}

      <div className="flex items-center justify-between py-2">
        <div className="flex-1" />
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-display font-bold text-text-primary mb-1">
            {course.name}
          </h1>
          <p className="text-text-muted text-sm">
            {isToday(displayDate)
              ? "Hoy"
              : format(displayDate, "EEEE d 'de' MMMM", { locale: es })}
          </p>
        </div>
        <div className="flex-1 flex justify-end items-center gap-1">
          <RequestPhotosButton
            courseCode={courseCode}
            courseName={course.name}
            subjects={course.subjects.map(s => ({ id: s.id, name: s.name }))}
          />
          <ShareButton
            courseCode={courseCode}
            courseName={course.name}
            className="p-2 text-text-muted hover:text-accent-primary hover:bg-blue-50"
          />
          {canManage && (
            <Link
              href={`/${courseCode}/settings`}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              title="Configuración del curso"
            >
              <Settings className="h-5 w-5 text-text-muted" />
            </Link>
          )}
        </div>
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

      {course.events.filter((e) => new Date(e.date) >= selectedDate).length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {dateParam ? "Eventos para este día" : "Próximos eventos"}
          </h2>
          <div className="space-y-2">
            {course.events
              .filter((e) => new Date(e.date) >= selectedDate)
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
