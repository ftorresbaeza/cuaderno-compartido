"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createEvent, updateEvent } from "@/actions/event"
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
  editEvent?: {
    id: string
    title: string
    description?: string
    type: EventType
    date: string
    subjectId?: string
  }
  onEventCreated?: (event: any) => void
  onEventUpdated?: (event: any) => void
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
  editEvent,
  onEventCreated,
  onEventUpdated,
}: CreateEventDialogProps) {
  const isEditing = !!editEvent
  
  const [title, setTitle] = useState(editEvent?.title || "")
  const [description, setDescription] = useState(editEvent?.description || "")
  const [type, setType] = useState<EventType>(editEvent?.type || "TASK")
  const [date, setDate] = useState(editEvent?.date || defaultDate || new Date().toISOString().split("T")[0])
  const [subjectId, setSubjectId] = useState(editEvent?.subjectId || "")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      if (editEvent) {
        setTitle(editEvent.title)
        setDescription(editEvent.description || "")
        setType(editEvent.type)
        setDate(editEvent.date)
        setSubjectId(editEvent.subjectId || "")
      } else {
        setTitle("")
        setDescription("")
        setType("TASK")
        setDate(defaultDate || new Date().toISOString().split("T")[0])
        setSubjectId("")
      }
    }
  }, [open, editEvent, defaultDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsLoading(true)

    let result
    if (isEditing) {
      result = await updateEvent(editEvent.id, {
        title,
        description,
        type,
        date: new Date(date),
        subjectId: subjectId || undefined,
      })
    } else {
      result = await createEvent({
        title,
        description,
        type,
        date: new Date(date),
        courseId,
        subjectId: subjectId || undefined,
      })
    }

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Éxito", description: isEditing ? "Evento actualizado" : "Evento creado correctamente" })

      if (result.event) {
        const formattedEvent = {
          id: result.event.id,
          title: result.event.title,
          type: result.event.type,
          date: result.event.date.toISOString(),
          subject: result.event.subject ? { id: result.event.subject.id, name: result.event.subject.name } : undefined,
          createdBy: result.event.createdBy,
        }

        if (isEditing) {
          onEventUpdated?.(formattedEvent)
        } else {
          onEventCreated?.(formattedEvent)
        }
      }

      setTitle("")
      setDescription("")
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
          <DialogTitle>{isEditing ? "Editar evento" : "Nuevo evento"}</DialogTitle>
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
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles del evento, contenido, etc."
              rows={3}
              className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-accent-primary focus:outline-none transition-colors resize-none"
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
              {isLoading
                ? isEditing ? "Guardando..." : "Creando..."
                : isEditing ? "Guardar" : "Crear evento"
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
