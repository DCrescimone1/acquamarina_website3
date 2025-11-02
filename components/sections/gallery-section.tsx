"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GallerySection() {
  const [currentPage, setCurrentPage] = useState(0)
  const [columnsPerPage, setColumnsPerPage] = useState(3)
  const [autoRotate, setAutoRotate] = useState(true)

  // Sample gallery images - replace with actual images
  const galleryImages = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    src: `/placeholder.svg?height=${300 + (i % 3) * 50}&width=${400 + (i % 3) * 50}&query=luxury-property-${i}`,
    alt: `Property image ${i + 1}`,
    size: i % 6, // 0-5 for varied sizes
  }))

  // Calculate responsive columns
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 640) {
        setColumnsPerPage(1) // Mobile: 3 images total (1 column layout)
      } else if (window.innerWidth < 1024) {
        setColumnsPerPage(2)
      } else {
        setColumnsPerPage(3)
      }
    }

    updateColumns()
    window.addEventListener("resize", updateColumns)
    return () => window.removeEventListener("resize", updateColumns)
  }, [])

  // Auto-rotate pages every 5 seconds
  useEffect(() => {
    if (!autoRotate) return

    const timer = setInterval(() => {
      setCurrentPage((prev) => {
        const maxPages = Math.ceil(galleryImages.length / 9)
        return (prev + 1) % maxPages
      })
    }, 5000)

    return () => clearInterval(timer)
  }, [autoRotate, galleryImages.length])

  const itemsPerPage = columnsPerPage === 1 ? 3 : 9
  const maxPages = Math.ceil(galleryImages.length / itemsPerPage)
  const startIdx = currentPage * itemsPerPage
  const currentImages = galleryImages.slice(startIdx, startIdx + itemsPerPage)

  const handlePrevPage = () => {
    setAutoRotate(false)
    setCurrentPage((prev) => (prev - 1 + maxPages) % maxPages)
  }

  const handleNextPage = () => {
    setAutoRotate(false)
    setCurrentPage((prev) => (prev + 1) % maxPages)
  }

  const getMobileGridClasses = (index: number) => {
    if (index === 0) return "col-span-1 row-span-1" // Small top-left
    if (index === 1) return "col-span-1 row-span-1" // Small top-right
    if (index === 2) return "col-span-2 row-span-2" // Large bottom
    return "col-span-1 row-span-1"
  }

  const getGridClasses = (index: number) => {
    // Mobile: use special 3-image layout
    if (columnsPerPage === 1) {
      return getMobileGridClasses(index)
    }

    // Tablet/Desktop: original masonry pattern
    const sizePattern = [
      "col-span-1 row-span-1",
      "col-span-2 row-span-2",
      "col-span-1 row-span-1",
      "col-span-1 row-span-2",
      "col-span-2 row-span-1",
      "col-span-1 row-span-1",
    ]
    return sizePattern[index % 6]
  }

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">Visual Tour</h2>
          <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore the beauty of our property with our curated photo collection
          </p>
        </div>

        {/* Gallery Grid with Masonry Layout */}
        <div className="relative">
          <div className="grid gap-3 md:gap-4 mb-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-3 auto-rows-[150px] md:auto-rows-[280px]">
            {currentImages.map((image, idx) => (
              <div
                key={image.id}
                className={`${getGridClasses(idx)} relative rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group cursor-pointer animate-in fade-in`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <Image
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt}
                  fill
                  className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
                  quality={75}
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Indicator & Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 md:mt-12">
            {/* Minimal Page Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm text-muted-foreground">
                Page <span className="font-semibold text-foreground">{currentPage + 1}</span>/
                <span className="font-semibold text-foreground">{maxPages}</span>
              </span>
            </div>

            <div className="flex gap-2 md:gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevPage}
                className="rounded-full h-9 w-9 md:h-10 md:w-10 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 active:scale-95 bg-transparent"
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                className="rounded-full h-9 w-9 md:h-10 md:w-10 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 active:scale-95 bg-transparent"
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${autoRotate ? "bg-primary scale-125" : "bg-gray-300"}`}
              ></div>
              <span className="hidden sm:inline">{autoRotate ? "Auto" : "Manual"}</span>
            </div>
          </div>

          <div className="mt-6 h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
              style={{ width: `${((currentPage + 1) / maxPages) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </section>
  )
}
