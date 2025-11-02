"use client"

import { useState } from "react"
import { Globe } from "lucide-react"

interface LanguageSwitcherProps {
  isScrolled: boolean
  isMobile?: boolean
}

export default function LanguageSwitcher({ isScrolled, isMobile = false }: LanguageSwitcherProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<"IT" | "EN">("EN")

  const languages = [
    { code: "IT", label: "Italiano" },
    { code: "EN", label: "English" },
  ] as const

  if (isMobile) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Globe size={16} className={isScrolled ? "text-foreground" : "text-white"} />
        <div className="flex gap-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-200 ${
                selectedLanguage === lang.code
                  ? isScrolled
                    ? "bg-primary text-white"
                    : "bg-white/20 text-white backdrop-blur-sm"
                  : isScrolled
                    ? "text-muted-foreground hover:bg-muted"
                    : "text-white/70 hover:bg-white/10"
              }`}
            >
              {lang.code}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-sm border transition-all duration-200 hover:scale-105">
      <Globe size={14} className={`${isScrolled ? "text-muted-foreground" : "text-white/80"} transition-colors`} />
      <div className="flex gap-0.5">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setSelectedLanguage(lang.code)}
            className={`px-2 py-0.5 text-xs font-medium rounded transition-all duration-200 ${
              selectedLanguage === lang.code
                ? isScrolled
                  ? "bg-primary text-white"
                  : "bg-white/20 text-white backdrop-blur-sm"
                : isScrolled
                  ? "text-muted-foreground hover:bg-muted"
                  : "text-white/70 hover:bg-white/10"
            }`}
            aria-label={`Switch to ${lang.label}`}
          >
            {lang.code}
          </button>
        ))}
      </div>
    </div>
  )
}
