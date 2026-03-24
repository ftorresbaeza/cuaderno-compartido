"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Camera, Image, X, Upload, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { compressImage } from "@/lib/blob"

interface UploadDropzoneProps {
  courseCode: string
  subjects: { id: string; name: string }[]
  initialDate?: string
  initialSubjectId?: string
}

export function UploadDropzone({ courseCode, subjects, initialDate, initialSubjectId }: UploadDropzoneProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [selectedSubject, setSelectedSubject] = useState(initialSubjectId || subjects[0]?.id || "")
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date().toISOString().split("T")[0])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const router = useRouter()

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    const newFiles = [...files, ...selectedFiles].slice(0, 10)
    setFiles(newFiles)

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
    setPreviews(newPreviews)
  }, [files])

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setFiles(newFiles)
    setPreviews(newPreviews)
  }

  const handleUpload = async () => {
    if (files.length === 0 || !selectedSubject) {
      toast({ title: "Error", description: "Selecciona imágenes y una asignatura", variant: "destructive" })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("subjectId", selectedSubject)
      formData.append("date", selectedDate)
      
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImage(files[i])
        const blob = new File([compressed], files[i].name, { type: "image/jpeg" })
        formData.append("files", blob)
      }

      const response = await fetch(`/api/upload`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Error uploading")

      setUploadProgress(100)
      toast({ title: "Éxito", description: `${files.length} imágenes subidas` })
      
      setTimeout(() => {
        router.push(`/${courseCode}/subjects/${selectedSubject}`)
      }, 1000)
    } catch (error) {
      console.error("Upload error:", error)
      toast({ title: "Error", description: "No se pudieron subir las imágenes", variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <label className="block">
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-accent-primary hover:bg-blue-50/50 transition-all">
              <Camera className="mx-auto h-10 w-10 text-text-muted mb-2" />
              <p className="text-text-secondary font-medium">
                Toca para seleccionar imágenes
              </p>
              <p className="text-text-muted text-sm mt-1">
                Cámara o galería (máx. 10)
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </CardContent>
      </Card>

      {previews.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-text-secondary">
                {files.length} imagen(es) seleccionada(s)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 p-1 bg-danger text-white rounded-full shadow-md hover:bg-red-700 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Asignatura
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-accent-primary focus:outline-none transition-colors bg-white"
              disabled={subjects.length === 0}
            >
              {subjects.length === 0 ? (
                <option value="">Crea una asignatura primero</option>
              ) : (
                subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Fecha
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-accent-primary focus:outline-none transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <>
          <Button
            onClick={handleUpload}
            disabled={isUploading || files.length === 0 || !selectedSubject}
            className="w-full h-12 text-base"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Subiendo... {uploadProgress}%
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Subir {files.length} imagen(es)
              </>
            )}
          </Button>
        </>
      )}
    </div>
  )
}
