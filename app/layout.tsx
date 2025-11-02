import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Lora } from "next/font/google"
import "./globals.css"

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "700", "900"],
})

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Luxury Holiday Retreat | Book Your Perfect Getaway",
  description:
    "Experience ultimate coastal luxury. Discover our exquisite holiday property with premium amenities, stunning views, and world-class service. Book your dream getaway today.",
  keywords: "luxury holiday, beach house, vacation rental, coastal retreat",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=5.0",
  openGraph: {
    title: "Luxury Holiday Retreat",
    description: "Your perfect coastal escape",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="theme-color" content="#25354a" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${playfairDisplay.variable} ${lora.variable} font-sans antialiased bg-background text-foreground overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  )
}
