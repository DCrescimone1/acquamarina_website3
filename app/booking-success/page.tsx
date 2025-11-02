"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Mail, Phone } from "lucide-react"

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reference = searchParams?.get("reference")

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-muted/20 px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-2xl border border-green-200 p-8 md:p-12 text-center">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />

          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">Booking Confirmed!</h1>

          <p className="text-lg text-muted-foreground mb-2">Your luxury retreat is secured</p>

          {reference && (
            <p className="text-sm text-muted-foreground mb-8 font-mono bg-muted p-4 rounded">
              Reference: <span className="font-semibold">{reference}</span>
            </p>
          )}

          <div className="space-y-4 my-12 text-left bg-muted/50 rounded-lg p-6">
            <h3 className="font-serif text-xl font-bold text-foreground mb-6">What's Next?</h3>

            <div className="flex gap-4 items-start">
              <Mail className="flex-shrink-0 text-primary mt-1" size={20} />
              <div>
                <p className="font-medium text-foreground">Confirmation Email</p>
                <p className="text-sm text-muted-foreground">Check your inbox for booking details</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <Phone className="flex-shrink-0 text-primary mt-1" size={20} />
              <div>
                <p className="font-medium text-foreground">We'll Contact You</p>
                <p className="text-sm text-muted-foreground">Our team will reach out with pre-arrival details</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-sm text-blue-900">
              Questions? Contact us at{" "}
              <a href="mailto:info@luxury.com" className="font-semibold hover:underline">
                info@luxury.com
              </a>{" "}
              or{" "}
              <a href="tel:+441234567890" className="font-semibold hover:underline">
                +44 1234 567890
              </a>
            </p>
          </div>

          <Button
            onClick={() => router.push("/")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 text-base font-semibold"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
