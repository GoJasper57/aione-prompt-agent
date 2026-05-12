"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Send, Sparkles } from "lucide-react"

// Types
interface Message {
  id: string
  type: "user" | "ai-thinking" | "ai-observation" | "ai-insight"
  content: string
}

// Realistic AI thinking messages - progressive and thoughtful
const thinkingSequence: Message[] = [
  {
    id: "t1",
    type: "ai-thinking",
    content: "Parsing your creative intent..."
  },
  {
    id: "t2",
    type: "ai-observation",
    content: "I notice you're describing a mood-driven scene. The rain and city lights suggest an urban noir aesthetic, while the contemplative figure creates emotional depth."
  },
  {
    id: "t3",
    type: "ai-thinking",
    content: "Analyzing visual components..."
  },
  {
    id: "t4",
    type: "ai-observation",
    content: "Key elements detected: environmental atmosphere (rain, wet surfaces), lighting conditions (city reflections), subject positioning (standing figure), and emotional tone (contemplative)."
  },
  {
    id: "t5",
    type: "ai-thinking",
    content: "Mapping to visual language..."
  },
  {
    id: "t6",
    type: "ai-insight",
    content: "This prompt has strong cinematic potential. The interplay between harsh urban environment and human vulnerability creates natural tension. Several interpretive directions are possible."
  },
  {
    id: "t7",
    type: "ai-thinking",
    content: "Identifying ambiguities that need resolution..."
  },
  {
    id: "t8",
    type: "ai-observation",
    content: "To fully realize this vision, we should clarify: lighting intensity (subtle glow vs dramatic neon), camera perspective (intimate close-up vs environmental wide), and color temperature (cool cyan vs warm amber tones)."
  }
]

