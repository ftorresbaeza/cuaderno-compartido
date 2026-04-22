"use client"

import { useState, useEffect } from "react"
import { CalendarView } from "@/components/calendar/CalendarView"
import { DayPopover } from "@/components/calendar/DayPopover"
import { CreateEventDialog } from "@/components/event/CreateEventDialog"
import { Button } from "@/components/ui/button"
import { Plus, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Subject {
  id: string
  name: string
}

interface CalendarEvent {
  id: string
  title: string
  description?: string | null
  type: "TASK" | "TEST" | "ACTIVITY"
  date: string
  subject?: {
    id: string
    name: string
  }
  createdBy?: string | null
}

interface CalendarImage {
  date: string
  subjectId: string
  subjectName: string
  imageCount: number
}

interface EditEvent {
  id: string
  title: string
  description?: string
  type: "TASK" | "TEST" | "ACTIVITY"
  date: string
  subjectId?: string
}

export function CalendarClient({
  courseId,
  courseCode,
  subjects,
  initialEvents,
  initialImages,
  currentUserId,
  initialDate,
}: {
  courseId: string
  courseCode: string
  subjects: Subject[]
  initialEvents: CalendarEvent[]
  initialImages: CalendarImage[]
  currentUserId?: string
  initialDate?: Date
}) {
  const [currentMonth, setCurrentMonth] = useState(initialDate || new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [events, setEvents] = useState(initialEvents)
  const [images, setImages] = useState(initialImages)
  const [editingEvent, setEditingEvent] = useState<EditEvent | null>(null)
  const [quickDate, setQuickDate] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth() + 1

        const [eventsRes, imagesRes] = await Promise.all([
          fetch(`/api/events?courseId=${courseId}&year=${year}&month=${month}`),
          fetch(`/api/images/month?courseId=${courseId}&year=${year}&month=${month}`),
        ])

        if (eventsRes.ok) {
          const data = await eventsRes.json()
          setEvents(data)
        }
        if (imagesRes.ok) {
          const data = await imagesRes.json()
          setImages(data)
        }
      } catch (error) {
        console.error("Error fetching calendar data:", error)
      }
    }

    fetchData()
  }, [currentMonth, courseId])

  const days = currentMonth ? getDaysWithContent(currentMonth, events, images) : []

  function getDaysWithContent(
    month: Date,
    evts: CalendarEvent[],
    imgs: CalendarImage[]
  ) {
    const daysInMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0
    ).getDate()

    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(month.getFullYear(), month.getMonth(), i + 1)
      const dateStr = date.toISOString().split("T")[0]

      const dayImages = imgs.filter((img) => img.date === dateStr)
      const dayEvents = evts.filter((evt) => {
        try {
          return new Date(evt.date).toISOString().split("T")[0] === dateStr
        } catch (e) {
          return false
        }
      })

      return {
        date,
        hasImages: dayImages.length > 0,
        imageCount: dayImages.reduce((acc, img) => acc + img.imageCount, 0),
        hasEvents: dayEvents.length > 0,
        eventCount: dayEvents.length,
      }
    })
  }

  const selectedDateSummary = selectedDate
    ? getDaySummary(selectedDate, events, images)
    : null

  function getDaySummary(
    date: Date,
    evts: CalendarEvent[],
    imgs: CalendarImage[]
  ) {
    const dateStr = date.toISOString().split("T")[0]

    const dayImages = imgs
      .filter((img) => img.date === dateStr)
      .map((img) => ({
        subjectId: img.subjectId,
        subjectName: img.subjectName,
        count: img.imageCount,
      }))

    const dayEvents = evts
      .filter((evt) => {
        try {
          return new Date(evt.date).toISOString().split("T")[0] === dateStr
        } catch (e) {
          return false
        }
      })
      .map((evt) => ({
        id: evt.id,
        title: evt.title,
        description: evt.description,
        type: evt.type,
        subjectName: evt.subject?.name,
        subjectId: evt.subject?.id,
        createdBy: evt.createdBy,
      }))

    return { date, images: dayImages, events: dayEvents }
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
  }

  const handleEditEvent = (event: EditEvent) => {
    setEditingEvent(event)
    setShowEventDialog(true)
  }

  const handleViewEvent = (event: any) => {
    const dateStr = selectedDate ? selectedDate.toISOString().split("T")[0] : ""
    setEditingEvent({
      id: event.id,
      title: event.title,
      description: event.description || "",
      type: event.type,
      date: dateStr,
      subjectId: event.subjectId,
    })
    setShowEventDialog(true)
  }

  const handleCreateEvent = (date: Date) => {
    setEditingEvent(null)
    setSelectedDate(date)
    setShowEventDialog(true)
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("¿Estás seguro de eliminar este evento?")) return
    
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" })
      if (res.ok) {
        setEvents(events.filter(e => e.id !== eventId))
        if (selectedDate) {
          setSelectedDate(selectedDate)
        }
      }
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }

  const handleQuickDateChange = (dateStr: string) => {
    setQuickDate(dateStr)
    if (dateStr) {
      const date = new Date(dateStr)
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1))
      setSelectedDate(date)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-xl font-display font-bold text-text-primary">
            Calendario
          </h1>
          <p className="text-sm text-text-muted capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowEventDialog(true)}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Evento
          </Button>
        </div>
      </div>

      <CalendarView
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        days={days}
        onDayClick={handleDayClick}
        selectedDate={selectedDate || undefined}
      />

      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-primary" />
          <span className="text-text-muted">Imágenes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-secondary" />
          <span className="text-text-muted">Eventos</span>
        </div>
      </div>

      {selectedDateSummary && (
        <DayPopover
          summary={selectedDateSummary}
          onClose={() => setSelectedDate(null)}
          onViewDay={() => {
            window.location.href = `/${courseCode}?date=${selectedDate?.toISOString().split("T")[0]}`
          }}
          onClickEvent={handleViewEvent}
          onEditEvent={handleEditEvent}
          onCreateEvent={handleCreateEvent}
          onDeleteEvent={handleDeleteEvent}
          courseCode={courseCode}
          currentUserId={currentUserId}
        />
      )}

      <CreateEventDialog
        open={showEventDialog}
        onOpenChange={(open) => {
          setShowEventDialog(open)
          if (!open) setEditingEvent(null)
        }}
        courseId={courseId}
        courseCode={courseCode}
        subjects={subjects}
        defaultDate={selectedDate?.toISOString().split("T")[0]}
        editEvent={editingEvent ? {
          id: editingEvent.id,
          title: editingEvent.title,
          description: editingEvent.description,
          type: editingEvent.type,
          date: editingEvent.date,
          subjectId: editingEvent.subjectId,
        } : undefined}
        onEventCreated={(newEvent) => {
          setEvents([...events, newEvent])
        }}
        onEventUpdated={(updatedEvent) => {
          setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e))
        }}
      />
    </div>
  )
}
