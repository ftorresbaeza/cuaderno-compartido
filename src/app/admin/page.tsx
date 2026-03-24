import { auth } from "@/auth"
import { getAllCoursesAdmin, deleteCourseAdmin, takeOwnershipAdmin } from "@/actions/course"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Users, BookOpen, Calendar, Shield, Trash2, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const SUPER_ADMIN_EMAIL = "ftorresbaeza@gmail.com"

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user || session.user.email !== SUPER_ADMIN_EMAIL) {
    redirect("/")
  }

  const courses = await getAllCoursesAdmin()
  if (!courses) redirect("/")

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="sticky top-0 z-30 bg-bg-primary/95 backdrop-blur-sm border-b-2 border-border">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-semibold text-text-primary">
              Panel Admin
            </span>
          </div>
          <Link href="/" className="text-sm text-text-muted hover:text-accent-primary transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white border-2 border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                <BookOpen className="h-5 w-5 text-accent-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{courses.length}</p>
                <p className="text-xs text-text-muted">Cursos totales</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-2 border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-xl">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {courses.reduce((acc, c) => acc + c._count.members, 0)}
                </p>
                <p className="text-xs text-text-muted">Membresías totales</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses list */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Todos los cursos
          </h2>
          <div className="space-y-3">
            {courses.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">No hay cursos registrados</p>
            ) : (
              courses.map((course) => {
                const owner = course.members[0]?.user
                return (
                  <Card key={course.id} className="bg-white border-2 border-border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        {/* Info */}
                        <Link href={`/${course.code}`} className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-accent-primary bg-blue-50 px-2 py-0.5 rounded-lg">
                              {course.code}
                            </span>
                            <h3 className="font-semibold text-text-primary truncate">{course.name}</h3>
                          </div>
                          {owner && (
                            <p className="text-xs text-text-muted">Owner: {owner.name ?? owner.email}</p>
                          )}
                          <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(course.createdAt), "d 'de' MMM yyyy", { locale: es })}
                            <span className="ml-2 flex items-center gap-0.5">
                              <Users className="h-3 w-3" />{course._count.members}
                            </span>
                          </p>
                        </Link>

                        {/* Acciones */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <form action={async () => {
                            "use server"
                            await takeOwnershipAdmin(course.id)
                          }}>
                            <button
                              type="submit"
                              title="Tomar control como owner"
                              className="p-2 hover:bg-purple-50 rounded-xl transition-colors text-purple-500 hover:text-purple-700"
                            >
                              <ShieldCheck className="h-4 w-4" />
                            </button>
                          </form>
                          <form action={async () => {
                            "use server"
                            await deleteCourseAdmin(course.id)
                          }}>
                            <button
                              type="submit"
                              title="Eliminar curso"
                              className="p-2 hover:bg-red-50 rounded-xl transition-colors text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </form>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
