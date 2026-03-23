import { notFound } from "next/navigation"
import { getSubjectWithImages } from "@/actions/subject"
import { ImageGrid } from "@/components/image/ImageGrid"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Image, Calendar } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ courseCode: string; subjectId: string }>
}) {
  const { courseCode, subjectId } = await params
  const { subject, images, totalImages } = await getSubjectWithImages(subjectId)

  if (!subject) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
          <BookOpen className="h-7 w-7 text-accent-primary" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-text-primary">
            {subject.name}
          </h1>
          <p className="text-sm text-text-muted flex items-center gap-2">
            <Image className="h-4 w-4" />
            {totalImages} imagen(es)
          </p>
        </div>
      </div>

      <Card className="bg-bg-secondary/50">
        <CardContent className="p-4">
          <p className="text-sm text-text-secondary">
            Curso: <span className="font-medium text-text-primary">{subject.course.name}</span>
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-sm font-semibold text-text-secondary mb-3">
          Galería de imágenes
        </h2>
        <ImageGrid images={images} />
      </div>
    </div>
  )
}
