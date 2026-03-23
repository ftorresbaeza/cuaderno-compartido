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
import { createEvent } from "@/actions/event"
import { toast } from "@/hooks/use-toast"
import { CheckCircle, AlertCircle, Star } from "lucide-react"

type EventType = "TASK" | "TEST" | "ACTIVITY"

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
  courseCode: string
  subjects: { id: string; name: string }[]
  defaultDate?: string
}

const eventTypes: { type: EventType; label: string; icon: typeof CheckCircle }[] = [
  { type: "TASK", label: "Tarea", icon: CheckCircle },
  { type: "TEST", label: "Prueba", icon: AlertCircle },
  { type: "ACTIVITY", label: "Actividad", icon: Star },
]

export function CreateEventDialog({
  open,
  onOpenChange,
  courseId,
  courseCode,
  subjects,
  defaultDate,
}: CreateEventDialogProps) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState<EventType>("TASK")
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split("T")[0])
  const [subjectId, setSubjectId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsLoading(true)
    const result = await createEvent({
      title,
      type,
      date: new Date(date),
      courseId,
      subjectId: subjectId || undefined,
    })

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Éxito", description: "Evento creado correctamente" })
      setTitle("")
      setType("TASK")
      onOpenChange(false)
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Tipo de evento
            </label>
            <div className="flex gap-2">
              {eventTypes.map((et) => {
                const Icon = et.icon
                const isActive = type === et.type
                return (
                  <button
                    key={et.type}
                    type="button"
                    onClick={() => setType(et.type)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 transition-all ${
                      isActive
                        ? type === "TASK"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : type === "TEST"
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-border hover:border-text-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{et.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Prueba de matemáticas"
              className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-accent-primary focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-accent-primary focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Asignatura (opcional)
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-accent-primary focus:outline-none transition-colors bg-white"
            >
              <option value="">Sin asignatura</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? "Creando..." : "Crear evento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
