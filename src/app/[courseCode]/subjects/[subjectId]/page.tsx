import { notFound } from "next/navigation"
import { getSubjectWithImages } from "@/actions/subject"
import { deleteImageAdmin } from "@/actions/image"
import { ImageGrid } from "@/components/image/ImageGrid"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Image, Calendar } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { auth } from "@/auth"

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ courseCode: string; subjectId: string }>
}) {
  const { courseCode, subjectId } = await params
  const [{ subject, images, totalImages }, session] = await Promise.all([
    getSubjectWithImages(subjectId),
    auth(),
  ])

  if (!subject) {
    notFound()
  }

  // Puede eliminar: super admin, o miembro con rol OWNER/ADMIN en este curso
  const SUPER_ADMIN_EMAIL = "ftorresbaeza@gmail.com"
  const isSuperAdmin = session?.user?.email === SUPER_ADMIN_EMAIL
  const membership = subject.course.members?.find((m: { userId: string; role: string }) => m.userId === session?.user?.id)
  const canDelete = isSuperAdmin || membership?.role === "OWNER" || membership?.role === "ADMIN"

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
        <ImageGrid
          images={images}
          currentUserId={session?.user?.id}
          onDelete={canDelete ? deleteImageAdmin : undefined}
        />
      </div>
    </div>
  )
}
