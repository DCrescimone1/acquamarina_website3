import { NextResponse } from "next/server"
import ICAL from "ical.js"

const AIRBNB_CALENDAR_URL = process.env.AIRBNB_CALENDAR_URL as string
const BOOKING_CALENDAR_URL = process.env.BOOKING_CALENDAR_URL as string
const CACHE_DURATION = 300
const FETCH_TIMEOUT_MS = 10000

// Last successful (complete) result from every configured source. Never
// overwritten by a partial result, so a failing feed can't widen availability.
let cache: {
  timestamp: number
  data: string
} | null = null

// Calendar dates are plain days, not instants: an iCal VALUE=DATE has no time
// zone, and neither does "the night of the 18th". Emitting yyyy-MM-dd keeps the
// server and the visitor's browser from disagreeing by a day.
function toDateKey(time: ICAL.Time) {
  return `${time.year}-${String(time.month).padStart(2, "0")}-${String(time.day).padStart(2, "0")}`
}

async function fetchAndParseCalendar(url: string, source: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "LuxuryRetreat-Calendar/1.0",
      Accept: "text/calendar",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${source} calendar: ${response.status}`)
  }

  const icalData = await response.text()
  const jcalData = ICAL.parse(icalData)
  const comp = new ICAL.Component(jcalData)
  const vevents = comp.getAllSubcomponents("vevent")

  return vevents.map((vevent) => {
    const event = new ICAL.Event(vevent)
    // DTEND is exclusive (the checkout day), so step back to the last occupied night
    const lastNight = event.endDate.clone()
    lastNight.adjust(-1, 0, 0, 0)

    return {
      start: toDateKey(event.startDate),
      end: toDateKey(lastNight),
      summary: event.summary || "Booked",
      source: source,
    }
  })
}

export async function GET() {
  const now = Date.now()

  // Check cache
  if (cache && now - cache.timestamp < CACHE_DURATION * 1000) {
    return new NextResponse(cache.data, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${CACHE_DURATION}`,
      },
    })
  }

  const sources: Array<{ url: string; name: string }> = []
  if (AIRBNB_CALENDAR_URL) sources.push({ url: AIRBNB_CALENDAR_URL, name: "Airbnb" })
  if (BOOKING_CALENDAR_URL) sources.push({ url: BOOKING_CALENDAR_URL, name: "Booking.com" })

  const results = await Promise.allSettled(sources.map(({ url, name }) => fetchAndParseCalendar(url, name)))

  const failed = sources.filter((_, i) => results[i].status === "rejected")

  if (failed.length > 0) {
    results.forEach((result, i) => {
      if (result.status === "rejected") console.error(`Calendar source ${sources[i].name} failed:`, result.reason)
    })

    // Fail closed: serve the last complete snapshot rather than a partial one,
    // and don't let it be cached downstream so the next request retries.
    if (cache) {
      return new NextResponse(cache.data, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "X-Calendar-Stale": failed.map((s) => s.name).join(","),
        },
      })
    }

    return NextResponse.json(
      { error: "Failed to fetch calendar data", sources: failed.map((s) => s.name) },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }

  const events = results.flatMap((result) => (result.status === "fulfilled" ? result.value : []))
  const jsonData = JSON.stringify(events)
  cache = { timestamp: now, data: jsonData }

  return new NextResponse(jsonData, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${CACHE_DURATION}`,
    },
  })
}
