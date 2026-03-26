"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { X, ZoomIn, ZoomOut, Calendar as CalendarIcon, ChevronRight, ChevronDown, ChevronLeft, Trash2, Heart, RotateCw } from "lucide-react"
import { format, isToday, isYesterday } from "date-fns"
import { es } from "date-fns/locale"
import { sendThanks, rotateImage } from "@/actions/image"
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
  rotation?: number
  uploaderId?: string | null
  subject?: {
    name: string
  }
}

interface ImageGridProps {
  images: ImageNote[]
  isLoading?: boolean
  currentUserId?: string
  thanksData?: Record<string, { count: number; thankedByMe: boolean }>
  onDelete?: (imageId: string) => Promise<{ success?: boolean; error?: string }>
}

export function ImageGrid({ images, isLoading, currentUserId, thanksData, onDelete }: ImageGridProps) {
  const [activeDateKey, setActiveDateKey] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [deleting, setDeleting] = useState(false)
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({})
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [thanking, setThanking] = useState(false)
  const [thanked, setThanked] = useState<Record<string, boolean>>(
    () => {
      if (!thanksData) return {}
      const initial: Record<string, boolean> = {}
      for (const [id, data] of Object.entries(thanksData)) {
        if (data.thankedByMe) initial[id] = true
      }
      return initial
    }
  )
  const [thanksCount, setThanksCount] = useState<Record<string, number>>(
    () => {
      if (!thanksData) return {}
      const initial: Record<string, number> = {}
      for (const [id, data] of Object.entries(thanksData)) {
        initial[id] = data.count
      }
      return initial
    }
  )
  const [rotating, setRotating] = useState(false)
  const [localRotation, setLocalRotation] = useState<Record<string, number>>({})
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const touchStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
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

  const getRotation = (imageId: string) => {
    const img = images.find(i => i.id === imageId)
    return localRotation[imageId] ?? img?.rotation ?? 0
  }

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

  const handleRotate = useCallback(async () => {
    if (!selectedImage || rotating) return
    setRotating(true)
    setLocalRotation((prev) => ({
      ...prev,
      [selectedImage.id]: ((prev[selectedImage.id] ?? selectedImage.rotation ?? 0) + 90) % 360,
    }))
    await rotateImage(selectedImage.id)
    setRotating(false)
  }, [selectedImage, rotating])

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

  // Distance between two touch points
  const getTouchDist = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Touch handlers for mobile pan + pinch zoom + swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch start
      pinchStartDist.current = getTouchDist(e.touches)
      pinchStartZoom.current = zoom
      touchStart.current = null
      return
    }
    if (e.touches.length === 1) {
      if (zoom > 1) {
        // Pan mode when zoomed
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, panX: pan.x, panY: pan.y }
      } else {
        // Swipe mode when not zoomed
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, panX: 0, panY: 0 }
      }
      pinchStartDist.current = null
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // Pinch zoom
    if (e.touches.length === 2 && pinchStartDist.current !== null) {
      e.preventDefault()
      const dist = getTouchDist(e.touches)
      const scale = dist / pinchStartDist.current
      const newZoom = Math.min(Math.max(pinchStartZoom.current * scale, 1), 4)
      setZoom(newZoom)
      if (newZoom <= 1) setPan({ x: 0, y: 0 })
      return
    }
    // Single finger pan when zoomed
    if (e.touches.length === 1 && touchStart.current && zoom > 1) {
      e.preventDefault()
      const dx = e.touches[0].clientX - touchStart.current.x
      const dy = e.touches[0].clientY - touchStart.current.y
      setPan({
        x: touchStart.current.panX + dx,
        y: touchStart.current.panY + dy,
      })
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Pinch ended
    if (pinchStartDist.current !== null && e.touches.length < 2) {
      pinchStartDist.current = null
      if (zoom <= 1) setZoom(1)
      return
    }
    // Single finger: swipe to navigate only when not zoomed
    if (touchStart.current && zoom <= 1) {
      const diff = touchStart.current.x - e.changedTouches[0].clientX
      if (Math.abs(diff) > 50) {
        diff > 0 ? goNext() : goPrev()
      }
    }
    touchStart.current = null
  }

  // Mouse drag for pan on desktop
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
                          style={{ transform: `rotate(${getRotation(image.id)}deg)` }}
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
                className="w-full h-full"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transition: isPanning || pinchStartDist.current ? "none" : "transform 0.2s ease-out",
                }}
              >
                <Image
                  src={selectedImage.url}
                  alt="Imagen completa"
                  fill
                  className="object-contain pointer-events-none"
                  quality={100}
                  sizes="100vw"
                  style={{ transform: `rotate(${getRotation(selectedImage.id)}deg)` }}
                />
              </div>

              {/* Cerrar */}
              <button
                onClick={close}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              >
                <X className="h-5 w-5 text-white" />
              </button>

              {/* Gracias - arriba izquierda */}
              <button
                disabled={thanking || thanked[selectedImage.id]}
                onClick={async () => {
                  setThanking(true)
                  const result = await sendThanks(selectedImage.id)
                  if (result.success) {
                    setThanked((prev) => ({ ...prev, [selectedImage.id]: true }))
                    setThanksCount((prev) => ({ ...prev, [selectedImage.id]: (prev[selectedImage.id] || 0) + 1 }))
                  }
                  setThanking(false)
                }}
                className={cn(
                  "absolute top-4 left-4 flex items-center gap-1 px-2.5 py-2 rounded-full transition-all z-10",
                  thanked[selectedImage.id]
                    ? "bg-pink-600/60 text-white"
                    : "bg-white/10 hover:bg-pink-600/50 text-white active:scale-90",
                  thanking && "animate-pulse"
                )}
                title={thanked[selectedImage.id] ? "Ya agradeciste" : "¡Gracias!"}
              >
                <Heart className={cn("h-5 w-5", thanked[selectedImage.id] && "fill-current")} />
                {(thanksCount[selectedImage.id] || 0) > 0 && (
                  <span className="text-xs font-medium">{thanksCount[selectedImage.id]}</span>
                )}
              </button>

              {/* Contador */}
              {activeGroup.length > 1 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/40 text-white text-xs font-medium">
                  {activeIndex + 1} / {activeGroup.length}
                </div>
              )}

              {/* Flecha izquierda */}
              {activeGroup.length > 1 && zoom <= 1 && (
                <button
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/25 transition-colors z-10"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
              )}

              {/* Flecha derecha */}
              {activeGroup.length > 1 && zoom <= 1 && (
                <button
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/25 transition-colors z-10"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              )}

              {/* Controles: zoom + rotar */}
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
                <button
                  onClick={handleRotate}
                  disabled={rotating}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30"
                >
                  <RotateCw className={cn("h-5 w-5 text-white", rotating && "animate-spin")} />
                </button>
                {zoom > 1 && (
                  <span className="text-white/70 text-xs font-medium px-2 py-1 rounded-full bg-black/40">
                    {Math.round(zoom * 100)}%
                  </span>
                )}
              </div>

              {/* Eliminar - admins o dueño de la imagen */}
              {(onDelete || (currentUserId && selectedImage.uploaderId === currentUserId)) && (
                <button
                  disabled={deleting}
                  onClick={async () => {
                    if (!confirm("¿Eliminar esta imagen?")) return
                    setDeleting(true)
                    const deletedId = selectedImage.id
                    if (onDelete) {
                      await onDelete(deletedId)
                    } else {
                      const { deleteOwnImage } = await import("@/actions/image")
                      await deleteOwnImage(deletedId)
                    }
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
