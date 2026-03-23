import { redirect } from "next/navigation"
import { getCourseByCode } from "@/actions/course"
import { Header } from "@/components/layout/Header"
import { BottomNav, FAB } from "@/components/layout/BottomNav"
import { CourseTracker } from "@/components/layout/CourseTracker"

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ courseCode: string }>
}) {
  const { courseCode } = await params
  const course = await getCourseByCode(courseCode)

  if (!course) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      <CourseTracker courseCode={course.code} courseName={course.name} />
      <Header courseName={course.name} courseCode={course.code} />
      <main className="mx-auto max-w-lg px-4 py-4">
        {children}
      </main>
      <FAB />
      <BottomNav />
    </div>
  )
}
