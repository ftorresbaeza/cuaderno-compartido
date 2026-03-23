import { getSubjects } from "@/actions/subject"
import { getCourseByCode } from "@/actions/course"
import { SubjectList } from "@/components/subject/SubjectList"
import { CreateSubjectDialog } from "@/components/subject/CreateSubjectDialog"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

export default async function SubjectsPage({
  params,
}: {
  params: Promise<{ courseCode: string }>
}) {
  const { courseCode } = await params
  const course = await getCourseByCode(courseCode)

  if (!course) {
    return <div>Curso no encontrado</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold text-text-primary mb-1">
          Asignaturas
        </h1>
        <p className="text-sm text-text-muted">
          {course.subjects.length} asignatura(s) en el curso
        </p>
      </div>

      <SubjectList subjects={course.subjects} courseCode={courseCode} />
    </div>
  )
}
