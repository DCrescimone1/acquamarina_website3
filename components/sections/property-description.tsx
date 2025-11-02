"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export default function PropertyDescriptionSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const amenities = [
    { icon: "🛏️", title: "Luxury Bedrooms", description: "Premium linens and bespoke furnishings" },
    { icon: "🍽️", title: "Gourmet Kitchen", description: "State-of-the-art appliances" },
    { icon: "🏊", title: "Private Pool", description: "Heated infinity pool with sea views" },
    { icon: "🌅", title: "Terrace", description: "Panoramic ocean vistas" },
    { icon: "📺", title: "Entertainment", description: "Premium smart home systems" },
    { icon: "🧘", title: "Wellness", description: "Spa and meditation spaces" },
  ]

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            A Unique
            <br />
            Location
          </h2>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center mb-16 md:mb-20">
          {/* Image */}
          <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 order-2 lg:order-1 group">
            <Image
              src="/placeholder.svg?key=xk1vs"
              alt="Property interior"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              quality={85}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/10 transition-all duration-300"></div>
          </div>

          {/* Description */}
          <div
            className={`transition-all duration-1000 order-1 lg:order-2 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 md:mb-6">
              Hope Cove
            </h3>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4 md:mb-6">
              Nestled on the edge of the sandy beach, this exquisite property offers breathtaking panoramic views of
              pristine coastlines. Every detail has been thoughtfully curated to provide the ultimate luxury experience.
            </p>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 md:mb-8">
              The residence seamlessly blends contemporary design with timeless elegance, featuring premium materials,
              bespoke furnishings, and cutting-edge amenities throughout. Perfect for discerning travelers seeking an
              unforgettable coastal escape.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 pt-6 md:pt-8 border-t border-border">
              <div className="group hover:scale-105 transition-transform duration-200">
                <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-primary transition-colors group-hover:text-accent">
                  4
                </p>
                <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide mt-1 md:mt-2">
                  Bedrooms
                </p>
              </div>
              <div className="group hover:scale-105 transition-transform duration-200">
                <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-primary transition-colors group-hover:text-accent">
                  3
                </p>
                <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide mt-1 md:mt-2">
                  Bathrooms
                </p>
              </div>
              <div className="group hover:scale-105 transition-transform duration-200">
                <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-primary transition-colors group-hover:text-accent">
                  2800
                </p>
                <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide mt-1 md:mt-2">Sq M</p>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities Grid */}
        <div className="mt-12 md:mt-20 lg:mt-32">
          <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-center mb-8 md:mb-16">
            Premium Amenities
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {amenities.map((item, index) => (
              <div
                key={index}
                className="p-6 md:p-8 border border-border rounded-lg hover:shadow-lg hover:border-primary/50 transition-all duration-300 group cursor-pointer transform hover:-translate-y-1"
              >
                <p className="text-3xl md:text-4xl mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
                  {item.icon}
                </p>
                <h4 className="font-serif text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">
                  {item.title}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
