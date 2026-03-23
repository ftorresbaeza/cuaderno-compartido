"use client"

import { useState, useEffect } from "react"
import { CalendarView } from "@/components/calendar/CalendarView"
import { DayPopover } from "@/components/calendar/DayPopover"
import { CreateEventDialog } from "@/components/event/CreateEventDialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { format } from "date-fns"

interface Subject {
  id: string
  name: string
}

interface CalendarEvent {
  id: string
  title: string
  type: "TASK" | "TEST" | "ACTIVITY"
  date: string
  subject?: {
    name: string
  }
}

interface CalendarImage {
  date: string
  subjectId: string
  subjectName: string
  imageCount: number
}

export function CalendarClient({
  courseId,
  courseCode,
  subjects,
  initialEvents,
  initialImages,
}: {
  courseId: string
  courseCode: string
  subjects: Subject[]
  initialEvents: CalendarEvent[]
  initialImages: CalendarImage[]
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [events, setEvents] = useState(initialEvents)
  const [images, setImages] = useState(initialImages)

  useEffect(() => {
    async function fetchData() {
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
      const dayEvents = evts.filter((evt) => evt.date.split("T")[0] === dateStr)

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
      .filter((evt) => evt.date.split("T")[0] === dateStr)
      .map((evt) => ({
        id: evt.id,
        title: evt.title,
        type: evt.type,
        subjectName: evt.subject?.name,
      }))

    return { date, images: dayImages, events: dayEvents }
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-text-primary">
            Calendario
          </h1>
          <p className="text-sm text-text-muted">
            {format(currentMonth, "MMMM yyyy", { locale: require("date-fns/locale/es") })}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowEventDialog(true)}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Evento
        </Button>
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
          courseCode={courseCode}
        />
      )}

      <CreateEventDialog
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
        courseId={courseId}
        courseCode={courseCode}
        subjects={subjects}
        defaultDate={selectedDate?.toISOString().split("T")[0]}
      />
    </div>
  )
}
