import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Image } from "lucide-react"

interface Subject {
  id: string
  name: string
  _count: { images: number }
}

interface SubjectListProps {
  subjects: Subject[]
  courseCode: string
}

export function SubjectList({ subjects, courseCode }: SubjectListProps) {
  if (subjects.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-text-muted mb-4" />
          <p className="text-text-secondary font-medium">
            No hay asignaturas todavía
          </p>
          <p className="text-text-muted text-sm mt-1">
            Crea la primera asignatura para comenzar
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-3">
      {subjects.map((subject) => (
        <Link
          key={subject.id}
          href={`/${courseCode}/subjects/${subject.id}`}
        >
          <Card className="hover:border-accent-primary hover:shadow-md transition-all active:scale-[0.99]">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <BookOpen className="h-6 w-6 text-accent-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-primary truncate">
                  {subject.name}
                </h3>
                <p className="text-sm text-text-muted flex items-center gap-1">
                  <Image className="h-3.5 w-3.5" />
                  {subject._count.images} imágenes
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
