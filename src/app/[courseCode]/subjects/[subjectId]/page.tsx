"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { useRouter } from "next/navigation"
import { getSubjectWithImages } from "@/actions/subject"
import { deleteImageAdmin, getThanksForImages } from "@/actions/image"
import { ImageGrid } from "@/components/image/ImageGrid"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Image, Calendar, X, Share2 } from "lucide-react"
import { ChevronDown, Search } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { auth } from "@/auth"

interface SubjectPageProps {
  params: Promise<{ courseCode: string; subjectId: string }>
  searchParams: Promise<{ image?: string }>
}

type SubjectData = Awaited<ReturnType<typeof getSubjectWithImages>>

export default function SubjectPage({ params, searchParams }: SubjectPageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [subjectData, setSubjectData] = useState<SubjectData | null>(null)
  const [thanksData, setThanksData] = useState<Record<string, { count: number; thankedByMe: boolean }> | undefined>(undefined)
  const [session, setSession] = useState<any>(null)
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    
    async function loadData() {
      const [{ subjectId }, { image }] = await Promise.all([params, searchParams])
      const [data, authSession] = await Promise.all([
        getSubjectWithImages(subjectId),
        auth(),
      ])
      
      if (!mounted) return
      
      setSubjectData(data)
      setSession(authSession)
      
      if (data.subject && data.images.length > 0) {
        const imageIds = data.images.map((img) => img.id)
        const thanks = await getThanksForImages(imageIds, authSession?.user?.id)
        if (!mounted) return
        setThanksData(thanks)
      }
      
      if (image) {
        setSelectedImageId(image)
      }
      
      setIsLoading(false)
    }
    loadData()
    
    return () => { mounted = false }
  }, [])

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted">Cargando...</div>
  }

  if (!subjectData?.subject) {
    notFound()
  }

  const { subject, images: allImages, totalImages } = subjectData

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
        
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-text-muted">
            {allImages.length} imagenes
          </span>
        </div>

        <ImageGrid
          images={allImages}
          currentUserId={session?.user?.id}
          thanksData={thanksData}
          onDelete={canDelete ? deleteImageAdmin : undefined}
        />

        {/* Modal para imagen compartida */}
        {selectedImageId && subjectData && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <button
              onClick={() => {
                setSelectedImageId(null)
                router.push(`/${subjectData.subject!.course.code}/${subjectData.subject!.id}`)
              }}
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
            {(() => {
              const sharedImage = allImages.find(img => img.id === selectedImageId)
              if (!sharedImage) return null
              return (
                <div className="max-w-4xl w-full space-y-4">
                  <img
                    src={sharedImage.url}
                    alt="Imagen compartida"
                    className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                  />
                  <div className="flex items-center justify-between text-white">
                    <p className="text-sm">
                      {format(new Date(sharedImage.date), "d 'de' MMMM yyyy", { locale: es })}
                    </p>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/${subjectData.subject!.course.code}/${subjectData.subject!.id}?image=${selectedImageId}`
                        navigator.clipboard.writeText(url)
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full hover:bg-white/30"
                    >
                      <Share2 className="h-4 w-4" />
                      Copiar enlace
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}