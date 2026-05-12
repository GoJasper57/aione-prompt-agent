"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Send, Sparkles, ChevronDown, Check, Lightbulb, Palette, Camera, Eye, Copy, ArrowLeft, Clock } from "lucide-react"

// Types
interface Message {
  id: string
  type: "user" | "ai-insight" | "ai-transition"
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
  alignmentLabel: string
  previewGradient: string
  previewAccent: string
  promptTemplate: string
}

interface PromptFragment {
  id: string
  text: string
  isEditable: boolean
  alternatives?: string[]
}

interface PromptVersion {
  id: string
  label: string
  fragments: PromptFragment[]
  timestamp: string
}

// Shortened AI messages - only 2 before exploration
const thinkingSequence: Message[] = [
  { id: "t1", type: "ai-insight", content: "I'm detecting a cinematic urban mood with emotional isolation themes." },
  { id: "t2", type: "ai-transition", content: "Several visual directions are emerging." },
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

// Directions with visual previews and semantic alignment labels
const directions: Direction[] = [
  { 
    id: "d1", 
    title: "Blade Runner Homage", 
    description: "Heavy neon saturation with cyan and magenta reflections. Subject as silhouette against luminous city backdrop.", 
    alignmentLabel: "Strong alignment",
    previewGradient: "from-cyan-500/30 via-fuchsia-500/20 to-blue-900/40",
    previewAccent: "cyan",
    promptTemplate: "A lone figure stands in heavy rain on a [neon-lit] city street at night. Blade Runner aesthetic with [heavy cyan and magenta] neon reflections on wet pavement. Subject rendered as a [dark silhouette] against the luminous urban backdrop. [Cinematic composition] emphasizing human scale against towering architecture. Atmospheric fog diffusing the countless neon signs. Photorealistic, dramatic lighting."
  },
  { 
    id: "d2", 
    title: "Wong Kar-wai Romance", 
    description: "Intimate framing with motion blur and warm tungsten lighting bleeding through rain.", 
    alignmentLabel: "Emotionally grounded",
    previewGradient: "from-amber-500/30 via-orange-400/20 to-rose-900/30",
    previewAccent: "amber",
    promptTemplate: "Intimate portrait of a contemplative figure in [gentle rain], city lights [softly blurred] in background. Wong Kar-wai inspired cinematography with [warm tungsten tones] bleeding through cool blue atmosphere. Subtle motion blur suggesting fleeting moments. [Shallow depth of field] focusing on emotional expression. Film grain texture, melancholic beauty."
  },
  { 
    id: "d3", 
    title: "Contemporary Realism", 
    description: "Naturalistic lighting with muted color palette. Documentary-style framing.", 
    alignmentLabel: "Experimental direction",
    previewGradient: "from-slate-500/30 via-zinc-400/20 to-neutral-800/40",
    previewAccent: "slate",
    promptTemplate: "Documentary-style photograph of a person standing alone in [urban rain]. [Natural city lighting] with muted, desaturated color palette. Authentic street photography composition, [unposed and candid] feeling. Overcast ambient lighting with subtle reflections on wet concrete. Contemporary realism, editorial quality."
  },
]

// Parse prompt template into fragments
function parsePromptToFragments(template: string): PromptFragment[] {
  const fragments: PromptFragment[] = []
  const regex = /\[([^\]]+)\]/g
  let lastIndex = 0
  let match
  let id = 0

  while ((match = regex.exec(template)) !== null) {
    // Add text before the bracket
    if (match.index > lastIndex) {
      fragments.push({
        id: `f${id++}`,
        text: template.slice(lastIndex, match.index),
        isEditable: false
      })
    }
    
    // Add the editable fragment
    fragments.push({
      id: `f${id++}`,
      text: match[1],
      isEditable: true,
      alternatives: getAlternativesForFragment(match[1])
    })
    
    lastIndex = match.index + match[0].length
  }
  
  // Add remaining text
  if (lastIndex < template.length) {
    fragments.push({
      id: `f${id++}`,
      text: template.slice(lastIndex),
      isEditable: false
    })
  }
  
  return fragments
}

