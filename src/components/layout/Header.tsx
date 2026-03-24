import Link from "next/link"
import { BookOpen, LogIn, LogOut, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth, signIn, signOut } from "@/auth"

const SUPER_ADMIN_EMAIL = "ftorresbaeza@gmail.com"

interface HeaderProps {
  courseName?: string
  courseCode?: string
}

export async function Header({ courseName, courseCode }: HeaderProps) {
  const session = await auth()

  return (
    <header className="sticky top-0 z-30 bg-bg-primary/95 backdrop-blur-sm border-b-2 border-border">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">

        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-primary">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          {courseCode ? (
            <div className="flex flex-col leading-none">
              <span className="font-display text-sm font-semibold text-text-primary truncate max-w-[140px]">
                {courseName}
              </span>
              <span className="font-mono text-[10px] font-bold text-accent-primary tracking-wider">
                {courseCode}
              </span>
            </div>
          ) : (
            <span className="font-display text-lg font-semibold text-text-primary">
              Cuaderno
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <div className="flex items-center gap-2">
              {/* Link admin si es super admin */}
              {session.user.email === SUPER_ADMIN_EMAIL && (
                <Link
                  href="/admin"
                  className="p-2 hover:bg-purple-50 rounded-xl transition-colors"
                  title="Panel de administración"
                >
                  <Shield className="h-4 w-4 text-purple-600" />
                </Link>
              )}
              {/* Chip de usuario logueado */}
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-green-50 border border-green-200 rounded-xl">
                {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt=""
                    className="h-6 w-6 rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-green-700">
                      {session.user.name?.[0] ?? "?"}
                    </span>
                  </div>
                )}
                <span className="text-xs font-semibold text-green-800 max-w-[72px] truncate">
                  {session.user.name?.split(" ")[0]}
                </span>
              </div>

              <form action={async () => {
                "use server"
                await signOut()
              }}>
                <button
                  type="submit"
                  className="text-text-muted hover:text-danger hover:bg-red-50 p-2 rounded-xl transition-all"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          ) : (
            <form action={async () => {
              "use server"
              await signIn("google")
            }}>
              <Button size="sm" variant="outline" className="h-9 gap-2 rounded-xl">
                <LogIn className="h-4 w-4" />
                <span>Entrar</span>
              </Button>
            </form>
          )}
        </div>

      </div>
    </header>
  )
}
