"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, ChevronRight, Clock } from "lucide-react"

interface RecentCourse {
  code: string
  name: string
  lastVisited: string
}

export function RecentCourses() {
  const [courses, setCourses] = useState<RecentCourse[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem("recent-courses")
      if (raw) setCourses(JSON.parse(raw))
    } catch {}
  }, [])

  if (!mounted) return null

  if (courses.length === 0) {
    return (
      <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-border">
        <BookOpen className="h-8 w-8 text-text-muted mx-auto mb-2" />
        <p className="text-sm text-text-secondary font-medium">Aún no has visitado ningún curso</p>
        <p className="text-xs text-text-muted mt-1">Ingresa el código de tu curso abajo</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-text-muted" />
        <h2 className="text-sm font-semibold text-text-secondary">Tus cursos</h2>
      </div>
      <div className="space-y-2">
        {courses.map((course, i) => (
          <Link
            key={course.code}
            href={`/${course.code}`}
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border-2 border-border active:scale-[0.98] transition-transform"
            style={{ borderLeftWidth: "4px", borderLeftColor: i === 0 ? "var(--accent-primary)" : "var(--border)" }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 flex-shrink-0">
              <BookOpen className="h-5 w-5 text-accent-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text-primary truncate leading-tight">{course.name}</p>
              <p className="text-xs text-text-muted font-mono tracking-wider mt-0.5">{course.code}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-text-muted flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
