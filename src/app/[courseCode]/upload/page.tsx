import { getSubjects } from "@/actions/subject"
import { getCourseByCode } from "@/actions/course"
import { UploadDropzone } from "@/components/image/UploadDropzone"
import { Camera } from "lucide-react"

export default async function UploadPage({
  params,
}: {
  params: Promise<{ courseCode: string }>
}) {
  const { courseCode } = await params
  const course = await getCourseByCode(courseCode)

  if (!course) {
    return <div>Curso no encontrado</div>
  }

  const subjects = await getSubjects(course.id)

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4">
          <Camera className="h-8 w-8 text-accent-primary" />
        </div>
        <h1 className="text-xl font-display font-bold text-text-primary">
          Subir imágenes
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Comparte fotos de cuadernos con el curso
        </p>
      </div>

      <UploadDropzone
        courseCode={courseCode}
        subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  )
}
