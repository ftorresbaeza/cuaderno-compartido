"use client"

import { useEffect } from "react"

export function CourseTracker({ 
  courseCode, 
  courseName 
}: { 
  courseCode: string, 
  courseName: string 
}) {
  useEffect(() => {
    try {
      const recentRaw = localStorage.getItem("recent-courses")
      const recent = recentRaw ? JSON.parse(recentRaw) : []
      
      const newCourse = { 
        code: courseCode, 
        name: courseName, 
        lastVisited: new Date().toISOString() 
      }
      
      // Filtramos duplicados y mantenemos los últimos 5
      const filtered = recent.filter((c: any) => c.code !== courseCode)
      const updated = [newCourse, ...filtered].slice(0, 5)
      
      localStorage.setItem("recent-courses", JSON.stringify(updated))
    } catch (e) {
      console.error("Error saving recent course:", e)
    }
  }, [courseCode, courseName])
  
  return null
}
