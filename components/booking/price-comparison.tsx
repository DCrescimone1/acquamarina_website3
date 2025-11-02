"use client"

import { ExternalLink } from "lucide-react"

interface PriceResult {
  platform: string
  price: number
  currency: string
  url: string
  available: boolean
}

interface PriceComparisonProps {
  results?: {
    results?: PriceResult[]
    loading?: boolean
    error?: string
  }
}

export default function PriceComparison({ results }: PriceComparisonProps) {
  if (!results?.results || results.results.length === 0) {
    return null
  }

  const sortedResults = [...results.results].sort((a, b) => a.price - b.price)
  const bestPrice = sortedResults[0]?.price

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 border border-border">
      <h3 className="font-serif text-2xl font-bold text-foreground mb-6">Price Comparison</h3>

      <div className="space-y-3">
        {sortedResults.map((result, index) => (
          <div
            key={result.platform}
            className={`p-4 rounded-lg border transition-all ${
              result.price === bestPrice ? "border-green-400 bg-green-50" : "border-border hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{result.platform}</p>
                {result.price === bestPrice && <p className="text-xs text-green-600 font-medium">Best Price</p>}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {result.currency}
                  {result.price}
                </p>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline flex items-center gap-1 justify-end mt-1"
                >
                  View <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
