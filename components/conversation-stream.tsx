"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  type: "user" | "ai-thinking" | "ai-observation" | "ai-question"
  content: string
  isStreaming?: boolean
}

interface ConversationStreamProps {
  messages: Message[]
  isThinking: boolean
  onSendMessage?: (message: string) => void
}

export function ConversationStream({ messages, isThinking, onSendMessage }: ConversationStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim())
      setInputValue("")
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pr-2"
      >
        {messages.map((message, index) => (
          <MessageBubble 
            key={message.id} 
            message={message}
            delay={index * 0.1}
          />
        ))}
        
        {isThinking && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <span className="opacity-60">Thinking</span>
              <span className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-border/30">
        <div className="relative focus-glow rounded-xl transition-all">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add more context or ask a question..."
            className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
      </form>
    </div>
  )
}

function MessageBubble({ message, delay }: { message: Message; delay: number }) {
  const [displayedContent, setDisplayedContent] = useState(message.isStreaming ? "" : message.content)

  useEffect(() => {
    if (message.isStreaming && message.content) {
      let index = 0
      const interval = setInterval(() => {
        if (index < message.content.length) {
          setDisplayedContent(message.content.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
        }
      }, 20)
      return () => clearInterval(interval)
    } else {
      setDisplayedContent(message.content)
    }
  }, [message.content, message.isStreaming])

  const isUser = message.type === "user"
  const isQuestion = message.type === "ai-question"

  return (
    <div 
      className={cn(
        "flex items-start gap-3 animate-fade-in opacity-0",
        isUser && "flex-row-reverse"
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      {!isUser && (
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
          message.type === "ai-thinking" && "bg-primary/20",
          message.type === "ai-observation" && "bg-chart-3/20",
          message.type === "ai-question" && "bg-chart-4/20"
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full",
            message.type === "ai-thinking" && "bg-primary",
            message.type === "ai-observation" && "bg-chart-3",
            message.type === "ai-question" && "bg-chart-4"
          )} />
        </div>
      )}
      
      <div className={cn(
        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
        isUser && "bg-primary/15 text-foreground ml-auto",
        message.type === "ai-thinking" && "bg-muted/50 text-muted-foreground italic",
        message.type === "ai-observation" && "bg-muted/30 text-foreground",
        isQuestion && "bg-chart-4/10 text-foreground border border-chart-4/20"
      )}>
        {displayedContent}
        {message.isStreaming && displayedContent.length < message.content.length && (
          <span className="animate-blink text-primary">|</span>
        )}
      </div>
    </div>
  )
}
