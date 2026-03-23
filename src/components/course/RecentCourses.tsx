"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, History, ArrowRight } from "lucide-react"

interface Course {
  code: string
  name: string
  lastVisited: string
}

export function RecentCourses() {
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem("recent-courses")
      if (stored) {
        setCourses(JSON.parse(stored))
      }
    } catch (e) {
      console.error("Error reading recent courses:", e)
    }
  }, [])

  if (courses.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-text-secondary">
        <History className="h-4 w-4" />
        <h2 className="text-sm font-semibold uppercase tracking-wider">
          Cursos recientes
        </h2>
      </div>
      
      <div className="grid gap-3">
        {courses.map((course) => (
          <Link key={course.code} href={`/${course.code}`}>
            <Card className="hover:border-accent-primary hover:bg-blue-50/50 transition-all group overflow-hidden">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary text-white font-mono font-bold text-xs">
                    {course.code}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary truncate">
                      {course.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      Visto el {new Date(course.lastVisited).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-accent-primary group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
