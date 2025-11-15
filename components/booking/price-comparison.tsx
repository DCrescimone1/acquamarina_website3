"use client"

import { ExternalLink } from "lucide-react"
import { useTranslation } from "@/lib/hooks/useTranslation"
import { Button } from "@/components/ui/button"

interface PriceResult {
  platform: string
  price: number | string
  currency: string
  url: string
  available?: boolean
  isDirectBooking?: boolean
}

interface PriceComparisonProps {
  results?: {
    results?: PriceResult[]
    loading?: boolean
    error?: string
  }
  bookingDetails?: {
    checkIn: string
    checkOut: string
    guests: number
    language: 'it' | 'en'
  }
  onDirectBooking?: (checkIn: string, checkOut: string, guests: number, totalAmount: number, language: 'it' | 'en') => void
}

export default function PriceComparison({ results, bookingDetails, onDirectBooking }: PriceComparisonProps) {
  const { t } = useTranslation()
  
  if (!results?.results || results.results.length === 0) {
    return null
  }

  const sortedResults = [...results.results].sort((a, b) => {
    const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price
    const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price
    return priceA - priceB
  })
  const bestPrice = typeof sortedResults[0]?.price === 'string' 
    ? parseFloat(sortedResults[0].price) 
    : sortedResults[0]?.price

  const handleDirectBookingClick = (result: PriceResult) => {
    if (!bookingDetails || !onDirectBooking) return
    
    const price = typeof result.price === 'string' ? parseFloat(result.price) : result.price
    onDirectBooking(
      bookingDetails.checkIn,
      bookingDetails.checkOut,
      bookingDetails.guests,
      price,
      bookingDetails.language
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8 border border-border">
      <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">{t('booking.priceComparison')}</h3>

      <div className="space-y-3">
        {sortedResults.map((result, index) => {
          const price = typeof result.price === 'string' ? parseFloat(result.price) : result.price
          const isBestPrice = price === bestPrice
          const isDirect = result.isDirectBooking || result.platform === t('booking.platforms.direct')
          
          return (
            <div
              key={result.platform}
              className={`p-3 sm:p-4 rounded-lg border transition-all ${
                isBestPrice ? "border-green-400 bg-green-50" : "border-border hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm sm:text-base truncate">{result.platform}</p>
                  {isBestPrice && <p className="text-xs text-green-600 font-medium mt-1">{t('booking.bestPrice')}</p>}
                </div>
                <div className="text-right flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary whitespace-nowrap">
                    {result.currency}
                    {price}
                  </p>
                  {isDirect && bookingDetails && onDirectBooking ? (
                    <Button
                      onClick={() => handleDirectBookingClick(result)}
                      className="bg-primary hover:bg-primary/90 text-white h-9 text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap"
                    >
                      {t('booking.proceedBooking')}
                    </Button>
                  ) : (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline flex items-center gap-1 justify-end"
                    >
                      {t('booking.view')} <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
