"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, AlertCircle, Star } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface EventDetail {
  id: string
  title: string
  description?: string | null
  type: "TASK" | "TEST" | "ACTIVITY"
  date: string | Date
  subject?: {
    name: string
  } | null
}

interface EventDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: EventDetail | null
}

const eventIcons = {
  TASK: CheckCircle,
  TEST: AlertCircle,
  ACTIVITY: Star,
}

const eventColors = {
  TASK: "text-green-600 bg-green-50",
  TEST: "text-red-600 bg-red-50",
  ACTIVITY: "text-blue-600 bg-blue-50",
}

const eventLabels = {
  TASK: "Tarea",
  TEST: "Prueba",
  ACTIVITY: "Actividad",
}

export function EventDetailDialog({ open, onOpenChange, event }: EventDetailDialogProps) {
  if (!event) return null

  const Icon = eventIcons[event.type]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${eventColors[event.type]}`}>
              <Icon className="h-4 w-4" />
            </div>
            <span>{event.title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="px-2 py-1 bg-bg-secondary rounded-lg">
              {eventLabels[event.type]}
            </span>
            <span>•</span>
            <span className="capitalize">
              {format(new Date(event.date), "d 'de' MMMM 'de' yyyy", { locale: es })}
            </span>
          </div>

          {event.subject && (
            <div className="text-sm">
              <span className="text-text-muted">Asignatura: </span>
              <span className="text-text-primary font-medium">{event.subject.name}</span>
            </div>
          )}

          {event.description && (
            <div className="text-sm text-text-secondary bg-bg-secondary p-3 rounded-xl">
              {event.description}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
