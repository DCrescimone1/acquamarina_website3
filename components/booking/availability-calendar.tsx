"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isAfter, isBefore } from "date-fns"
import { useTranslation } from "@/lib/hooks/useTranslation"
import { cn } from "@/lib/utils"

interface AvailabilityCalendarProps {
  onDateSelect?: (dates: { from: string; to: string }) => void
  className?: string
  sticky?: boolean
  initialFrom?: string
  initialTo?: string
}

export default function AvailabilityCalendar({
  onDateSelect,
  className,
  sticky = true,
  initialFrom,
  initialTo,
}: AvailabilityCalendarProps) {
  const { t } = useTranslation()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [bookedDates, setBookedDates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFrom, setSelectedFrom] = useState<Date | null>(null)
  const [selectedTo, setSelectedTo] = useState<Date | null>(null)

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const response = await fetch("/api/calendar")
        if (!response.ok) throw new Error("Failed to fetch calendar")
        const data = await response.json()
        setBookedDates(data)
      } catch (error) {
        console.error(t('booking.calendar.loadingError'), error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookedDates()
  }, [])

  useEffect(() => {
    if (initialFrom) {
      setSelectedFrom(new Date(initialFrom))
    } else {
      setSelectedFrom(null)
    }

    if (initialTo) {
      setSelectedTo(new Date(initialTo))
    } else {
      setSelectedTo(null)
    }
  }, [initialFrom, initialTo])

  const isDateBooked = (date: Date) => {
    return bookedDates.some((booking) => {
      const start = new Date(booking.start)
      const end = new Date(booking.end)
      return date >= start && date <= end
    })
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const handleDateClick = (date: Date) => {
    if (isDateBooked(date) || isBefore(date, new Date())) return

    if (!selectedFrom || (selectedFrom && selectedTo)) {
      setSelectedFrom(date)
      setSelectedTo(null)
    } else if (isAfter(date, selectedFrom)) {
      setSelectedTo(date)
      onDateSelect?.({
        from: format(selectedFrom, "yyyy-MM-dd"),
        to: format(date, "yyyy-MM-dd"),
      })
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-6 flex items-center justify-center h-80">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-xl p-6 border border-border",
        sticky ? "sticky top-24" : "",
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-lg font-bold text-foreground">{format(currentMonth, "MMMM yyyy")}</h3>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
            className="h-8 w-8"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
            className="h-8 w-8"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {[
          t('booking.calendar.weekdays.sun'),
          t('booking.calendar.weekdays.mon'),
          t('booking.calendar.weekdays.tue'),
          t('booking.calendar.weekdays.wed'),
          t('booking.calendar.weekdays.thu'),
          t('booking.calendar.weekdays.fri'),
          t('booking.calendar.weekdays.sat')
        ].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isBooked = isDateBooked(day)
          const isPast = isBefore(day, new Date())
          const isSelected =
            (selectedFrom && day.toDateString() === selectedFrom.toDateString()) ||
            (selectedTo && day.toDateString() === selectedTo.toDateString())
          const isInRange = selectedFrom && selectedTo && day > selectedFrom && day < selectedTo

          return (
            <button
              key={day.toDateString()}
              onClick={() => handleDateClick(day)}
              disabled={isBooked || isPast}
              className={`h-8 rounded text-xs font-medium transition-colors ${
                isBooked
                  ? "bg-red-100 text-red-600 cursor-not-allowed opacity-50"
                  : isPast
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                    : isSelected
                      ? "bg-primary text-primary-foreground"
                      : isInRange
                        ? "bg-primary/20 text-primary"
                        : "bg-muted hover:bg-muted/60 text-foreground"
              }`}
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-border space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary"></div>
          <span className="text-muted-foreground">{t('booking.calendar.legend.selected')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-100"></div>
          <span className="text-muted-foreground">{t('booking.calendar.legend.booked')}</span>
        </div>
      </div>
    </div>
  )
}
