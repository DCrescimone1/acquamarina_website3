"use client"

import { MapPin, Phone } from "lucide-react"

export default function LocationSection() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-5xl md:text-6xl font-bold text-foreground">Where We Are</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Nestled in a breathtaking coastal setting with easy access to local attractions and amenities
          </p>
        </div>

        {/* Map Container */}
        <div className="rounded-lg overflow-hidden shadow-xl h-[400px] md:h-[600px] bg-muted flex items-center justify-center mb-12 md:mb-16">
          <iframe
            src="https://www.google.com/maps?q=36.723632,15.117694&z=17&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        {/* Location Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 md:p-8 bg-linear-to-br from-primary/5 to-accent/5 border border-border rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-6 h-6 text-primary" />
              <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">Address</p>
            </div>
            <p className="font-serif text-xl font-semibold text-foreground">
              Borgo 84, Marzamemi 96018
              <br />
              Cotrada Calafarina
            </p>
          </div>

          <div className="p-6 md:p-8 bg-linear-to-br from-primary/5 to-accent/5 border border-border rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-6 h-6 text-primary" />
              <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">Coordinates</p>
            </div>
            <p className="font-serif text-xl font-semibold text-foreground">36.723632, 15.117694</p>
          </div>

          <div className="p-6 md:p-8 bg-linear-to-br from-primary/5 to-accent/5 border border-border rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Phone className="w-6 h-6 text-primary" />
              <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">Nearby</p>
            </div>
            <p className="font-serif text-xl font-semibold text-foreground">
              Marzamemi (2 min)
              <br />
              spiaggia (1 min)
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 md:mt-20 pt-16 md:pt-20 border-t border-border/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="font-serif text-2xl font-bold text-foreground mb-6">Getting Here</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>15 minutes from nearest airport</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Direct access to coastal walking paths</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Local restaurants and shops within 5 minutes</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Ample on-site parking available</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-2xl font-bold text-foreground mb-6">What's Nearby</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-accent font-bold">★</span>
                  <span>Beautiful sandy beaches</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">★</span>
                  <span>Historic town centers with galleries</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">★</span>
                  <span>Fine dining restaurants and cafés</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent font-bold">★</span>
                  <span>Water sports and outdoor activities</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
