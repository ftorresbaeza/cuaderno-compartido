import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarDay {
  date: Date
  hasImages: boolean
  imageCount: number
  hasEvents: boolean
  eventCount: number
}

interface CalendarViewProps {
  currentMonth: Date
  onMonthChange: (date: Date) => void
  days: CalendarDay[]
  onDayClick: (date: Date) => void
  selectedDate?: Date
}

export function CalendarView({
  currentMonth,
  onMonthChange,
  days,
  onDayClick,
  selectedDate,
}: CalendarViewProps) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const startPadding = monthStart.getDay()
  const paddedDays = Array(startPadding).fill(null).concat(calendarDays)

  const weeks: (Date | null)[][] = []
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7))
  }

  const getDayInfo = (date: Date | null): CalendarDay | undefined => {
    if (!date) return undefined
    return days.find((d) => isSameDay(d.date, date))
  }

  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  return (
    <div className="bg-bg-card rounded-2xl border-2 border-border overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-bg-secondary rounded-xl transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-text-secondary" />
        </button>
        <h3 className="font-semibold text-text-primary capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h3>
        <button
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-bg-secondary rounded-xl transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-text-secondary" />
        </button>
      </div>

      <div className="grid grid-cols-7">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-text-muted border-b border-border"
          >
            {day}
          </div>
        ))}

        {weeks.flat().map((date, index) => {
          const dayInfo = getDayInfo(date)
          const isToday = date && isSameDay(date, new Date())
          const isSelected = date && selectedDate && isSameDay(date, selectedDate)

          return (
            <button
              key={index}
              onClick={() => date && onDayClick(date)}
              disabled={!date}
              className={cn(
                "aspect-square p-1 flex flex-col items-center justify-center relative transition-colors",
                !date && "bg-bg-secondary/30",
                date && "hover:bg-bg-secondary",
                isSelected && "bg-accent-primary/10"
              )}
            >
              {date && (
                <>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      !isSameMonth(date, currentMonth) && "text-text-muted",
                      isToday && "bg-accent-primary text-white rounded-full w-7 h-7 flex items-center justify-center"
                    )}
                  >
                    {format(date, "d")}
                  </span>
                  {dayInfo && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayInfo.hasImages && (
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                      )}
                      {dayInfo.hasEvents && (
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
                      )}
                    </div>
                  )}
                </>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
