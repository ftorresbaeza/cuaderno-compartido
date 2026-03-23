"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createSubject } from "@/actions/subject"
import { toast } from "@/hooks/use-toast"

interface CreateSubjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
  courseCode: string
}

export function CreateSubjectDialog({
  open,
  onOpenChange,
  courseId,
  courseCode,
}: CreateSubjectDialogProps) {
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    const result = await createSubject(courseId, name)

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Éxito", description: "Asignatura creada correctamente" })
      setName("")
      onOpenChange(false)
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva asignatura</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Matemáticas, Lenguaje, Historia..."
              className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-accent-primary focus:outline-none transition-colors"
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
