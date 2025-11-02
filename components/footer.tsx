"use client"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 mb-12 md:mb-16">
          {/* Brand */}
          <div className="hidden md:block">
            <h3 className="font-serif text-xl md:text-2xl font-bold mb-3 md:mb-4">Luxury</h3>
            <p className="text-primary-foreground/70 text-xs md:text-sm leading-relaxed">
              Experience the epitome of coastal luxury with our exquisite holiday retreat.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-xs md:text-sm uppercase tracking-wide mb-3 md:mb-4 text-primary-foreground">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs md:text-sm">
              {["Home", "Property", "Gallery", "Booking", "Contact"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-primary-foreground/70 hover:text-primary-foreground hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold text-xs md:text-sm uppercase tracking-wide mb-3 md:mb-4 text-primary-foreground">
              Information
            </h4>
            <ul className="space-y-2 text-xs md:text-sm">
              {["Terms", "Privacy", "Cancellation", "FAQs", "Support"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-primary-foreground/70 hover:text-primary-foreground hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="hidden md:block">
            <h4 className="font-semibold text-xs md:text-sm uppercase tracking-wide mb-3 md:mb-4 text-primary-foreground">
              Contact
            </h4>
            <ul className="space-y-2 md:space-y-3 text-xs md:text-sm">
              <li>
                <a
                  href="mailto:acquamarina.marzamemi@gmail.com"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  acquamarina.marzamemi@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+393501159152"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  +39 3501159152
                </a>
              </li>
              <li className="pt-1 md:pt-2">
                <div className="flex gap-3 md:gap-4">
                  {["Instagram", "Facebook", "WhatsApp"].map((social) => (
                    <a
                      key={social}
                      href={
                        social === "WhatsApp"
                          ? "https://wa.me/393501159152?text=Ciao%2C%20sono%20interessato%20a%20prenotare%20MarzaGem%20Holiday%20Home"
                          : "#"
                      }
                      className="text-primary-foreground/70 hover:text-primary-foreground hover:scale-110 transition-all duration-200 text-xs hover:underline"
                    >
                      {social}
                    </a>
                  ))}
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-4 text-xs text-primary-foreground/60">
            <p>&copy; {currentYear} Acquamarina Marzamemi. All rights reserved.</p>
            <p className="hidden sm:block">Designed with elegance for your perfect escape</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
