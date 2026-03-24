"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { X, ZoomIn, Calendar as CalendarIcon, ChevronRight, ChevronDown, ChevronLeft, Trash2 } from "lucide-react"
import { format, isToday, isYesterday } from "date-fns"
import { es } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

interface ImageNote {
  id: string
  url: string
  date: string | Date
  createdAt: string | Date
  subject?: {
    name: string
  }
}

interface ImageGridProps {
  images: ImageNote[]
  isLoading?: boolean
  onDelete?: (imageId: string) => Promise<{ success?: boolean; error?: string }>
}

export function ImageGrid({ images, isLoading, onDelete }: ImageGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({})
  const touchStartX = useRef<number | null>(null)

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null
  const isOpen = selectedIndex !== null

  const goNext = useCallback(() => {
    setSelectedIndex((i) => (i === null ? null : (i + 1) % images.length))
  }, [images.length])

  const goPrev = useCallback(() => {
    setSelectedIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length))
  }, [images.length])

  const close = useCallback(() => setSelectedIndex(null), [])

  // Navegación por teclado
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isOpen, goNext, goPrev, close])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      diff > 0 ? goNext() : goPrev()
    }
    touchStartX.current = null
  }

  const toggleDate = (dateKey: string) => {
    setExpandedDates((prev) => ({ ...prev, [dateKey]: !prev[dateKey] }))
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-xl bg-bg-secondary" />
        ))}
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-text-secondary">No hay imágenes todavía</p>
        <p className="text-text-muted text-sm mt-1">Sube la primera foto de esta asignatura</p>
      </div>
    )
  }

  const groupedImages = images.reduce((acc, image) => {
    const dateKey = new Date(image.date).toISOString().split("T")[0]
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(image)
    return acc
  }, {} as Record<string, ImageNote[]>)

  const sortedDates = Object.keys(groupedImages).sort((a, b) => b.localeCompare(a))

  const formatDateLabel = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number)
    const date = new Date(year, month - 1, day, 12, 0, 0)
    if (isToday(date)) return "Hoy"
    if (isYesterday(date)) return "Ayer"
    return format(date, "EEEE, d 'de' MMMM", { locale: es })
  }

  return (
    <>
      <div className="space-y-3">
        {sortedDates.map((dateKey) => {
          const isExpanded = expandedDates[dateKey]
          const groupImages = groupedImages[dateKey]

          return (
            <div key={dateKey} className="overflow-hidden border border-border rounded-2xl bg-white shadow-sm transition-all hover:shadow-md">
              <button
                onClick={() => toggleDate(dateKey)}
                className="w-full flex items-center justify-between p-4 bg-white active:bg-slate-50 transition-colors"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                    isToday(new Date(dateKey + "T12:00:00")) ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                  )}>
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-bold text-text-primary capitalize leading-tight">
                      {formatDateLabel(dateKey)}
                    </h3>
                    <p className="text-xs text-text-muted font-medium mt-0.5">
                      {groupImages.length} {groupImages.length === 1 ? "Foto" : "Fotos"}
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-text-muted" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-text-muted" />
                )}
              </button>

              {isExpanded && (
                <div className="p-3 pt-0 border-t border-slate-50 bg-slate-50/30">
                  <div className="grid grid-cols-3 gap-2 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    {groupImages.map((image) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedIndex(images.findIndex((img) => img.id === image.id))}
                        className="relative aspect-square overflow-hidden rounded-xl bg-bg-secondary group ring-1 ring-border shadow-sm"
                      >
                        <Image
                          src={image.url}
                          alt={`Imagen de ${image.subject?.name || "apunte"}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 640px) 33vw, 200px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <ZoomIn className="absolute bottom-2 right-2 h-4 w-4 text-white opacity-40" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
          <DialogTitle className="sr-only">Vista previa de imagen</DialogTitle>
          {selectedImage && (
            <div
              className="relative w-full h-[80vh]"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <Image
                src={selectedImage.url}
                alt="Imagen completa"
                fill
                className="object-contain"
                quality={100}
              />

              {/* Cerrar */}
              <button
                onClick={close}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              >
                <X className="h-5 w-5 text-white" />
              </button>

              {/* Contador */}
              {images.length > 1 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/40 text-white text-xs font-medium">
                  {(selectedIndex ?? 0) + 1} / {images.length}
                </div>
              )}

              {/* Flecha izquierda */}
              {images.length > 1 && (
                <button
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/25 transition-colors z-10"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
              )}

              {/* Flecha derecha */}
              {images.length > 1 && (
                <button
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/25 transition-colors z-10"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              )}

              {/* Eliminar */}
              {onDelete && (
                <button
                  disabled={deleting}
                  onClick={async () => {
                    if (!confirm("¿Eliminar esta imagen?")) return
                    setDeleting(true)
                    await onDelete(selectedImage.id)
                    if (images.length <= 1) {
                      close()
                    } else {
                      setSelectedIndex((i) => Math.min(i ?? 0, images.length - 2))
                    }
                    setDeleting(false)
                  }}
                  className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-full bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50 z-10"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? "Eliminando…" : "Eliminar"}
                </button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