// Get semantic alternatives for editable fragments
function getAlternativesForFragment(text: string): string[] {
  const alternativesMap: Record<string, string[]> = {
    "neon-lit": ["soft tungsten glow", "overcast realism", "cinematic haze", "harsh noir contrast"],
    "heavy cyan and magenta": ["muted teal tones", "warm amber wash", "cold blue monochrome", "desaturated pastels"],
    "dark silhouette": ["softly lit figure", "partial shadow", "backlit outline", "detailed presence"],
    "Cinematic composition": ["Documentary framing", "Intimate portrait", "Wide establishing shot", "Abstract crop"],
    "gentle rain": ["heavy downpour", "misty drizzle", "scattered droplets", "storm aftermath"],
    "softly blurred": ["sharply focused", "motion streaked", "dreamlike haze", "crisp detail"],
    "warm tungsten tones": ["cool blue cast", "neutral daylight", "golden hour warmth", "neon color splash"],
    "Shallow depth of field": ["Deep focus throughout", "Selective bokeh", "Tilt-shift effect", "Sharp foreground blur"],
    "urban rain": ["city drizzle", "night storm", "wet aftermath", "passing shower"],
    "Natural city lighting": ["Dramatic neon glow", "Soft ambient light", "Harsh streetlamp", "Diffused overcast"],
    "unposed and candid": ["carefully composed", "dynamically posed", "frozen in motion", "contemplatively still"],
  }
  
  return alternativesMap[text] || ["subtle variation", "dramatic interpretation", "minimal approach", "bold alternative"]
}

