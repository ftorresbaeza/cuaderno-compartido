"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { X, ZoomIn, ZoomOut, Calendar as CalendarIcon, ChevronRight, ChevronDown, ChevronLeft, Trash2 } from "lucide-react"
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
  const [activeDateKey, setActiveDateKey] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [deleting, setDeleting] = useState(false)
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({})
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const touchStartX = useRef<number | null>(null)
  const pinchStartDist = useRef<number | null>(null)
  const pinchStartZoom = useRef(1)
  const containerRef = useRef<HTMLDivElement>(null)

  // Group images by date
  const groupedImages = images.reduce((acc, image) => {
    const dateKey = new Date(image.date).toISOString().split("T")[0]
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(image)
    return acc
  }, {} as Record<string, ImageNote[]>)

  const sortedDates = Object.keys(groupedImages).sort((a, b) => b.localeCompare(a))

  const activeGroup = activeDateKey ? groupedImages[activeDateKey] : null
  const selectedImage = activeGroup ? activeGroup[activeIndex] : null
  const isOpen = activeDateKey !== null

  const openDay = useCallback((dateKey: string, imageIndex: number) => {
    setActiveDateKey(dateKey)
    setActiveIndex(imageIndex)
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const close = useCallback(() => {
    setActiveDateKey(null)
    setActiveIndex(0)
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const goNext = useCallback(() => {
    if (!activeGroup) return
    setActiveIndex((i) => (i + 1) % activeGroup.length)
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [activeGroup])

  const goPrev = useCallback(() => {
    if (!activeGroup) return
    setActiveIndex((i) => (i - 1 + activeGroup.length) % activeGroup.length)
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [activeGroup])

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + 0.5, 4))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom((z) => {
      const newZoom = Math.max(z - 0.5, 1)
      if (newZoom <= 1) setPan({ x: 0, y: 0 })
      return newZoom
    })
  }, [])

  const resetZoom = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "Escape") close()
      if (e.key === "+" || e.key === "=") zoomIn()
      if (e.key === "-") zoomOut()
      if (e.key === "0") resetZoom()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isOpen, goNext, goPrev, close, zoomIn, zoomOut, resetZoom])

  // Touch: swipe for navigation and pinch for zoom
  const getTouchDist = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchStartDist.current = getTouchDist(e.touches)
      pinchStartZoom.current = zoom
      touchStartX.current = null
      return
    }
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX
      pinchStartDist.current = null
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDist.current !== null) {
      e.preventDefault()
      const dist = getTouchDist(e.touches)
      const scale = dist / pinchStartDist.current
      const newZoom = Math.min(Math.max(pinchStartZoom.current * scale, 1), 4)
      setZoom(newZoom)
      if (newZoom <= 1) setPan({ x: 0, y: 0 })
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (pinchStartDist.current !== null && e.touches.length < 2) {
      pinchStartDist.current = null
      if (zoom <= 1) setZoom(1)
      return
    }
    if (touchStartX.current !== null && zoom <= 1) {
      const diff = touchStartX.current - e.changedTouches[0].clientX
      if (Math.abs(diff) > 50) {
        diff > 0 ? goNext() : goPrev()
      }
      touchStartX.current = null
    }
  }

  // Mouse: drag to pan when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return
    setIsPanning(true)
    panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return
    setPan({
      x: panStart.current.panX + (e.clientX - panStart.current.x),
      y: panStart.current.panY + (e.clientY - panStart.current.y),
    })
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  // Double click/tap to toggle zoom
  const handleDoubleClick = useCallback(() => {
    if (zoom > 1) {
      resetZoom()
    } else {
      setZoom(2)
    }
  }, [zoom, resetZoom])

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
          const dayImages = groupedImages[dateKey]

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
                      {dayImages.length} {dayImages.length === 1 ? "Foto" : "Fotos"}
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
                    {dayImages.map((image, idx) => (
                      <button
                        key={image.id}
                        onClick={() => openDay(dateKey, idx)}
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
        <DialogContent
          className="max-w-4xl p-0 bg-black/95 border-none [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">Vista previa de imagen</DialogTitle>
          {selectedImage && activeGroup && (
            <div
              ref={containerRef}
              className="relative w-full h-[80vh] overflow-hidden select-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onDoubleClick={handleDoubleClick}
              style={{ cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "default" }}
            >
              <div
                className="w-full h-full transition-transform duration-200"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                }}
              >
                <Image
                  src={selectedImage.url}
                  alt="Imagen completa"
                  fill
                  className="object-contain pointer-events-none"
                  quality={100}
                  sizes="100vw"
                />
              </div>

              {/* Cerrar */}
              <button
                onClick={close}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              >
                <X className="h-5 w-5 text-white" />
              </button>

              {/* Contador */}
              {activeGroup.length > 1 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/40 text-white text-xs font-medium">
                  {activeIndex + 1} / {activeGroup.length}
                </div>
              )}

              {/* Flecha izquierda */}
              {activeGroup.length > 1 && (
                <button
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/25 transition-colors z-10"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
              )}

              {/* Flecha derecha */}
              {activeGroup.length > 1 && (
                <button
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/25 transition-colors z-10"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              )}

              {/* Controles de zoom */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 z-10">
                <button
                  onClick={zoomOut}
                  disabled={zoom <= 1}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ZoomOut className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={zoomIn}
                  disabled={zoom >= 4}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ZoomIn className="h-5 w-5 text-white" />
                </button>
                {zoom > 1 && (
                  <span className="text-white/70 text-xs font-medium px-2 py-1 rounded-full bg-black/40">
                    {Math.round(zoom * 100)}%
                  </span>
                )}
              </div>

              {/* Eliminar */}
              {onDelete && (
                <button
                  disabled={deleting}
                  onClick={async () => {
                    if (!confirm("¿Eliminar esta imagen?")) return
                    setDeleting(true)
                    const deletedId = selectedImage.id
                    await onDelete(deletedId)
                    const remaining = activeGroup.filter((img) => img.id !== deletedId)
                    if (remaining.length === 0) {
                      close()
                    } else {
                      setActiveIndex((i) => Math.min(i, remaining.length - 1))
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