export default function AIWorkspace() {
  const [userInput, setUserInput] = useState("")
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentThinkingIndex, setCurrentThinkingIndex] = useState(0)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedContent, setStreamedContent] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamedContent])

  // Stream text character by character
  const streamText = useCallback((text: string, onComplete: () => void) => {
    setIsStreaming(true)
    setStreamedContent("")
    let index = 0
    
    const interval = setInterval(() => {
      if (index < text.length) {
        setStreamedContent(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        setIsStreaming(false)
        onComplete()
      }
    }, 18)
    
    return () => clearInterval(interval)
  }, [])

  // Progressive message reveal
  useEffect(() => {
    if (hasSubmitted && currentThinkingIndex < thinkingSequence.length) {
      const currentMessage = thinkingSequence[currentThinkingIndex]
      
      // For thinking messages, show briefly then move on
      if (currentMessage.type === "ai-thinking") {
        setMessages(prev => [...prev, currentMessage])
        const timer = setTimeout(() => {
          setCurrentThinkingIndex(prev => prev + 1)
        }, 1200)
        return () => clearTimeout(timer)
      }
      
      // For observations and insights, stream the text
      const cleanup = streamText(currentMessage.content, () => {
        setMessages(prev => [...prev, currentMessage])
        setStreamedContent("")
        
        const delay = currentMessage.type === "ai-insight" ? 2000 : 1500
        const timer = setTimeout(() => {
          setCurrentThinkingIndex(prev => prev + 1)
        }, delay)
        
        return () => clearTimeout(timer)
      })
      
      return cleanup
    }
  }, [hasSubmitted, currentThinkingIndex, streamText])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim() || hasSubmitted) return
    
    setMessages([{
      id: "user-1",
      type: "user",
      content: userInput.trim()
    }])
    setHasSubmitted(true)
    setCurrentThinkingIndex(0)
  }, [userInput, hasSubmitted])

  const currentThinkingMessage = hasSubmitted && currentThinkingIndex < thinkingSequence.length 
    ? thinkingSequence[currentThinkingIndex] 
    : null

  return (
    <div className="min-h-screen bg-background flex">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[100px]" />
      </div>

      {/* Left Panel - Conversation (40% width) */}
      <div className="w-[40%] min-w-[400px] max-w-[600px] h-screen flex flex-col border-r border-border/30 relative">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-border/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-medium text-foreground">AIONE Prompt Agent</h1>
              <p className="text-xs text-muted-foreground">Collaborative prompt exploration</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-8 py-6">
          {!hasSubmitted ? (
            /* Initial State - Centered prompt */
            <div className="h-full flex flex-col justify-center">
              <div className="space-y-4">
                <p className="text-muted-foreground/80 text-sm leading-relaxed">
                  Describe what you want to create. Be as vague or specific as you like.
                </p>
                <p className="text-muted-foreground/50 text-xs">
                  Try: &quot;A moody portrait of a person standing in rain, looking contemplative, with city lights reflecting off wet surfaces&quot;
                </p>
              </div>
            </div>
          ) : (
            /* Conversation Flow */
            <div className="space-y-6">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              
              {/* Currently streaming message */}
              {isStreaming && currentThinkingMessage && currentThinkingMessage.type !== "ai-thinking" && (
                <div className="flex items-start gap-3">
                  <MessageIndicator type={currentThinkingMessage.type} />
                  <div className={cn(
                    "flex-1 text-sm leading-relaxed",
                    currentThinkingMessage.type === "ai-observation" && "text-foreground/90",
                    currentThinkingMessage.type === "ai-insight" && "text-foreground"
                  )}>
                    {streamedContent}
                    <span className="inline-block w-0.5 h-4 bg-primary/60 ml-0.5 animate-blink" />
                  </div>
                </div>
              )}
              
              {/* Thinking indicator */}
              {currentThinkingMessage?.type === "ai-thinking" && (
                <div className="flex items-start gap-3 animate-fade-in">
                  <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground/70 italic">
                      {currentThinkingMessage.content}
                    </span>
                    <ThinkingDots />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-8 py-6 border-t border-border/20">
          <form onSubmit={handleSubmit}>
            <div className={cn(
              "relative rounded-2xl transition-all duration-300",
              "bg-muted/30 border border-border/40",
              "focus-within:border-primary/30 focus-within:bg-muted/40",
              hasSubmitted && "opacity-50 pointer-events-none"
            )}>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                placeholder="Describe your creative vision..."
                disabled={hasSubmitted}
                rows={3}
                className="w-full bg-transparent px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none"
              />
              <div className="absolute bottom-3 right-3">
                <button
                  type="submit"
                  disabled={!userInput.trim() || hasSubmitted}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                    userInput.trim() && !hasSubmitted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground/30"
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
          
          {hasSubmitted && (
            <p className="mt-3 text-xs text-muted-foreground/50 text-center">
              AI is analyzing your intent...
            </p>
          )}
        </div>
      </div>

      {/* Right Panel - Empty placeholder for future workspace */}
      <div className="flex-1 h-screen flex items-center justify-center">
        <div className="text-center space-y-3 max-w-xs">
          <div className="w-12 h-12 rounded-2xl bg-muted/30 mx-auto flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
          </div>
          <p className="text-sm text-muted-foreground/40">
            Exploration workspace will appear here
          </p>
          <p className="text-xs text-muted-foreground/25">
            Start by describing what you want to create
          </p>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  if (message.type === "user") {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[90%] bg-primary/10 border border-primary/20 rounded-2xl rounded-br-md px-5 py-3">
          <p className="text-sm text-foreground leading-relaxed">{message.content}</p>
        </div>
      </div>
    )
  }

  if (message.type === "ai-thinking") {
    return (
      <div className="flex items-start gap-3 animate-fade-in opacity-60">
        <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
        </div>
        <span className="text-sm text-muted-foreground/60 italic">{message.content}</span>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <MessageIndicator type={message.type} />
      <div className={cn(
        "flex-1 text-sm leading-relaxed",
        message.type === "ai-observation" && "text-foreground/90",
        message.type === "ai-insight" && "text-foreground"
      )}>
        {message.content}
      </div>
    </div>
  )
}

function MessageIndicator({ type }: { type: string }) {
  return (
    <div className={cn(
      "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
      type === "ai-observation" && "bg-chart-3/15",
      type === "ai-insight" && "bg-chart-4/15"
    )}>
      <div className={cn(
        "w-2 h-2 rounded-full",
        type === "ai-observation" && "bg-chart-3/70",
        type === "ai-insight" && "bg-chart-4/70"
      )} />
    </div>
  )
}

function ThinkingDots() {
  return (
    <span className="flex gap-1">
      <span className="w-1 h-1 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '0ms' }} />
      <span className="w-1 h-1 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '150ms' }} />
      <span className="w-1 h-1 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '300ms' }} />
    </span>
  )
}
