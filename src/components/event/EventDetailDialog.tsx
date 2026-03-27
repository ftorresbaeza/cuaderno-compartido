"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Star, Pencil } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CreateEventDialog } from "./CreateEventDialog"

interface EventDetail {
  id: string
  title: string
  description?: string | null
  type: "TASK" | "TEST" | "ACTIVITY"
  date: string | Date
  subject?: {
    id: string
    name: string
  } | null
}

interface Subject {
  id: string
  name: string
}

interface EventDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: EventDetail | null
  canEdit?: boolean
  subjects?: Subject[]
  courseId?: string
  courseCode?: string
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

export function EventDetailDialog({ 
  open, 
  onOpenChange, 
  event, 
  canEdit, 
  subjects = [],
  courseId,
  courseCode 
}: EventDetailDialogProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)

  if (!event) return null

  const Icon = eventIcons[event.type]

  const handleEdit = () => {
    setShowEditDialog(true)
  }

  const handleEditClose = (isOpen: boolean) => {
    setShowEditDialog(isOpen)
    if (!isOpen) {
      onOpenChange(false)
    }
  }

  return (
    <>
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

            {canEdit && (
              <Button
                onClick={handleEdit}
                className="w-full mt-4"
                variant="outline"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar evento
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {showEditDialog && event && courseId && courseCode && (
        <CreateEventDialog
          open={showEditDialog}
          onOpenChange={handleEditClose}
          courseId={courseId}
          courseCode={courseCode}
          subjects={subjects}
          editEvent={{
            id: event.id,
            title: event.title,
            description: event.description || undefined,
            type: event.type,
            date: new Date(event.date).toISOString().split("T")[0],
            subjectId: event.subject?.id,
          }}
        />
      )}
    </>
  )
}
