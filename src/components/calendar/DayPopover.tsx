import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CheckCircle, AlertCircle, Star, Image } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface DaySummary {
  date: Date
  images: {
    subjectId: string
    subjectName: string
    count: number
  }[]
  events: {
    id: string
    title: string
    type: "TASK" | "TEST" | "ACTIVITY"
    subjectName?: string
  }[]
}

interface DayPopoverProps {
  summary: DaySummary | null
  onClose: () => void
  onViewDay: () => void
  courseCode: string
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

export function DayPopover({ summary, onClose, onViewDay, courseCode }: DayPopoverProps) {
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
                ¿Quieres subir algo?
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <Button onClick={onViewDay} className="w-full">
            {hasContent ? "Ver todo" : "Subir imágenes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
