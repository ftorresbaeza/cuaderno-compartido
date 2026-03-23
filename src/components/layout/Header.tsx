import Link from "next/link"
import { BookOpen, Settings, LogIn, LogOut, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth, signIn, signOut } from "@/auth"

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
          <span className="font-display text-lg font-semibold text-text-primary">
            Cuaderno
          </span>
        </Link>

        {courseCode && (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-medium text-text-secondary">
                {courseName}
              </span>
              <span className="font-mono text-xs font-bold text-accent-primary tracking-wider">
                {courseCode}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {session?.user ? (
            <div className="flex items-center gap-3">
              {session.user.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || ""} 
                  className="h-8 w-8 rounded-full border-2 border-accent-primary"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-accent-primary">
                  <UserIcon className="h-4 w-4" />
                </div>
              )}
              <form action={async () => {
                "use server"
                await signOut()
              }}>
                <button type="submit" className="text-text-muted hover:text-danger hover:bg-red-50 p-2 rounded-xl transition-all">
                  <LogOut className="h-5 w-5" />
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
                <span className="hidden sm:inline">Entrar</span>
              </Button>
            </form>
          )}
        </div>
      </div>
    </header>
  )
}
