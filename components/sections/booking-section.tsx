"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AvailabilityCalendar from "@/components/booking/availability-calendar"
import PriceComparison from "@/components/booking/price-comparison"
import { useTranslation } from "@/lib/hooks/useTranslation"

export default function BookingSection() {
  const { t, language } = useTranslation()
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [pets, setPets] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState(null)

  const handleCheckAvailability = async () => {
    // Validation
    if (!checkIn || !checkOut) {
      alert(t('booking.selectDatesError'))
      return
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkInDate < today) {
      alert(t('validation.pastDate'))
      return
    }

    if (checkOutDate <= checkInDate) {
      alert(t('validation.invalidDateRange'))
      return
    }

    if (adults < 1) {
      alert(t('validation.minGuests'))
      return
    }

    if (adults + children > 6) {
      alert(t('validation.maxGuests'))
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/search-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dates: { from: checkIn, to: checkOut },
          guests: { adults, children },
          language: language,
        }),
      })

      if (!response.ok) throw new Error("Failed to fetch prices")
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error("Error:", error)
      alert(t('booking.availabilityError'))
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    // Validation
    if (!checkIn || !checkOut) {
      alert(t('booking.selectDatesError'))
      return
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkInDate < today) {
      alert(t('validation.pastDate'))
      return
    }

    if (checkOutDate <= checkInDate) {
      alert(t('validation.invalidDateRange'))
      return
    }

    if (adults < 1) {
      alert(t('validation.minGuests'))
      return
    }

    if (adults + children > 6) {
      alert(t('validation.maxGuests'))
      return
    }

    // Calculate price based on nights
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    const pricePerNight = 250
    const totalPrice = nights * pricePerNight

    // Redirect to payment/confirmation page
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      adults: adults.toString(),
      children: children.toString(),
      pets: pets.toString(),
      price: totalPrice.toString(),
      currency: "€",
    })

    window.location.href = `/booking-confirmation?${params}`
  }

  return (
    <section className="bg-gradient-to-b from-white to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-sm tracking-widest text-muted-foreground uppercase"></span>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            {t('booking.title')}
          </h2>
          <p className="mt-3 text-base md:text-lg text-muted-foreground">
            {t('booking.subtitle')}
          </p>
        </div>

        {/* Booking Widget */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Search & Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-xl p-8 md:p-12 border border-border mb-8">
              {/* Quick Search */}
              <h3 className="font-serif text-2xl font-bold text-foreground mb-6">{t('booking.findDatesTitle')}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('booking.checkIn')}</label>
                  <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('booking.checkOut')}</label>
                  <Input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('booking.adults')}</label>
                  <Input
                    type="number"
                    min="1"
                    max="6"
                    value={adults}
                    onChange={(e) => setAdults(Number.parseInt(e.target.value) || 1)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('booking.children')}</label>
                  <Input
                    type="number"
                    min="0"
                    max="4"
                    value={children}
                    onChange={(e) => setChildren(Number.parseInt(e.target.value) || 0)}
                    className="w-full"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      checked={pets}
                      onChange={(e) => setPets(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-foreground">{t('booking.pets')}</span>
                  </label>
                </div>
              </div>

              <Button
                onClick={handleCheckAvailability}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white h-11 mb-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('booking.checking')}
                  </>
                ) : (
                  t('booking.checkAvailability')
                )}
              </Button>

              <Button onClick={handleBooking} className="w-full bg-primary/80 hover:bg-primary/70 text-white h-11">
                {t('booking.proceedBooking')}
              </Button>
            </div>

            {/* Price Comparison Results */}
            {searchResults && <PriceComparison results={searchResults} />}
          </div>

          {/* Right Column - Calendar */}
          <div className="lg:col-span-1">
            <AvailabilityCalendar
              onDateSelect={(dates) => {
                setCheckIn(dates.from)
                setCheckOut(dates.to)
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
