"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { X, ZoomIn, Calendar as CalendarIcon, ChevronRight, ChevronDown, Camera } from "lucide-react"
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
}

export function ImageGrid({ images, isLoading }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<ImageNote | null>(null)
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({})

  const toggleDate = (dateKey: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }))
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-xl bg-bg-secondary"
          />
        ))}
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-text-secondary">No hay imágenes todavía</p>
        <p className="text-text-muted text-sm mt-1">
          Sube la primera foto de esta asignatura
        </p>
      </div>
    )
  }

  const groupedImages = images.reduce((acc, image) => {
    const dateKey = format(new Date(image.date), "yyyy-MM-dd")
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(image)
    return acc
  }, {} as Record<string, ImageNote[]>)

  const sortedDates = Object.keys(groupedImages).sort((a, b) => b.localeCompare(a))

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr)
    date.setHours(12, 0, 0, 0) // Normalizar para evitar problemas de zona horaria
    
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
                    isToday(new Date(dateKey)) ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                  )}>
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-bold text-text-primary capitalize leading-tight">
                      {formatDateLabel(dateKey)}
                    </h3>
                    <p className="text-xs text-text-muted font-medium mt-0.5">
                      {groupImages.length} {groupImages.length === 1 ? 'Foto' : 'Fotos'}
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
                        onClick={() => setSelectedImage(image)}
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

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
          <DialogTitle className="sr-only">Vista previa de imagen</DialogTitle>
          {selectedImage && (
            <div className="relative w-full h-[80vh]">
              <Image
                src={selectedImage.url}
                alt="Imagen completa"
                fill
                className="object-contain"
                quality={100}
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
