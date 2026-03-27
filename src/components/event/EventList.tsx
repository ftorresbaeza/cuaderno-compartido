"use client"

import { useState } from "react"
import { CheckCircle, AlertCircle, Star } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { EventDetailDialog } from "@/components/event/EventDetailDialog"

interface Event {
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

interface EventListProps {
  events: Event[]
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

export function EventList({ events, canEdit, subjects = [], courseId, courseCode }: EventListProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  return (
    <>
      <div className="space-y-2">
        {events.map((event) => {
          const Icon = eventIcons[event.type]
          return (
            <button
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="w-full flex items-center gap-3 p-3 bg-bg-card rounded-xl border-2 border-border text-left"
            >
              <div className={`p-2 rounded-lg ${eventColors[event.type]}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {event.title}
                </p>
                <p className="text-xs text-text-muted">
                  {format(new Date(event.date), "d 'de' MMM", { locale: es })}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <EventDetailDialog
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
        event={selectedEvent}
        canEdit={canEdit}
        subjects={subjects}
        courseId={courseId}
        courseCode={courseCode}
      />
    </>
  )
}
