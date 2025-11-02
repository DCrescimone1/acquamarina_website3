import { type NextRequest, NextResponse } from "next/server"

interface SearchRequest {
  dates: { from: string; to: string }
  guests: { adults: number; children: number }
  language?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json()
    const { dates, guests } = body

    if (!dates.from || !dates.to) {
      return NextResponse.json({ error: "Missing dates" }, { status: 400 })
    }

    // Calculate price based on duration
    const from = new Date(dates.from)
    const to = new Date(dates.to)
    const nights = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))

    const pricePerNight = 250
    const baseTotalPrice = nights * pricePerNight

    // Calculate platform prices with variations
    const results = [
      {
        platform: "Airbnb",
        price: Math.round(baseTotalPrice * 1.15),
        currency: "€",
        url: "https://airbnb.com",
        available: true,
      },
      {
        platform: "Booking.com",
        price: Math.round(baseTotalPrice * 1.1),
        currency: "€",
        url: "https://booking.com",
        available: true,
      },
      {
        platform: "Direct Booking",
        price: baseTotalPrice,
        currency: "€",
        url: "#",
        available: true,
      },
    ]

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Price search error:", error)
    return NextResponse.json({ error: "Failed to search prices" }, { status: 500 })
  }
}
