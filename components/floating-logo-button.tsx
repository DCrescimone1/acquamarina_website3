"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { X, Send, AlertCircle, RefreshCw } from "lucide-react"
import { useTranslation } from "@/lib/hooks/useTranslation"

// Message interface for type safety
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Chat state interface
interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: string | null
}

export default function FloatingLogoButton() {
  const { t } = useTranslation()
  const [isHovered, setIsHovered] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [message, setMessage] = useState("")
  
  // Chat state management
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInputFocused, setIsInputFocused] = useState(false)
  
  // Ref for chat scroll container and input
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  // Detect mobile/tablet (set after mount to avoid SSR/client mismatch)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const compute = () => {
      const width = window.innerWidth
      setIsMobile(width < 640)
      setIsTablet(width >= 640 && width < 1024)
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])

  // Scroll chat container to bottom when messages change or chat opens
  useEffect(() => {
    if (!messagesContainerRef.current) return
    if (!isChatOpen && messages.length === 0) return
    const el = messagesContainerRef.current
    el.scrollTop = el.scrollHeight
  }, [messages, isChatOpen])

  // Handle keyboard visibility on mobile
  useEffect(() => {
    if (!isMobile && !isTablet) return

    const handleResize = () => {
      const windowHeight = window.innerHeight
      const visualViewport = window.visualViewport?.height || windowHeight
      const keyboardHeight = windowHeight - visualViewport
      
      // Keyboard is visible if viewport height is significantly smaller
      const isKeyboardOpen = keyboardHeight > 150
      setKeyboardVisible(isKeyboardOpen)

      // Adjust chat container position when keyboard is visible
      if (chatContainerRef.current && isKeyboardOpen) {
        const maxHeight = Math.min(visualViewport * 0.7, 500)
        chatContainerRef.current.style.maxHeight = `${maxHeight}px`
      }
    }

    // Initial check
    handleResize()

    window.visualViewport?.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('scroll', handleResize)
    window.addEventListener('resize', handleResize)

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('scroll', handleResize)
      window.removeEventListener('resize', handleResize)
    }
  }, [isMobile, isTablet])

  // Scroll to bottom when keyboard appears or messages change
  useEffect(() => {
    if (!isChatOpen) return
    
    const scrollToBottom = () => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      }
    }

    // Multiple scroll attempts for mobile reliability
    if (isMobile || isTablet) {
      scrollToBottom()
      setTimeout(scrollToBottom, 100)
      setTimeout(scrollToBottom, 300)
      if (keyboardVisible) {
        // Extra scroll when keyboard is visible
        setTimeout(scrollToBottom, 500)
      }
    } else {
      scrollToBottom()
    }
  }, [messages, keyboardVisible, isInputFocused, isChatOpen, isMobile, isTablet])

  // Prevent body scroll when chat is open on mobile
  useEffect(() => {
    if (!isMobile || !isChatOpen) return

    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [isChatOpen, isMobile])

  // Initialize welcome message when chat opens
  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      // Focus input when chat opens on mobile
      if ((isMobile || isTablet) && inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus()
        }, 100)
      }
    }
  }, [isChatOpen, messages.length, isMobile, isTablet])

  // Send message function
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    }

    // Add user message to chat
    setMessages(prev => [...prev, userMessage])
    setMessage("")
    setIsLoading(true)
    setError(null)

    // Scroll to bottom immediately after user sends message
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      }
    }, 50)

    try {
      // Prepare conversation history (last 10 message pairs)
      const history = messages.slice(-20).map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to get response' }))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(data.timestamp || new Date())
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      console.error('Chat error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Retry last message
  const handleRetry = () => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user')
      if (lastUserMessage) {
        setMessage(lastUserMessage.content)
        setError(null)
      }
    }
  }

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('default', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 group">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-16 h-16 md:w-24 md:h-24 rounded-full bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-primary/20 overflow-hidden"
          aria-label={t('chat.aria.openChat')}
        >
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Image
            src="/logo.webp"
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
          {t('chat.tooltip')}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary" />
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className={`fixed z-40 transition-all duration-200 ease-out ${
          isChatOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-8 pointer-events-none"
        } ${
          isMobile 
            ? keyboardVisible 
              ? 'inset-x-0 w-full' 
              : 'bottom-4 right-4 w-[calc(100vw-2rem)]'
            : 'bottom-8 right-8 w-[calc(100vw-2rem)] max-w-md'
        }`}
        style={{
          isolation: 'isolate',
          ...(isMobile && keyboardVisible && typeof window !== 'undefined' && window.visualViewport
            ? {
                bottom: 0,
                top: 'auto',
                height: `${Math.min(window.visualViewport.height * 0.7, 500)}px`
              }
            : {})
        }}
      >
        <div className={`bg-white shadow-2xl border border-primary/10 overflow-hidden flex flex-col h-full ${
          isMobile 
            ? keyboardVisible 
              ? 'rounded-t-2xl' 
              : 'rounded-2xl mb-20'
            : 'rounded-2xl mb-28'
        }`}
        style={{
          ...(isMobile && !keyboardVisible 
            ? { 
                height: '50vh',
                maxHeight: '600px',
                minHeight: '350px'
              }
            : !isMobile 
              ? { height: '600px' }
              : {})
        }}
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-primary to-primary/90 text-white px-4 md:px-6 py-3 md:py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden flex-shrink-0 p-0.5">
                <Image
                  src="/logo.webp"
                  alt="Acquamarina"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-serif text-base md:text-lg truncate">{t('chat.header.title')}</h3>
                <p className="text-xs text-white/80 truncate">{t('chat.header.subtitle')}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsChatOpen(false)
                setIsInputFocused(false)
              }}
              className="w-8 h-8 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center flex-shrink-0"
              aria-label={t('chat.aria.closeChat')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div 
            ref={messagesContainerRef} 
            className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-gray-50 to-white"
            style={{
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="space-y-4">
              {/* Welcome Message */}
              {messages.length === 0 && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center overflow-hidden p-0.5">
                    <Image
                      src="/logo.webp"
                      alt="Acquamarina"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 max-w-[80%]">
                    <p className="text-sm text-gray-700 leading-relaxed">{t('chat.welcome.greeting')}</p>
                    <p className="text-sm text-gray-700 leading-relaxed mt-2">
                      {t('chat.welcome.question')}
                    </p>
                  </div>
                </div>
              )}

              {/* Message History */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center overflow-hidden p-0.5">
                      <Image
                        src="/logo.webp"
                        alt="Acquamarina"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  )}
                  <div className="flex flex-col max-w-[80%]">
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-white rounded-tr-sm'
                          : 'bg-white border border-gray-100 rounded-tl-sm'
                      }`}
                    >
                      <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user' ? 'text-white' : 'text-gray-700'
                      }`}>
                        {msg.content}
                      </p>
                    </div>
                    <span className={`text-xs text-gray-400 mt-1 px-2 ${
                      msg.role === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center overflow-hidden p-0.5">
                    <Image
                      src="/logo.webp"
                      alt="Acquamarina"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex-shrink-0 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 bg-red-50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-red-100">
                    <p className="text-sm text-red-700 leading-relaxed">{error}</p>
                    <button
                      onClick={handleRetry}
                      className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* End of messages */}
            </div>
          </div>

          {/* Chat Input */}
          <div 
            className="border-t border-gray-100 p-3 md:p-4 bg-white flex-shrink-0"
            style={{
              paddingBottom: (isMobile || isTablet) && keyboardVisible ? '8px' : undefined
            }}
          >
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => {
                  setIsInputFocused(true)
                  setTimeout(() => {
                    if (messagesContainerRef.current) {
                      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
                    }
                  }, 100)
                }}
                onBlur={() => setIsInputFocused(false)}
                placeholder={t('chat.input.placeholder')}
                disabled={isLoading}
                className="flex-1 min-w-0 px-3 md:px-4 py-2.5 md:py-3 rounded-full border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontSize: '16px'
                }}
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex-shrink-0"
                aria-label={t('chat.aria.sendMessage')}
              >
                <Send className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