export default function AIWorkspace() {
  const [userInput, setUserInput] = useState("")
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentThinkingIndex, setCurrentThinkingIndex] = useState(0)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedContent, setStreamedContent] = useState("")
  const [showExploration, setShowExploration] = useState(false)
  const [explorationPhase, setExplorationPhase] = useState(0)
  const [dimensions, setDimensions] = useState<MissingDimension[]>(initialDimensions)
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null)
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null)
  const [showPromptWorkspace, setShowPromptWorkspace] = useState(false)
  const [promptPhase, setPromptPhase] = useState(0)
  const [promptVersions, setPromptVersions] = useState<PromptVersion[]>([])
  const [activeVersion, setActiveVersion] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [hoveredFragment, setHoveredFragment] = useState<string | null>(null)
  const [expandedFragment, setExpandedFragment] = useState<string | null>(null)
  const [recentlyChanged, setRecentlyChanged] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamedContent])

  // Get current prompt fragments
  const getCurrentFragments = useCallback((): PromptFragment[] => {
    if (activeVersion && promptVersions.length > 0) {
      const version = promptVersions.find(v => v.id === activeVersion)
      if (version) return version.fragments
    }
    const direction = directions.find(d => d.id === selectedDirection)
    if (direction) return parsePromptToFragments(direction.promptTemplate)
    return []
  }, [selectedDirection, activeVersion, promptVersions])

  // Get prompt as string
  const getPromptString = useCallback(() => {
    return getCurrentFragments().map(f => f.text).join('')
  }, [getCurrentFragments])

  // Initialize prompt versions when direction is selected
  useEffect(() => {
    if (selectedDirection && promptVersions.length === 0) {
      const direction = directions.find(d => d.id === selectedDirection)
      if (direction) {
        const fragments = parsePromptToFragments(direction.promptTemplate)
        setPromptVersions([
          {
            id: "v1",
            label: `Initial ${direction.title.toLowerCase()} interpretation`,
            fragments,
            timestamp: "Just now"
          }
        ])
        setActiveVersion("v1")
      }
    }
  }, [selectedDirection, promptVersions.length])

  // Trigger prompt workspace when direction is selected
  useEffect(() => {
    if (selectedDirection && !showPromptWorkspace) {
      const timer = setTimeout(() => {
        setShowPromptWorkspace(true)
        setTimeout(() => setPromptPhase(1), 200)
        setTimeout(() => setPromptPhase(2), 600)
      }, 300)
      return () => clearTimeout(timer)
    }
    if (!selectedDirection) {
      setShowPromptWorkspace(false)
      setPromptPhase(0)
    }
  }, [selectedDirection, showPromptWorkspace])

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
    }, 25)
    
    return () => clearInterval(interval)
  }, [])

  // Progressive message reveal - now much faster
  useEffect(() => {
    if (hasSubmitted && currentThinkingIndex < thinkingSequence.length) {
      const currentMessage = thinkingSequence[currentThinkingIndex]
      
      const cleanup = streamText(currentMessage.content, () => {
        setMessages(prev => [...prev, currentMessage])
        setStreamedContent("")
        
        const delay = 800 // Fast transition
        const timer = setTimeout(() => {
          setCurrentThinkingIndex(prev => prev + 1)
        }, delay)
        
        return () => clearTimeout(timer)
      })
      
      return cleanup
    }
    
    // Show exploration immediately after 2 messages
    if (hasSubmitted && currentThinkingIndex >= thinkingSequence.length && !showExploration) {
      const timer = setTimeout(() => {
        setShowExploration(true)
        setTimeout(() => setExplorationPhase(1), 200)
        setTimeout(() => setExplorationPhase(2), 500)
        setTimeout(() => setExplorationPhase(3), 900)
      }, 300)
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

  const handleDirectionSelect = (directionId: string) => {
    const isCurrentlySelected = selectedDirection === directionId
    setSelectedDirection(isCurrentlySelected ? null : directionId)
    if (isCurrentlySelected) {
      setPromptVersions([])
      setActiveVersion(null)
    }
  }

  const handleFragmentChange = (fragmentId: string, newText: string) => {
    const currentFragments = getCurrentFragments()
    const updatedFragments = currentFragments.map(f => 
      f.id === fragmentId ? { ...f, text: newText, alternatives: getAlternativesForFragment(newText) } : f
    )
    
    const newVersionId = `v${promptVersions.length + 1}`
    const changedFragment = currentFragments.find(f => f.id === fragmentId)
    
    setPromptVersions(prev => [...prev, {
      id: newVersionId,
      label: `${changedFragment?.text} → ${newText}`,
      fragments: updatedFragments,
      timestamp: "Just now"
    }])
    
    setActiveVersion(newVersionId)
    setExpandedFragment(null)
    setRecentlyChanged(fragmentId)
    setTimeout(() => setRecentlyChanged(null), 1500)
  }

  const handleReturnToExploration = () => {
    setSelectedDirection(null)
    setPromptVersions([])
    setActiveVersion(null)
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(getPromptString())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

      {/* Left Panel - Conversation */}
      <div 
        className={cn(
          "h-screen flex flex-col border-r border-border/30 relative transition-all duration-700 ease-out",
          showPromptWorkspace 
            ? "w-[24%] min-w-[280px] max-w-[320px]" 
            : showExploration 
              ? "w-[32%] min-w-[320px] max-w-[400px]" 
              : "w-[40%] min-w-[400px] max-w-[600px]"
        )}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-medium text-foreground">AIONE</h1>
              <p className="text-xs text-muted-foreground">Prompt Agent</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-5">
          {!hasSubmitted ? (
            <div className="h-full flex flex-col justify-center">
              <div className="space-y-4">
                <p className="text-muted-foreground/80 text-sm leading-relaxed">
                  Describe what you want to create.
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
              
              {isStreaming && currentThinkingMessage && (
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center",
                    currentThinkingMessage.type === "ai-insight" 
                      ? "bg-primary/20" 
                      : "bg-chart-4/20"
                  )}>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      currentThinkingMessage.type === "ai-insight"
                        ? "bg-primary"
                        : "bg-chart-4"
                    )} />
                  </div>
                  <div className="flex-1 text-sm leading-relaxed text-foreground/90">
                    {streamedContent}
                    <span className="inline-block w-0.5 h-4 bg-primary/60 ml-0.5 animate-blink" />
                  </div>
                </div>
              )}
              
              {analysisComplete && (
                <div className="pt-2 animate-fade-in">
                  <span className="text-xs text-muted-foreground/60">
                    {selectedDirection 
                      ? "Refining prompt..."
                      : "Select a direction to continue."
                    }
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
          "h-screen overflow-y-auto scrollbar-hide border-r border-border/30 transition-all duration-700",
          showExploration ? "opacity-100" : "opacity-0 pointer-events-none",
          showPromptWorkspace ? "w-[36%] min-w-[380px]" : "flex-1"
        )}
      >
        <div className={cn(
          "p-8 space-y-6",
          showPromptWorkspace ? "max-w-lg" : "max-w-xl mx-auto"
        )}>
          
          {/* Section Header */}
          <div 
            className={cn(
              "transition-all duration-500",
              explorationPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <h2 className="text-base font-medium text-foreground mb-1">Explore</h2>
            <p className="text-xs text-muted-foreground">Choose a creative direction</p>
          </div>

          {/* Detected Themes - Compact */}
          <div 
            className={cn(
              "flex flex-wrap gap-1.5 transition-all duration-500",
              explorationPhase >= 1 ? "opacity-100" : "opacity-0"
            )}
          >
            {detectedThemes.map((theme, index) => (
              <span
                key={theme}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] bg-muted/40 text-muted-foreground border border-border/30 transition-all",
                  explorationPhase >= 1 ? "opacity-100" : "opacity-0"
                )}
                style={{ transitionDelay: `${100 + index * 50}ms` }}
              >
                {theme}
              </span>
            ))}
            {emotionalSignals.slice(0, 2).map((signal, index) => (
              <span
                key={signal}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] bg-chart-5/10 text-chart-5/70 border border-chart-5/20 transition-all",
                  explorationPhase >= 1 ? "opacity-100" : "opacity-0"
                )}
                style={{ transitionDelay: `${300 + index * 50}ms` }}
              >
                {signal}
              </span>
            ))}
          </div>

          {/* Missing Dimensions - Compact */}
          <div 
            className={cn(
              "transition-all duration-500",
              explorationPhase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="grid grid-cols-2 gap-2">
              {dimensions.map((dimension, index) => (
                <div 
                  key={dimension.id}
                  className={cn(
                    "transition-all duration-300",
                    explorationPhase >= 2 ? "opacity-100" : "opacity-0"
                  )}
                  style={{ transitionDelay: `${index * 60}ms` }}
                >
                  <button
                    onClick={() => setExpandedDimension(expandedDimension === dimension.id ? null : dimension.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all",
                      "border",
                      dimension.selectedOption
                        ? "bg-primary/10 border-primary/30 text-foreground"
                        : "bg-muted/20 border-border/40 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                    )}
                  >
                    <span className={cn(
                      "transition-colors",
                      dimension.selectedOption ? "text-primary" : "text-muted-foreground/60"
                    )}>
                      {dimension.icon}
                    </span>
                    <span className="flex-1 text-left truncate">
                      {dimension.selectedOption || dimension.label}
                    </span>
                    <ChevronDown className={cn(
                      "w-3 h-3 transition-transform flex-shrink-0",
                      expandedDimension === dimension.id && "rotate-180"
                    )} />
                  </button>
                  
                  {expandedDimension === dimension.id && (
                    <div className="mt-1.5 p-1.5 rounded-lg bg-muted/20 border border-border/30 animate-expand">
                      {dimension.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleDimensionSelect(dimension.id, option)}
                          className={cn(
                            "w-full px-2.5 py-1.5 rounded text-[11px] text-left transition-all",
                            "hover:bg-primary/10 hover:text-primary",
                            dimension.selectedOption === option
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Direction Cards with Visual Previews */}
          <div 
            className={cn(
              "space-y-3 transition-all duration-500",
              explorationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {directions.map((direction, index) => {
              const isSelected = selectedDirection === direction.id
              const isDimmed = selectedDirection && !isSelected

              return (
                <button
                  key={direction.id}
                  onClick={() => handleDirectionSelect(direction.id)}
                  className={cn(
                    "w-full text-left rounded-2xl transition-all duration-500 overflow-hidden",
                    "border group",
                    explorationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
                    isSelected && "border-primary/50 scale-[1.02] shadow-lg shadow-primary/10",
                    isDimmed && "opacity-30 scale-[0.97] saturate-50",
                    !isSelected && !isDimmed && "border-border/40 hover:border-primary/30"
                  )}
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  {/* Visual Preview */}
                  <div className={cn(
                    "h-20 relative overflow-hidden transition-all duration-500",
                    `bg-gradient-to-br ${direction.previewGradient}`,
                    isSelected && "h-24"
                  )}>
                    {/* Atmospheric overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                    
                    {/* Mood elements */}
                    <div className={cn(
                      "absolute inset-0 opacity-30",
                      direction.previewAccent === "cyan" && "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent",
                      direction.previewAccent === "amber" && "bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent",
                      direction.previewAccent === "slate" && "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-400/10 via-transparent to-transparent"
                    )} />
                    
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                        <Check className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className={cn(
                    "p-4 space-y-2 transition-all",
                    isSelected && "p-5"
                  )}>
                    <div className="flex items-center justify-between">
                      <h4 className={cn(
                        "font-medium text-sm transition-colors",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {direction.title}
                      </h4>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full transition-colors",
                        isSelected 
                          ? "bg-primary/20 text-primary" 
                          : "bg-muted/50 text-muted-foreground"
                      )}>
                        {direction.alignmentLabel}
                      </span>
                    </div>
                    
                    <p className={cn(
                      "text-xs leading-relaxed transition-colors",
                      isSelected ? "text-foreground/70" : "text-muted-foreground",
                      isDimmed && "line-clamp-1"
                    )}>
                      {direction.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

        </div>
      </div>

      {/* Right Panel - Prompt Evolution Workspace */}
      <div 
        className={cn(
          "h-screen overflow-y-auto scrollbar-hide transition-all duration-700 ease-out",
          showPromptWorkspace 
            ? "w-[40%] min-w-[420px] opacity-100 translate-x-0" 
            : "w-0 opacity-0 translate-x-8 pointer-events-none"
        )}
      >
        <div className="p-8 space-y-6">
          
          {/* Header with back button */}
          <div 
            className={cn(
              "flex items-center justify-between transition-all duration-500",
              promptPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div>
              <h2 className="text-base font-medium text-foreground mb-0.5">Prompt</h2>
              <p className="text-xs text-muted-foreground">Click highlighted text to refine</p>
            </div>
            <button
              onClick={handleReturnToExploration}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Back
            </button>
          </div>

          {/* Interactive Prompt - The Main Steering Interface */}
          <div 
            className={cn(
              "transition-all duration-500",
              promptPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="relative rounded-2xl bg-muted/10 border border-border/30 p-6 group">
              <p className="text-sm leading-[1.8] text-foreground/90">
                {getCurrentFragments().map((fragment) => {
                  if (!fragment.isEditable) {
                    return <span key={fragment.id}>{fragment.text}</span>
                  }
                  
                  const isHovered = hoveredFragment === fragment.id
                  const isExpanded = expandedFragment === fragment.id
                  const wasChanged = recentlyChanged === fragment.id
                  
                  return (
                    <span key={fragment.id} className="relative inline">
                      <button
                        onMouseEnter={() => setHoveredFragment(fragment.id)}
                        onMouseLeave={() => !isExpanded && setHoveredFragment(null)}
                        onClick={() => setExpandedFragment(isExpanded ? null : fragment.id)}
                        className={cn(
                          "relative px-1 -mx-0.5 rounded transition-all duration-300",
                          "hover:bg-primary/15",
                          isHovered && "bg-primary/10",
                          isExpanded && "bg-primary/20 ring-1 ring-primary/40",
                          wasChanged && "animate-pulse bg-chart-4/20"
                        )}
                      >
                        <span className={cn(
                          "transition-colors duration-300",
                          isHovered || isExpanded ? "text-primary" : "text-foreground"
                        )}>
                          {fragment.text}
                        </span>
                        
                        {/* Subtle underline indicator */}
                        <span className={cn(
                          "absolute bottom-0 left-1 right-1 h-px bg-primary/40 transition-opacity",
                          isHovered || isExpanded ? "opacity-100" : "opacity-0"
                        )} />
                      </button>
                      
                      {/* Semantic alternatives dropdown */}
                      {isExpanded && fragment.alternatives && (
                        <span className="absolute z-10 left-0 top-full mt-2 animate-expand">
                          <span className="flex flex-col gap-0.5 p-2 rounded-xl bg-card border border-border/50 shadow-xl min-w-[180px]">
                            <span className="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wider">
                              Alternatives
                            </span>
                            {fragment.alternatives.map((alt) => (
                              <button
                                key={alt}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleFragmentChange(fragment.id, alt)
                                }}
                                className={cn(
                                  "px-3 py-2 rounded-lg text-xs text-left transition-all",
                                  "hover:bg-primary/10 hover:text-primary",
                                  "text-muted-foreground"
                                )}
                              >
                                {alt}
                              </button>
                            ))}
                          </span>
                        </span>
                      )}
                    </span>
                  )
                })}
              </p>
              
              {/* Copy button */}
              <div className="absolute top-4 right-4">
                <button 
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 transition-colors opacity-0 group-hover:opacity-100"
                >
                  {copied ? <Check className="w-3 h-3 text-chart-4" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Version History - Timeline Style */}
          <div 
            className={cn(
              "space-y-3 transition-all duration-500",
              promptPhase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-muted-foreground/60" />
              <h3 className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                Evolution
              </h3>
            </div>
            
            <div className="relative pl-4 border-l border-border/30 space-y-3">
              {promptVersions.map((version, index) => {
                const isActive = activeVersion === version.id
                const isLatest = index === promptVersions.length - 1
                
                return (
                  <button
                    key={version.id}
                    onClick={() => setActiveVersion(version.id)}
                    className={cn(
                      "relative w-full text-left pl-4 py-2 rounded-r-lg transition-all",
                      isActive 
                        ? "bg-primary/5" 
                        : "hover:bg-muted/20"
                    )}
                  >
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute -left-[21px] top-3 w-3 h-3 rounded-full border-2 transition-colors",
                      isActive 
                        ? "bg-primary border-primary" 
                        : "bg-background border-border/50"
                    )} />
                    
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-xs font-medium",
                            isActive ? "text-primary" : "text-foreground/70"
                          )}>
                            V{index + 1}
                          </span>
                          {isLatest && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                              Latest
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {version.label}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground/50 flex-shrink-0">
                        {version.timestamp}
                      </span>
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

  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className={cn(
        "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
        message.type === "ai-insight" ? "bg-primary/20" : "bg-chart-4/20"
      )}>
        <div className={cn(
          "w-1.5 h-1.5 rounded-full",
          message.type === "ai-insight" ? "bg-primary" : "bg-chart-4"
        )} />
      </div>
      <span className="text-sm leading-relaxed text-foreground/90">
        {message.content}
      </span>
    </div>
  )
}
