import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Lora } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/lib/contexts"
import { DynamicMetadata } from "@/components/dynamic-metadata"

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
  title: "Rifugio di Lusso per Vacanze | Prenota la Tua Fuga Perfetta",
  description:
    "Vivi l'epitome del lusso costiero. Scopri la nostra squisita proprietà per vacanze con servizi premium, viste mozzafiato e servizio di classe mondiale. Prenota oggi la tua fuga da sogno.",
  keywords: "vacanze di lusso, casa al mare, affitto vacanze, rifugio costiero, Marzamemi, Sicilia",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=5.0",
  openGraph: {
    title: "Acquamarina Casa Vacanze - Rifugio di Lusso",
    description: "La tua perfetta fuga costiera a Marzamemi",
    siteName: "Acquamarina Casa Vacanze",
    type: "website",
    images: [
      {
        url: "/logo.webp",
        width: 512,
        height: 512,
        alt: "Acquamarina Casa Vacanze Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Acquamarina Casa Vacanze - Rifugio di Lusso",
    description: "La tua perfetta fuga costiera a Marzamemi",
    images: ["/logo.webp"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it">
      <head>
        <meta charSet="UTF-8" />
        <meta name="theme-color" content="#25354a" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${playfairDisplay.variable} ${lora.variable} font-sans antialiased bg-background text-foreground overflow-x-hidden`}
      >
        <LanguageProvider>
          <DynamicMetadata />
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
