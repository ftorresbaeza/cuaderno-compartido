import { auth } from "@/auth"
import { getCourseByCode, renameCourse, deleteCourse } from "@/actions/course"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Pencil, Trash2, Copy, Share2 } from "lucide-react"
import Link from "next/link"

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ courseCode: string }>
}) {
  const { courseCode } = await params
  const session = await auth()

  if (!session?.user) {
    redirect("/")
  }

  const course = await getCourseByCode(courseCode)
  if (!course) redirect("/")

  const currentMember = course.members.find((m) => m.userId === session.user?.id)
  if (!currentMember || (currentMember.role !== "OWNER" && currentMember.role !== "ADMIN")) {
    redirect(`/${courseCode}`)
  }

  const isOwner = currentMember.role === "OWNER"
  const memberCount = course.members.length

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 py-4">
        <Link
          href={`/${courseCode}`}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-text-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Configuración</h1>
          <p className="text-text-muted text-sm">{course.name}</p>
        </div>
      </div>

      {/* Info del curso */}
      <Card className="bg-white border-2 border-border shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Código</p>
            <span className="font-mono text-sm font-bold text-accent-primary bg-blue-50 px-2 py-1 rounded-lg">
              {course.code}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Nombre</p>
            <p className="text-sm font-medium text-text-primary">{course.name}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Tu rol</p>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              isOwner
                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}>
              {isOwner ? "Propietario" : "Administrador"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Miembros */}
      <Link href={`/${courseCode}/members`}>
        <Card className="bg-white border-2 border-border shadow-sm hover:border-accent-primary/40 transition-colors cursor-pointer">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Users className="h-5 w-5 text-accent-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-text-primary">Gestionar miembros</p>
              <p className="text-xs text-text-muted">
                {memberCount} {memberCount === 1 ? "miembro" : "miembros"} en el curso
              </p>
            </div>
            <ArrowLeft className="h-4 w-4 text-text-muted rotate-180" />
          </CardContent>
        </Card>
      </Link>

      {/* Compartir código */}
      <Card className="bg-white border-2 border-border shadow-sm">
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Share2 className="h-4 w-4 text-accent-primary" />
            Compartir acceso al curso
          </p>
          <p className="text-xs text-text-muted">
            Comparte este código con los estudiantes para que puedan unirse al curso.
          </p>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <code className="flex-1 font-mono text-lg font-bold text-accent-primary tracking-widest">
              {course.code}
            </code>
            <form action={async () => {
              "use server"
              // client-side copy handled via ShareButton
            }}>
              <Link
                href={`/${courseCode}`}
                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                title="Volver"
              >
                <Copy className="h-4 w-4 text-text-muted" />
              </Link>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Versión de la app */}
      <div className="text-center py-2">
        <p className="text-xs text-text-muted">
          Cuaderno Compartido{" "}
          <span className="font-mono">
            v{process.env.NEXT_PUBLIC_APP_VERSION} · {process.env.NEXT_PUBLIC_BUILD_DATE}
          </span>
        </p>
      </div>

      {/* Acciones del owner */}
      {isOwner && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-1">
            Administración
          </p>

          {/* Renombrar */}
          <Card className="bg-white border-2 border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Pencil className="h-4 w-4 text-accent-primary" />
                Renombrar curso
              </p>
              <form
                action={async (formData: FormData) => {
                  "use server"
                  const newName = formData.get("name") as string
                  await renameCourse(course.id, newName)
                  redirect(`/${courseCode}/settings`)
                }}
                className="flex gap-2"
              >
                <input
                  name="name"
                  type="text"
                  defaultValue={course.name}
                  required
                  className="flex-1 rounded-xl border-2 border-border bg-bg-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                />
                <Button type="submit" size="sm" className="rounded-xl">
                  Guardar
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Eliminar */}
          <Card className="bg-white border-2 border-red-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-red-700 mb-1 flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Eliminar curso
              </p>
              <p className="text-xs text-text-muted mb-3">
                Esta acción es irreversible. Se eliminarán todas las asignaturas, imágenes y eventos.
              </p>
              <form
                action={async () => {
                  "use server"
                  await deleteCourse(course.id)
                }}
              >
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  className="w-full rounded-xl"
                >
                  Eliminar permanentemente
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
