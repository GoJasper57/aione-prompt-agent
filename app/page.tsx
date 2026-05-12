"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Send, Sparkles, ChevronDown, Check, Lightbulb, Palette, Camera, Eye } from "lucide-react"

// Types
interface Message {
  id: string
  type: "user" | "ai-thinking" | "ai-observation" | "ai-insight"
  content: string
}

interface MissingDimension {
  id: string
  label: string
  icon: React.ReactNode
  options: string[]
  selectedOption?: string
}

interface Direction {
  id: string
  title: string
  description: string
  moodTags: string[]
  confidence: number
}

// Realistic AI thinking messages
const thinkingSequence: Message[] = [
  { id: "t1", type: "ai-thinking", content: "Parsing your creative intent..." },
  { id: "t2", type: "ai-observation", content: "I notice you're describing a mood-driven scene. The rain and city lights suggest an urban noir aesthetic, while the contemplative figure creates emotional depth." },
  { id: "t3", type: "ai-thinking", content: "Analyzing visual components..." },
  { id: "t4", type: "ai-observation", content: "Key elements detected: environmental atmosphere (rain, wet surfaces), lighting conditions (city reflections), subject positioning (standing figure), and emotional tone (contemplative)." },
  { id: "t5", type: "ai-thinking", content: "Mapping to visual language..." },
  { id: "t6", type: "ai-insight", content: "This prompt has strong cinematic potential. The interplay between harsh urban environment and human vulnerability creates natural tension." },
  { id: "t7", type: "ai-thinking", content: "Identifying dimensions that need refinement..." },
]

// Detected analysis data
const detectedThemes = ["Urban Noir", "Emotional Isolation", "Rain Atmosphere", "Neon Reflections"]
const emotionalSignals = ["Melancholy", "Contemplation", "Solitude", "Quiet Tension"]

const initialDimensions: MissingDimension[] = [
  { id: "lighting", label: "Lighting Intensity", icon: <Lightbulb className="w-4 h-4" />, options: ["Subtle ambient glow", "Dramatic neon contrast", "Soft diffused light", "Harsh street lighting"] },
  { id: "palette", label: "Color Temperature", icon: <Palette className="w-4 h-4" />, options: ["Cool cyan tones", "Warm amber highlights", "Muted desaturated", "High contrast complementary"] },
  { id: "perspective", label: "Camera Perspective", icon: <Camera className="w-4 h-4" />, options: ["Intimate close-up", "Environmental wide", "Low angle dramatic", "Eye-level neutral"] },
  { id: "focus", label: "Subject Focus", icon: <Eye className="w-4 h-4" />, options: ["Sharp foreground blur", "Soft overall focus", "Deep depth of field", "Selective bokeh"] },
]

const directions: Direction[] = [
  { id: "d1", title: "Blade Runner Homage", description: "Heavy neon saturation with cyan and magenta reflections. Subject as silhouette against luminous city backdrop, emphasizing scale and alienation.", moodTags: ["cyberpunk", "dystopian", "neon"], confidence: 0.92 },
  { id: "d2", title: "Wong Kar-wai Romance", description: "Intimate framing with motion blur and warm tungsten lighting bleeding through rain. Focus on emotional vulnerability and fleeting moments.", moodTags: ["intimate", "dreamy", "warm"], confidence: 0.87 },
  { id: "d3", title: "Contemporary Realism", description: "Naturalistic lighting with muted color palette. Documentary-style framing that grounds the scene in authentic urban atmosphere.", moodTags: ["authentic", "grounded", "subtle"], confidence: 0.78 },
]

