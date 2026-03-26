import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CheckCircle, AlertCircle, Star, Image, Trash2, CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DayEvent {
  id: string
  title: string
  description?: string | null
  type: "TASK" | "TEST" | "ACTIVITY"
  subjectName?: string
  subjectId?: string
  createdBy?: string | null
}

interface DaySummary {
  date: Date
  images: {
    subjectId: string
    subjectName: string
    count: number
  }[]
  events: DayEvent[]
}

interface DayPopoverProps {
  summary: DaySummary | null
  onClose: () => void
  onViewDay: () => void
  onEditEvent?: (event: {
    id: string
    title: string
    description?: string
    type: "TASK" | "TEST" | "ACTIVITY"
    date: string
    subjectName?: string
    subjectId?: string
  }) => void
  onCreateEvent?: (date: Date) => void
  onDeleteEvent?: (eventId: string) => void
  courseCode: string
  currentUserId?: string
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

export function DayPopover({ summary, onClose, onViewDay, onEditEvent, onCreateEvent, onDeleteEvent, courseCode, currentUserId }: DayPopoverProps) {
  if (!summary) return null

  const hasContent = summary.images.length > 0 || summary.events.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-bg-card rounded-t-2xl sm:rounded-2xl shadow-xl animate-in slide-in-from-bottom-4">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-lg text-text-primary capitalize">
            {format(summary.date, "EEEE d 'de' MMMM", { locale: es })}
          </h3>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {hasContent ? (
            <div className="space-y-4">
              {summary.images.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Imágenes
                  </h4>
                  <div className="space-y-2">
                    {summary.images.map((img) => (
                      <div
                        key={img.subjectId}
                        className="flex items-center justify-between p-3 bg-bg-secondary rounded-xl"
                      >
                        <span className="text-sm font-medium text-text-primary">
                          {img.subjectName}
                        </span>
                        <span className="text-xs px-2 py-1 bg-accent-primary/10 text-accent-primary rounded-full font-medium">
                          {img.count} imagen(es)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {summary.events.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-text-secondary mb-2">
                    Eventos
                  </h4>
                  <div className="space-y-2">
                    {summary.events.map((event) => {
                      const Icon = eventIcons[event.type]
                      const canEdit = currentUserId && event.createdBy === currentUserId
                      return (
                        <div
                          key={event.id}
                          className="flex items-center gap-3 p-3 bg-bg-secondary rounded-xl"
                        >
                          <div className={`p-2 rounded-lg ${eventColors[event.type]}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">
                              {event.title}
                            </p>
                            {event.subjectName && (
                              <p className="text-xs text-text-muted">
                                {event.subjectName}
                              </p>
                            )}
                          </div>
                          {canEdit && onEditEvent && (
                            <button
                              onClick={() => onEditEvent({
                                id: event.id,
                                title: event.title,
                                description: event.description || "",
                                type: event.type,
                                date: format(summary.date, "yyyy-MM-dd"),
                                subjectName: event.subjectName,
                                subjectId: event.subjectId,
                              })}
                              className="p-2 text-text-muted hover:text-accent-primary transition-colors"
                              title="Editar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                          {canEdit && onDeleteEvent && (
                            <button
                              onClick={() => onDeleteEvent(event.id)}
                              className="p-2 text-text-muted hover:text-red-500 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-text-secondary">
                No hay contenido este día
              </p>
              <p className="text-text-muted text-sm mt-1">
                ¿Quieres subir algo o crear un evento?
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          {onCreateEvent && (
            <Button 
              onClick={() => onCreateEvent(summary.date)} 
              variant="outline"
              className="flex-1 gap-2"
            >
              <CalendarPlus className="h-4 w-4" />
              Crear Evento
            </Button>
          )}
          <Button onClick={onViewDay} className="flex-1">
            {hasContent ? "Ver todo" : "Subir imágenes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
