"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { X, Send } from "lucide-react"

export default function FloatingLogoButton() {
  const [isHovered, setIsHovered] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [message, setMessage] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      // TODO: Implement chat functionality
      console.log("[v0] Message sent:", message)
      setMessage("")
    }
  }

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50 group">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-16 h-16 md:w-24 md:h-24 rounded-full bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-primary/20 overflow-hidden"
          aria-label="Acquamarina Casa Vacanze - Open Chat"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Image
            src="/images/design-mode/Screenshot%202025-11-01%20at%2016.26.27.png"
            alt="Acquamarina Logo"
            width={96}
            height={96}
            className="w-full h-full object-contain p-1"
          />
        </button>

        {/* Tooltip on hover */}
        <div
          className={`absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-primary text-white text-sm rounded-lg whitespace-nowrap transition-all duration-300 ${
            isHovered && !isChatOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          Chat with us
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary" />
        </div>
      </div>

      <div
        className={`fixed bottom-8 right-8 z-40 w-[90vw] max-w-md transition-all duration-500 ease-out ${
          isChatOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-primary/10 overflow-hidden mb-20 md:mb-28">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-primary to-primary/90 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Image
                  src="/images/design-mode/Screenshot%202025-11-01%20at%2016.26.27.png"
                  alt="Acquamarina"
                  width={40}
                  height={40}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h3 className="font-serif text-lg">Acquamarina</h3>
                <p className="text-xs text-white/80">Casa Vacanze</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="h-80 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
            <div className="space-y-4">
              {/* Welcome Message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                  <Image
                    src="/images/design-mode/Screenshot%202025-11-01%20at%2016.26.27.png"
                    alt="Acquamarina"
                    width={32}
                    height={32}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 max-w-[80%]">
                  <p className="text-sm text-gray-700 leading-relaxed">Welcome to Acquamarina Casa Vacanze! 🌊</p>
                  <p className="text-sm text-gray-700 leading-relaxed mt-2">
                    How can we help you plan your perfect coastal getaway?
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-100 p-4 bg-white">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 rounded-full border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
