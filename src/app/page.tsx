import { Button } from "@/components/ui/button"
import { BookOpen, Lock, CheckCircle, LogIn, ChevronRight, Users, Crown, Shield } from "lucide-react"
import { auth, signIn, signOut } from "@/auth"
import { createCourse, joinCourse, getUserCourses } from "@/actions/course"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ShareButton } from "@/components/course/ShareButton"

const roleLabel: Record<string, { label: string; icon: typeof Crown }> = {
  OWNER:    { label: "Admin", icon: Crown },
  ADMIN:    { label: "Admin", icon: Shield },
  FOLLOWER: { label: "Miembro", icon: Users },
}

export default async function Home() {
  const session = await auth()
  const myCourses = session?.user ? await getUserCourses() : []

  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-lg px-4 pt-10 pb-16 space-y-6">

        {/* ── Logo + header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-primary shadow-sm">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-text-primary">Cuaderno</span>
          </div>

          {session?.user && (
            <form action={async () => {
              "use server"
              await signOut()
            }}>
              <button
                type="submit"
                className="text-xs text-text-muted underline underline-offset-2 hover:text-danger transition-colors"
              >
                Salir
              </button>
            </form>
          )}
        </div>

        {/* ── Estado del usuario ── */}
        {session?.user ? (
          <div className="space-y-5">
            {/* Tarjeta de bienvenida */}
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border-2 border-green-100">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt=""
                  className="h-14 w-14 rounded-full border-2 border-green-200 flex-shrink-0"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-green-700">
                    {session.user.name?.[0] ?? "?"}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-text-primary text-lg leading-tight truncate">
                  Hola, {session.user.name?.split(" ")[0]} 👋
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  <p className="text-xs text-green-700 truncate">{session.user.email}</p>
                </div>
              </div>
            </div>

            {/* Cursos del usuario (desde BD) */}
            {myCourses.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-text-secondary px-1">Tus cursos</p>
                {myCourses.map((course) => {
                  const role = roleLabel[course.role] ?? roleLabel.FOLLOWER
                  const RoleIcon = role.icon
                  return (
                    <Link
                      key={course.code}
                      href={`/${course.code}`}
                      className="flex items-center gap-3 p-4 bg-white rounded-2xl border-2 border-border active:scale-[0.98] transition-transform"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 flex-shrink-0">
                        <BookOpen className="h-5 w-5 text-accent-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary truncate leading-tight">{course.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-text-muted font-mono tracking-wider">{course.code}</span>
                          <span className="text-text-muted">·</span>
                          <div className="flex items-center gap-0.5">
                            <RoleIcon className="h-3 w-3 text-text-muted" />
                            <span className="text-xs text-text-muted">{role.label}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <ShareButton
                          courseCode={course.code}
                          courseName={course.name}
                          className="p-2 text-text-muted hover:text-accent-primary hover:bg-blue-50"
                        />
                        <ChevronRight className="h-5 w-5 text-text-muted" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-border">
                <BookOpen className="h-8 w-8 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-secondary font-medium">Aún no perteneces a ningún curso</p>
                <p className="text-xs text-text-muted mt-1">Ingresa el código abajo para unirte</p>
              </div>
            )}
          </div>

        ) : (
          /* NO LOGUEADO */
          <div className="text-center py-4 space-y-5">
            <div>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-accent-primary rounded-3xl mb-4 shadow-lg shadow-blue-200">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-display font-bold text-text-primary mb-2">
                Cuaderno Compartido
              </h1>
              <p className="text-sm text-text-secondary max-w-xs mx-auto leading-relaxed">
                Comparte fotos del cuaderno con el curso. Nunca te pierdas una clase.
              </p>
            </div>

            <form action={async () => {
              "use server"
              await signIn("google")
            }}>
              <Button
                type="submit"
                className="w-full bg-accent-primary hover:bg-blue-600 text-white font-semibold py-4 rounded-2xl gap-2 text-base"
              >
                <LogIn className="h-5 w-5" />
                Entrar con Google
              </Button>
            </form>

            <p className="text-xs text-text-muted">
              Solo para crear o administrar cursos. Puedes unirte sin cuenta.
            </p>
          </div>
        )}

        {/* ── Separador ── */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t-2 border-dashed border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-bg-primary px-3 text-xs uppercase tracking-wider text-text-muted font-medium">
              {session ? "Unirse a otro curso" : "Unirse con código"}
            </span>
          </div>
        </div>

        {/* ── Unirse a curso ── */}
        <div className="bg-white rounded-2xl border-2 border-border p-5 space-y-3">
          <label className="block text-sm font-semibold text-text-secondary">
            Código del curso
          </label>
          <form
            action={async (formData) => {
              "use server"
              const res = await joinCourse(formData.get("code") as string)
              if (res.success && res.course?.code) {
                redirect(`/${res.course.code}`)
              }
            }}
            className="space-y-3"
          >
            <input
              type="text"
              name="code"
              placeholder="ABC123"
              maxLength={6}
              autoCapitalize="characters"
              className="w-full px-4 py-4 border-2 border-border rounded-xl text-center text-2xl font-mono uppercase tracking-[0.3em] focus:border-accent-primary focus:outline-none transition-colors placeholder:text-border placeholder:tracking-widest"
              required
            />
            <Button
              type="submit"
              className="w-full bg-accent-primary hover:bg-blue-600 text-white font-semibold py-3.5 rounded-xl text-base"
            >
              Entrar al curso
            </Button>
          </form>
        </div>

        {/* ── Crear curso (solo logueados) ── */}
        {session ? (
          <div className="bg-white rounded-2xl border-2 border-border p-5 space-y-3">
            <label className="block text-sm font-semibold text-text-secondary">
              Crear nuevo curso
            </label>
            <form
              action={async (formData) => {
                "use server"
                const res = await createCourse(formData)
                if (res.success && res.code) {
                  redirect(`/${res.code}`)
                }
              }}
              className="space-y-3"
            >
              <input
                type="text"
                name="name"
                placeholder="Ej: 3° Básico A"
                className="w-full px-4 py-3.5 border-2 border-border rounded-xl focus:border-accent-primary focus:outline-none transition-colors"
                required
              />
              <Button
                type="submit"
                variant="outline"
                className="w-full border-2 border-accent-primary text-accent-primary hover:bg-blue-50 font-semibold py-3 rounded-xl"
              >
                Crear curso
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-border">
            <Lock className="h-5 w-5 text-text-muted flex-shrink-0" />
            <p className="text-sm text-text-muted leading-relaxed">
              <span className="font-medium text-text-secondary">¿Eres apoderado o profe?</span>{" "}
              Inicia sesión con Google para crear y administrar cursos.
            </p>
          </div>
        )}

        {/* Versión */}
        <p className="text-center text-[11px] text-text-muted/50 font-mono select-none">
          v{process.env.NEXT_PUBLIC_APP_VERSION} · {process.env.NEXT_PUBLIC_BUILD_DATE}
        </p>

      </div>
    </main>
  )
}
