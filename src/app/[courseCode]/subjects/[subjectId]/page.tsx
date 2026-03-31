"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { getSubjectWithImages, getAuthSession } from "@/actions/subject"
import { deleteImageAdmin, getThanksForImages } from "@/actions/image"
import { ImageGrid } from "@/components/image/ImageGrid"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Image, Calendar, X, Share2, Check, LogIn } from "lucide-react"
import { ChevronDown, Search } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

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
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const handleShareSubject = async () => {
    const url = window.location.href.split("?")[0]
    const subjectName = subjectData?.subject?.name ?? "Asignatura"
    const courseName = subjectData?.subject?.course?.name ?? ""
    const imageCount = subjectData?.totalImages ?? 0
    const text = `${subjectName} — ${imageCount} ${imageCount === 1 ? "imagen" : "imágenes"} en ${courseName}`
    if (navigator.share) {
      try {
        await navigator.share({ title: subjectName, text, url })
        return
      } catch {}
    }
    await navigator.clipboard.writeText(`${text}\n${url}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    let mounted = true
    
    async function loadData() {
      const [{ subjectId }, { image }] = await Promise.all([params, searchParams])
      const [data, authSession] = await Promise.all([
        getSubjectWithImages(subjectId),
        getAuthSession(),
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
      {/* Banner: invitar a registrarse si es anónimo */}
      {!session?.user && (
        <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-3 flex items-center gap-3">
          <LogIn className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <p className="text-sm text-blue-800 flex-1 leading-snug">
            <span className="font-semibold">¿Te gustó este apunte?</span>{" "}
            Regístrate para guardar y acceder a este curso la próxima vez.
          </p>
          <button
            onClick={() => signIn("google", { callbackUrl: window.location.href })}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 whitespace-nowrap hover:text-blue-800"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Entrar
          </button>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
          <BookOpen className="h-7 w-7 text-accent-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-display font-bold text-text-primary">
            {subject.name}
          </h1>
          <p className="text-sm text-text-muted flex items-center gap-2">
            <Image className="h-4 w-4" />
            {totalImages} imagen(es)
          </p>
        </div>
        <button
          onClick={handleShareSubject}
          title="Compartir asignatura"
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-secondary hover:bg-blue-50 text-text-secondary hover:text-accent-primary transition-colors active:scale-95"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
          <span className="text-xs font-medium">{copied ? "Copiado" : "Compartir"}</span>
        </button>
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