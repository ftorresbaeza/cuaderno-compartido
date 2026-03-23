import Link from "next/link"
import { BookOpen, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  courseName?: string
  courseCode?: string
}

export function Header({ courseName, courseCode }: HeaderProps) {
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
            <div className="sm:hidden">
              <span className="font-mono text-sm font-bold text-accent-primary">
                {courseCode}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