export default function AIWorkspace() {
  const [userInput, setUserInput] = useState("")
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentThinkingIndex, setCurrentThinkingIndex] = useState(0)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedContent, setStreamedContent] = useState("")
  const [showExploration, setShowExploration] = useState(false)
  const [explorationPhase, setExplorationPhase] = useState(0) // 0: none, 1: themes, 2: dimensions, 3: directions
  const [dimensions, setDimensions] = useState<MissingDimension[]>(initialDimensions)
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null)
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null)
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
      
      if (currentMessage.type === "ai-thinking") {
        setMessages(prev => [...prev, currentMessage])
        const timer = setTimeout(() => {
          setCurrentThinkingIndex(prev => prev + 1)
        }, 1200)
        return () => clearTimeout(timer)
      }
      
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
    
    // Trigger exploration workspace after messages complete
    if (hasSubmitted && currentThinkingIndex >= thinkingSequence.length && !showExploration) {
      const timer = setTimeout(() => {
        setShowExploration(true)
        // Progressive reveal of exploration sections
        setTimeout(() => setExplorationPhase(1), 300)
        setTimeout(() => setExplorationPhase(2), 800)
        setTimeout(() => setExplorationPhase(3), 1400)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [hasSubmitted, currentThinkingIndex, streamText, showExploration])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim() || hasSubmitted) return
    
    setMessages([{ id: "user-1", type: "user", content: userInput.trim() }])
    setHasSubmitted(true)
    setCurrentThinkingIndex(0)
  }, [userInput, hasSubmitted])

  const handleDimensionSelect = (dimensionId: string, option: string) => {
    setDimensions(prev => prev.map(d => 
      d.id === dimensionId ? { ...d, selectedOption: option } : d
    ))
    setExpandedDimension(null)
  }

  const currentThinkingMessage = hasSubmitted && currentThinkingIndex < thinkingSequence.length 
    ? thinkingSequence[currentThinkingIndex] 
    : null

  const analysisComplete = currentThinkingIndex >= thinkingSequence.length

  return (
    <div className="min-h-screen bg-background flex">
      {/* Subtle background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/[0.02] rounded-full blur-[120px]" />
        {showExploration && (
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-chart-3/[0.02] rounded-full blur-[100px] animate-fade-in" />
        )}
      </div>

      {/* Left Panel - Conversation (40% width) */}
      <div 
        className={cn(
          "h-screen flex flex-col border-r border-border/30 relative transition-all duration-700 ease-out",
          showExploration ? "w-[40%] min-w-[380px] max-w-[480px]" : "w-[40%] min-w-[400px] max-w-[600px]"
        )}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-medium text-foreground">AIONE Prompt Agent</h1>
              <p className="text-xs text-muted-foreground">Collaborative exploration</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-5">
          {!hasSubmitted ? (
            <div className="h-full flex flex-col justify-center">
              <div className="space-y-4">
                <p className="text-muted-foreground/80 text-sm leading-relaxed">
                  Describe what you want to create. Be as vague or specific as you like.
                </p>
                <p className="text-muted-foreground/50 text-xs">
                  Try: &quot;A moody portrait in rain, city lights, contemplative figure&quot;
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              
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
              
              {currentThinkingMessage?.type === "ai-thinking" && (
                <div className="flex items-start gap-3 animate-fade-in">
                  <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground/70 italic">
                      {currentThinkingMessage.content}
                    </span>
                    <ThinkingDots />
                  </div>
                </div>
              )}
              
              {analysisComplete && (
                <div className="flex items-start gap-3 animate-fade-in pt-2">
                  <div className="w-5 h-5 rounded-full bg-chart-4/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-chart-4" />
                  </div>
                  <span className="text-sm text-chart-4/80">
                    Analysis complete. Explore directions to the right.
                  </span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-6 py-5 border-t border-border/20">
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
                className="w-full bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none"
              />
              <div className="absolute bottom-2.5 right-2.5">
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
        </div>
      </div>

      {/* Center Panel - Exploration Workspace */}
      <div 
        className={cn(
          "flex-1 h-screen overflow-y-auto scrollbar-hide transition-all duration-700",
          showExploration ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="p-8 max-w-2xl mx-auto space-y-8">
          
          {/* Section Header */}
          <div 
            className={cn(
              "transition-all duration-500",
              explorationPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <h2 className="text-lg font-medium text-foreground mb-1">Exploration Workspace</h2>
            <p className="text-sm text-muted-foreground">Refine dimensions and choose a creative direction</p>
          </div>

          {/* Detected Themes */}
          <div 
            className={cn(
              "space-y-3 transition-all duration-500",
              explorationPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: "100ms" }}
          >
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Detected Themes
            </h3>
            <div className="flex flex-wrap gap-2">
              {detectedThemes.map((theme, index) => (
                <span
                  key={theme}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 transition-all duration-300",
                    explorationPhase >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  )}
                  style={{ transitionDelay: `${200 + index * 80}ms` }}
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>

          {/* Emotional Signals */}
          <div 
            className={cn(
              "space-y-3 transition-all duration-500",
              explorationPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: "300ms" }}
          >
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Emotional Signals
            </h3>
            <div className="flex flex-wrap gap-2">
              {emotionalSignals.map((signal, index) => (
                <span
                  key={signal}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs bg-chart-5/10 text-chart-5 border border-chart-5/20 transition-all duration-300",
                    explorationPhase >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  )}
                  style={{ transitionDelay: `${500 + index * 80}ms` }}
                >
                  {signal}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Dimensions */}
          <div 
            className={cn(
              "space-y-3 transition-all duration-500",
              explorationPhase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: "100ms" }}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Refine Dimensions
              </h3>
              <Sparkles className="w-3 h-3 text-primary animate-pulse" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {dimensions.map((dimension, index) => (
                <div 
                  key={dimension.id}
                  className={cn(
                    "transition-all duration-300",
                    explorationPhase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  )}
                  style={{ transitionDelay: `${200 + index * 100}ms` }}
                >
                  <button
                    onClick={() => setExpandedDimension(expandedDimension === dimension.id ? null : dimension.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all",
                      "border",
                      dimension.selectedOption
                        ? "bg-primary/10 border-primary/30 text-foreground"
                        : "bg-muted/30 border-border/50 text-muted-foreground hover:border-primary/30 hover:bg-muted/40 hover:text-foreground"
                    )}
                  >
                    <span className={cn(
                      "transition-colors",
                      dimension.selectedOption ? "text-primary" : "text-muted-foreground"
                    )}>
                      {dimension.icon}
                    </span>
                    <span className="flex-1 text-left">
                      {dimension.selectedOption || dimension.label}
                    </span>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform",
                      expandedDimension === dimension.id && "rotate-180"
                    )} />
                  </button>
                  
                  {expandedDimension === dimension.id && (
                    <div className="mt-2 p-2 rounded-xl bg-muted/20 border border-border/30 animate-expand">
                      <div className="space-y-1">
                        {dimension.options.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleDimensionSelect(dimension.id, option)}
                            className={cn(
                              "w-full px-3 py-2 rounded-lg text-xs text-left transition-all",
                              "hover:bg-primary/10 hover:text-primary",
                              dimension.selectedOption === option
                                ? "bg-primary/15 text-primary"
                                : "text-muted-foreground"
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Direction Cards */}
          <div 
            className={cn(
              "space-y-4 transition-all duration-500",
              explorationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: "100ms" }}
          >
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Creative Directions
            </h3>
            
            <div className="space-y-3">
              {directions.map((direction, index) => {
                const isSelected = selectedDirection === direction.id
                const isDimmed = selectedDirection && !isSelected

                return (
                  <button
                    key={direction.id}
                    onClick={() => setSelectedDirection(isSelected ? null : direction.id)}
                    className={cn(
                      "w-full text-left rounded-2xl p-5 transition-all duration-500",
                      "border",
                      explorationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
                      isSelected && "bg-gradient-to-br from-primary/15 to-primary/5 border-primary/40 scale-[1.01] shadow-lg shadow-primary/5",
                      isDimmed && "opacity-40 scale-[0.98]",
                      !isSelected && !isDimmed && "bg-muted/20 border-border/40 hover:bg-muted/40 hover:border-border/60"
                    )}
                    style={{ transitionDelay: `${200 + index * 120}ms` }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className={cn(
                            "font-medium transition-colors",
                            isSelected ? "text-primary" : "text-foreground"
                          )}>
                            {direction.title}
                          </h4>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1 rounded-full bg-muted/50 overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all",
                                isSelected ? "bg-primary" : "bg-muted-foreground/30"
                              )}
                              style={{ width: `${direction.confidence * 100}%` }}
                            />
                          </div>
                          <span className={cn(
                            "text-[10px] tabular-nums",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )}>
                            {Math.round(direction.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      <p className={cn(
                        "text-sm leading-relaxed transition-colors",
                        isSelected ? "text-foreground/80" : "text-muted-foreground"
                      )}>
                        {direction.description}
                      </p>
                      
                      <div className="flex gap-1.5">
                        {direction.moodTags.map((tag) => (
                          <span
                            key={tag}
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] uppercase tracking-wider transition-colors",
                              isSelected
                                ? "bg-primary/20 text-primary"
                                : "bg-muted/50 text-muted-foreground"
                            )}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  if (message.type === "user") {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[90%] bg-primary/10 border border-primary/20 rounded-2xl rounded-br-md px-4 py-2.5">
          <p className="text-sm text-foreground leading-relaxed">{message.content}</p>
        </div>
      </div>
    )
  }

  if (message.type === "ai-thinking") {
    return (
      <div className="flex items-start gap-3 animate-fade-in opacity-50">
        <div className="w-5 h-5 rounded-full bg-muted/50 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
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
      "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
      type === "ai-observation" && "bg-chart-3/15",
      type === "ai-insight" && "bg-chart-4/15"
    )}>
      <div className={cn(
        "w-1.5 h-1.5 rounded-full",
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
