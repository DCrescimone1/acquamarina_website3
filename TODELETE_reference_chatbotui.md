'use client';

import React, { useState, useRef, useEffect } from "react"; 
import { CanvasRevealEffect } from "@/components/ui/canvas-effect";
import { DIcons } from "dicons";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguageContext } from "@/app/LanguageContext";
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

type WelcomeMessages = {
  it: string;
  en: string;
  default: string;
};

const welcomeMessages: WelcomeMessages = {
  it: "Ciao! Sono l'assistente virtuale di MarzaGem. Come posso aiutarti oggi?",
  en: "Hi! I'm the MarzaGem virtual assistant. How can I help you today?",
  default: "Ciao! Sono l'assistente virtuale di MarzaGem. Come posso aiutarti oggi?"
};

const getWelcomeMessage = (language: string): string => {
  return (welcomeMessages as Record<string, string>)[language] || welcomeMessages.default;
};

export function Chatbot() {
  const { language } = useLanguageContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 640 && window.innerWidth < 1024;
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE;
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  // Handle keyboard visibility
  useEffect(() => {
    if (!isMobile && !isTablet) return;

    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const visualViewport = window.visualViewport?.height || windowHeight;
      setKeyboardVisible(visualViewport < windowHeight);
    };

    const handleOrientationChange = () => {
      // Adjust UI after orientation change
      setTimeout(() => {
        adjustHeight();
        scrollToBottom();
      }, 300);
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isMobile, isTablet]);

  // Adjust chat container height when keyboard appears
  useEffect(() => {
    if ((!isMobile && !isTablet) || !chatContainerRef.current) return;

    adjustHeight();
  }, [keyboardVisible, isMobile, isTablet]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: getWelcomeMessage(language),
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      
      // Focus input when chat opens on mobile
      if (isMobile || isTablet) {
        focusInput();
      }
    }
  }, [isOpen, language, isMobile, isTablet]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Enhanced scrollToBottom for mobile
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      setTimeout(() => {
        scrollAreaRef.current!.scrollTop = scrollAreaRef.current!.scrollHeight;
      }, isMobile ? 150 : 50); // Longer timeout for mobile
    }
  };

  // Add useEffect to ensure scroll on message changes specifically for mobile
  useEffect(() => {
    if (isMobile && messages.length > 0) {
      scrollToBottom();
      // Additional scroll attempt after rendering completes
      setTimeout(scrollToBottom, 300);
    }
  }, [messages, isMobile]);

  const focusInput = () => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    // Keep only the last 10 messages to prevent infinite growth
    const updatedMessages = [...messages, userMessage].slice(-10);
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);
    
    // Immediately scroll to bottom when user sends a message
    setTimeout(scrollToBottom, isMobile ? 100 : 50);
    if (isMobile) {
      // Additional scroll attempts for mobile
      setTimeout(scrollToBottom, 300);
    }
    
    // Focus the input for better mobile UX
    if (isMobile || isTablet) {
      focusInput();
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          language
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
      };

      // Keep only the last 10 messages to prevent infinite growth
      setMessages(prev => [...prev, assistantMessage].slice(-10));
      
      // Enhanced scrolling when bot responds on mobile
      if (isMobile) {
        setTimeout(scrollToBottom, 100);
        setTimeout(scrollToBottom, 300);
        setTimeout(scrollToBottom, 500); // Extra delay for complex messages with links
      }
    } catch (error) {
      console.error('Chat error:', error);
      const baseMessage = language === 'en'
        ? "I'm sorry, I'm having trouble connecting. Please try again later."
        : "Mi dispiace, ho problemi di connessione. Per favore riprova più tardi.";

      const contactSuffix = (() => {
        const hasPhone = !!contactPhone;
        const hasEmail = !!contactEmail;
        if (!hasPhone && !hasEmail) return '';
        if (language === 'en') {
          if (hasPhone && hasEmail) return ` Alternatively, contact me at ${contactPhone} or ${contactEmail}.`;
          if (hasPhone) return ` Alternatively, contact me at ${contactPhone}.`;
          return ` Alternatively, contact me at ${contactEmail}.`;
        } else {
          if (hasPhone && hasEmail) return ` In alternativa, contattami al ${contactPhone} o a ${contactEmail}.`;
          if (hasPhone) return ` In alternativa, contattami al ${contactPhone}.`;
          return ` In alternativa, contattami a ${contactEmail}.`;
        }
      })();

      const errorMessage = `${baseMessage}${contactSuffix}`;
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        role: 'assistant',
        timestamp: new Date(),
      }]);
      
      // Also scroll on error message
      if (isMobile) {
        setTimeout(scrollToBottom, 100);
      }
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, isMobile ? 100 : 50);
    }
  };

  const handleNewChat = () => {
    setMessages([{
      id: 'welcome',
      content: getWelcomeMessage(language),
      role: 'assistant',
      timestamp: new Date(),
    }]);
    setInputValue('');
  };

  // Improved adjustHeight for better mobile keyboard handling
  const adjustHeight = () => {
    if (!chatContainerRef.current) return;
    
    if (keyboardVisible) {
      // When keyboard is visible, adjust based on viewport
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      if (isMobile) {
        // Improved mobile proportion with keyboard
        const maxHeight = Math.min(viewportHeight * 0.65, 450); 
        chatContainerRef.current.style.height = `${maxHeight}px`;
        chatContainerRef.current.style.minHeight = '280px'; // Ensure minimum usable height
        setTimeout(scrollToBottom, 200); // Ensure scroll after resize
      } else if (isTablet) {
        const maxHeight = Math.min(viewportHeight * 0.7, 500);
        chatContainerRef.current.style.height = `${maxHeight}px`;
        setTimeout(scrollToBottom, 100);
      }
    } else {
      // When keyboard is not visible
      const maxHeight = isMobile ? '50vh' : '60vh';
      chatContainerRef.current.style.height = maxHeight;
      chatContainerRef.current.style.maxHeight = isMobile ? '600px' : '650px';
      chatContainerRef.current.style.minHeight = isMobile ? '350px' : '400px';
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <>
      {/* Chat Trigger Button */}
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "fixed rounded-full shadow-lg bg-gradient-to-b from-blue-500/90 to-blue-600/90 hover:from-blue-600/90 hover:to-blue-700/90 text-white z-[9999] backdrop-blur-md border border-blue-400/50",
          isMobile
            ? "bottom-[100px] right-6 h-12 w-12"
            : isTablet
              ? "bottom-[100px] right-10 h-14 w-14" 
              : "bottom-6 right-6 h-14 w-14"
        )}
      >
        <DIcons.Message02 className={cn(
          isMobile ? "h-5 w-5" : "h-6 w-6"
        )} />
      </Button>

      {/* Chat Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed z-[99999]",
              isMobile 
                ? "bottom-[120px] right-3 w-[90%]" 
                : isTablet
                  ? "bottom-[120px] right-10 w-[450px]" 
                  : "right-6 bottom-[100px] w-[400px]",
            )}
            ref={chatContainerRef}
            style={{
              isolation: 'isolate',
              height: (isMobile || isTablet) ? (keyboardVisible 
                ? `${Math.min((window.visualViewport?.height || window.innerHeight) * 0.6, 500)}px` 
                : isMobile ? '50vh' : '60vh') 
              : '600px', // fixed height for desktop
              maxHeight: (isMobile || isTablet) ? (isMobile ? '600px' : '650px') : '600px',
              minHeight: (isMobile || isTablet) ? (isMobile ? '350px' : '400px') : '500px',
            }}
          >
            <div
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              className={cn(
                "relative w-full h-full backdrop-blur-2xl flex flex-col",
                isMobile || isTablet
                  ? "rounded-xl bg-gradient-to-b from-white/40 to-white/20 border border-white/50 shadow-[0_-8px_16px_-6px_rgba(200,240,255,0.1)]" 
                  : "rounded-lg shadow-xl border border-white/50 bg-white/30"
              )}
            >
              <div className="relative flex w-full h-full flex-col">
                <AnimatePresence>
                  {hovered && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 h-full w-full"
                    >
                      <CanvasRevealEffect
                        animationSpeed={5}
                        containerClassName="bg-transparent opacity-30 dark:opacity-50"
                        colors={[
                          [225, 204, 165], // Light sand color
                          [194, 178, 128], // Sandy beige color
                        ]}
                        opacities={[1, 0.8, 1, 0.8, 0.5, 0.8, 1, 0.5, 1, 3]}
                        dotSize={2}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="z-20 w-full flex flex-col h-full">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="relative flex h-full w-full justify-center text-center">
                        <h1 className="flex select-none py-2 text-center text-xl font-extrabold leading-none tracking-tight">
                          <span className="from-gradient-1-start to-gradient-1-end bg-gradient-to-r bg-clip-text text-transparent">
                            AI Chat Assistant
                          </span>
                        </h1>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(false)}
                        className="h-8 w-8 text-gray-500 hover:text-gray-700"
                      >
                        <DIcons.Close className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="text-center text-sm text-gray-500">
                      How can I help you today?
                    </p>
                  </div>

                  <ScrollArea 
                    className="flex-1 px-4 overflow-y-auto max-h-[calc(100%-120px)]"
                    ref={scrollAreaRef}
                    onScroll={isMobile ? () => {
                      // Force scroll to bottom on mobile when loading new messages
                      if (isLoading) {
                        scrollAreaRef.current!.scrollTop = scrollAreaRef.current!.scrollHeight;
                      }
                    } : undefined}
                    style={{
                      height: 'calc(100% - 120px)',
                      flexGrow: 1,
                      display: 'flex', 
                      flexDirection: 'column'
                    }}
                  >
                    <div className="space-y-4 py-4 flex-1 overflow-y-auto">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex w-full",
                            message.role === "user" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-2 max-w-[80%] shadow-sm backdrop-blur-md",
                              message.role === "user"
                                ? "bg-blue-500/90 text-white border border-blue-400/30"
                                : "bg-white/40 text-gray-900 border border-white/50"
                            )}
                          >
                            <div className="text-sm leading-relaxed">
                              <ReactMarkdown
                                components={{
                                  a: ({ node, ...props }) => (
                                    <a 
                                      {...props} 
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={message.role === "user" ? "text-white underline" : "text-blue-600 underline"}
                                    />
                                  )
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-2xl px-4 py-2 shadow-sm">
                            <div className="flex space-x-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <div className={cn(
                    "relative px-4 py-3 border-t border-white/30 bg-white/10 backdrop-blur-xl",
                    (isMobile || isTablet) && keyboardVisible ? "pb-2" : "pb-safe"
                  )}>
                    <form onSubmit={handleSubmit}>
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your message..."
                        className="pl-4 pr-12 rounded-full border-white/40 bg-white/30 backdrop-blur-md focus:border-blue-400 focus:ring-blue-400"
                        disabled={isLoading}
                        ref={inputRef}
                        onFocus={() => setTimeout(scrollToBottom, 100)}
                      />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="absolute right-6 top-4 h-8 w-8 text-gray-400 hover:text-gray-600"
                        disabled={isLoading || !inputValue.trim()}
                      >
                        <DIcons.Send className="h-5 w-5" />
                        <span className="sr-only">Send message</span>
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}