import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20",
})

interface BookingDetails {
  checkIn: string
  checkOut: string
  adults: number
  children: number
  pets: boolean
  totalPrice: string
}

export async function POST(request: NextRequest) {
  try {
    const { bookingDetails }: { bookingDetails: BookingDetails } = await request.json()
    const amount = Math.round(Number.parseFloat(bookingDetails.totalPrice) * 100)
    const reference = `LUXURY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      payment_method_types: ["card", "paypal", "klarna", "sepa_debit"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Luxury Holiday Retreat Booking",
              description: `Booking from ${bookingDetails.checkIn} to ${bookingDetails.checkOut}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      return_url: `${request.headers.get("origin")}/booking-success?reference=${reference}`,
      metadata: {
        reference,
        checkIn: bookingDetails.checkIn,
        checkOut: bookingDetails.checkOut,
        adults: bookingDetails.adults.toString(),
        children: bookingDetails.children.toString(),
        pets: bookingDetails.pets.toString(),
      },
    })

    return NextResponse.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
      reference,
    })
  } catch (error) {
    console.error("Stripe error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
