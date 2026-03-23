"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { X, ZoomIn } from "lucide-react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"

interface ImageNote {
  id: string
  url: string
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

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {images.map((image) => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(image)}
            className="relative aspect-square overflow-hidden rounded-xl bg-bg-secondary group"
          >
            <Image
              src={image.url}
              alt={`Imagen de ${image.subject?.name || "apunte"}`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <ZoomIn className="absolute bottom-2 right-2 h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
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
