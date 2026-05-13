"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Send, Sparkles, Check, Copy, Clock, Save } from "lucide-react"

// Types
interface Message {
  id: string
  type: "user" | "ai-insight" | "ai-transition"
  content: string
}

interface ClarificationDimension {
  id: string
  label: string
  description: string
  isPresent: boolean
  options?: string[]
  selectedOption?: string
}

interface VibeInterpretation {
  id: string
  label: string
  atmosphere: string
  gradient: string
  accentPosition: string
  promptTemplate: string
}

interface PromptFragment {
  id: string
  text: string
  isEditable: boolean
  category?: string
  alternatives?: string[]
}

interface PromptVersion {
  id: string
  label: string
  fragments: PromptFragment[]
  timestamp: string
  isCheckpoint: boolean
}

// The featured onboarding example - carefully art-directed
const featuredExample = {
  prompt: "A lone figure walks through a rain-soaked Tokyo alley at 2am, illuminated by cold neon reflections and drifting steam. The atmosphere feels emotionally distant but strangely intimate, framed like a quiet cinematic memory with soft film grain and muted contrast.",
  label: "Neo-noir cinematic realism"
}

// Shortened AI messages - only 2 before exploration
const thinkingSequence: Message[] = [
  { id: "t1", type: "ai-insight", content: "I can see the emotional atmosphere you're reaching for." },
  { id: "t2", type: "ai-transition", content: "Let me help you clarify and shape this further." },
]

// Creative Clarification Framework - 8 dimensions
const clarificationFramework: ClarificationDimension[] = [
  { id: "subject", label: "Subject", description: "Who or what is the focus", isPresent: true },
  { id: "environment", label: "Environment", description: "Where this takes place", isPresent: true },
  { id: "emotional-tone", label: "Emotional Tone", description: "The feeling it evokes", isPresent: true },
  { id: "lighting", label: "Lighting & Color", description: "How light shapes the mood", isPresent: false, options: ["Cold neon glow", "Warm tungsten intimacy", "Harsh contrast shadows", "Soft diffused ambience"] },
  { id: "framing", label: "Framing & Perspective", description: "How we see the scene", isPresent: false, options: ["Intimate close framing", "Environmental wide shot", "Low angle dramatic", "Voyeuristic distance"] },
  { id: "motion", label: "Motion & Energy", description: "Stillness or movement", isPresent: false, options: ["Frozen stillness", "Subtle motion blur", "Dynamic energy", "Dreamlike drift"] },
  { id: "style", label: "Visual Style", description: "The aesthetic language", isPresent: false, options: ["Photorealistic cinema", "Analog film texture", "Painterly atmosphere", "Minimal graphic"] },
  { id: "atmosphere", label: "Atmosphere & Texture", description: "Environmental mood", isPresent: false, options: ["Misty and ethereal", "Gritty and raw", "Clean and precise", "Layered and dense"] },
]

// Vibe Interpretations - 8 atmospheric possibilities with organic layout
const vibeInterpretations: VibeInterpretation[] = [
  { 
    id: "v1", 
    label: "Neo-noir melancholy", 
    atmosphere: "Heavy shadows, isolated neon pools",
    gradient: "from-cyan-600/50 via-blue-900/40 to-slate-950/60",
    accentPosition: "top-right",
    promptTemplate: "A lone figure walks through a [rain-soaked] Tokyo alley at 2am, illuminated by [cold neon reflections] and drifting steam. The atmosphere feels [emotionally distant] but strangely intimate, framed like a [quiet cinematic memory] with soft film grain and muted contrast. Neo-noir aesthetic with [deep shadows] and isolated pools of neon light."
  },
  { 
    id: "v2", 
    label: "Soft nostalgic realism", 
    atmosphere: "Warm grain, faded memory",
    gradient: "from-amber-500/40 via-orange-800/30 to-stone-900/50",
    accentPosition: "top-left",
    promptTemplate: "A lone figure walks through a [rain-soaked] Tokyo alley at 2am, illuminated by [warm tungsten glow] filtering through steam. The atmosphere feels [tenderly melancholic] and strangely intimate, framed like a [fading photograph] with heavy film grain and nostalgic warmth. Soft realism with [gentle light diffusion]."
  },
  { 
    id: "v3", 
    label: "Dreamlike atmospheric ambiguity", 
    atmosphere: "Hazy boundaries, uncertain forms",
    gradient: "from-violet-600/30 via-indigo-800/40 to-slate-900/50",
    accentPosition: "center",
    promptTemplate: "A lone figure walks through a [rain-soaked] Tokyo alley at 2am, forms [dissolving into mist] and drifting steam. The atmosphere feels [surreally detached] and strangely intimate, framed like a [half-remembered dream] with soft focus and ambiguous boundaries. Dreamlike quality with [ethereal light bleeding]."
  },
  { 
    id: "v4", 
    label: "Minimal brutalist isolation", 
    atmosphere: "Stark geometry, emotional void",
    gradient: "from-zinc-700/50 via-neutral-800/40 to-black/70",
    accentPosition: "bottom",
    promptTemplate: "A lone figure walks through a [rain-soaked] Tokyo alley at 2am, reduced to [geometric silhouette] against stark concrete. The atmosphere feels [coldly isolated] and strangely intimate, framed with [brutal minimalism] and high contrast. Clean lines, [deep blacks], architectural emptiness."
  },
  { 
    id: "v5", 
    label: "Analog film intimacy", 
    atmosphere: "Textured warmth, human imperfection",
    gradient: "from-rose-500/30 via-pink-900/30 to-stone-900/50",
    accentPosition: "top-left",
    promptTemplate: "A lone figure walks through a [rain-soaked] Tokyo alley at 2am, captured with [visible film grain] and color shifts. The atmosphere feels [intimately human] and strangely warm, framed like a [candid street photograph] with natural imperfections. Analog texture with [subtle color cast]."
  },
  { 
    id: "v6", 
    label: "Surreal ambient haze", 
    atmosphere: "Otherworldly glow, liminal space",
    gradient: "from-teal-500/40 via-emerald-900/30 to-slate-950/50",
    accentPosition: "center",
    promptTemplate: "A lone figure walks through a [rain-soaked] Tokyo alley at 2am, surrounded by [otherworldly ambient glow]. The atmosphere feels [liminal and strange] but strangely intimate, framed like a [scene between realities] with surreal color and soft edges. Ethereal quality with [impossible lighting]."
  },
  { 
    id: "v7", 
    label: "Documentary rawness", 
    atmosphere: "Unfiltered truth, street grit",
    gradient: "from-stone-600/40 via-neutral-700/30 to-zinc-900/50",
    accentPosition: "bottom-left",
    promptTemplate: "A lone figure walks through a [rain-soaked] Tokyo alley at 2am, captured with [unflinching documentary eye]. The atmosphere feels [authentically raw] and strangely intimate, framed like a [stolen moment] with natural lighting and urban grit. Street photography with [honest imperfection]."
  },
  { 
    id: "v8", 
    label: "Cinematic grandeur", 
    atmosphere: "Epic scale, emotional weight",
    gradient: "from-sky-600/40 via-blue-800/40 to-indigo-950/60",
    accentPosition: "top-right",
    promptTemplate: "A lone figure walks through a [rain-soaked] Tokyo alley at 2am, [dwarfed by towering architecture]. The atmosphere feels [epically lonely] but strangely intimate, framed like a [widescreen cinema moment] with dramatic composition. Cinematic scope with [architectural grandeur]."
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
    if (match.index > lastIndex) {
      fragments.push({
        id: `f${id++}`,
        text: template.slice(lastIndex, match.index),
        isEditable: false
      })
    }
    
    fragments.push({
      id: `f${id++}`,
      text: match[1],
      isEditable: true,
      alternatives: getAlternativesForFragment(match[1])
    })
    
    lastIndex = match.index + match[0].length
  }
  
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
    "rain-soaked": ["mist-shrouded", "neon-drenched", "steam-filled", "shadow-wrapped"],
    "cold neon reflections": ["warm amber pools", "harsh white glare", "soft diffused glow", "flickering color"],
    "emotionally distant": ["tenderly melancholic", "quietly contemplative", "achingly present", "peacefully detached"],
    "quiet cinematic memory": ["fading photograph", "half-forgotten dream", "stolen moment", "eternal pause"],
    "deep shadows": ["gentle darkness", "layered grays", "absolute blacks", "soft penumbra"],
    "warm tungsten glow": ["cold fluorescent wash", "mixed color sources", "single spotlight", "ambient scatter"],
    "tenderly melancholic": ["bittersweet nostalgia", "quiet acceptance", "wistful longing", "peaceful sadness"],
    "fading photograph": ["vivid memory", "impressionist blur", "sharp recollection", "watercolor wash"],
    "gentle light diffusion": ["harsh direct light", "dappled shadows", "even illumination", "dramatic contrast"],
    "dissolving into mist": ["sharply defined", "partially obscured", "fragmenting into light", "merging with shadow"],
    "surreally detached": ["hyperreal present", "floating awareness", "grounded uncertainty", "lucid distance"],
    "half-remembered dream": ["vivid hallucination", "waking vision", "subconscious flash", "memory fragment"],
    "ethereal light bleeding": ["contained illumination", "light leaking", "glowing edges", "soft radiation"],
    "geometric silhouette": ["detailed figure", "soft outline", "fragmented form", "solid presence"],
    "coldly isolated": ["warmly solitary", "peacefully alone", "achingly separate", "contentedly distant"],
    "brutal minimalism": ["rich complexity", "subtle detail", "stark simplicity", "elegant reduction"],
    "visible film grain": ["smooth digital clarity", "heavy texture", "subtle noise", "organic imperfection"],
    "intimately human": ["coolly observed", "warmly embraced", "honestly captured", "tenderly seen"],
    "candid street photograph": ["composed portrait", "spontaneous capture", "observed moment", "witnessed scene"],
    "subtle color cast": ["neutral accuracy", "bold color shift", "monochromatic tint", "cross-processed look"],
    "otherworldly ambient glow": ["natural light source", "artificial illumination", "bioluminescent feel", "radioactive cast"],
    "liminal and strange": ["familiar and grounded", "uncanny and shifted", "dreamlike and floating", "hyperreal and sharp"],
    "scene between realities": ["grounded moment", "parallel existence", "threshold space", "dimensional slip"],
    "impossible lighting": ["motivated light", "practical sources", "available light", "studio precision"],
    "unflinching documentary eye": ["romanticized gaze", "poetic interpretation", "raw observation", "gentle witness"],
    "authentically raw": ["carefully polished", "honestly imperfect", "beautifully flawed", "unfiltered truth"],
    "stolen moment": ["composed scene", "decisive instant", "patient observation", "quick glimpse"],
    "honest imperfection": ["careful precision", "natural accident", "embraced flaw", "authentic error"],
    "dwarfed by towering architecture": ["intimate with surroundings", "balanced in scale", "dominating the frame", "lost in space"],
    "epically lonely": ["quietly solitary", "grandly isolated", "peacefully alone", "dramatically singular"],
    "widescreen cinema moment": ["intimate portrait crop", "square contemplation", "vertical drama", "panoramic sweep"],
    "architectural grandeur": ["human intimacy", "environmental detail", "spatial compression", "volumetric depth"],
  }
  
  return alternativesMap[text] || ["subtle shift", "dramatic reinterpretation", "softer approach", "bolder direction"]
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
  const [clarificationDimensions, setClarificationDimensions] = useState<ClarificationDimension[]>(clarificationFramework)
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null)
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null)
  const [showPromptWorkspace, setShowPromptWorkspace] = useState(false)
  const [promptPhase, setPromptPhase] = useState(0)
  const [promptVersions, setPromptVersions] = useState<PromptVersion[]>([])
  const [activeVersion, setActiveVersion] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [hoveredFragment, setHoveredFragment] = useState<string | null>(null)
  const [expandedFragment, setExpandedFragment] = useState<string | null>(null)
  const [recentlyChanged, setRecentlyChanged] = useState<string | null>(null)
  const [workingFragments, setWorkingFragments] = useState<PromptFragment[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamedContent])

  // Get current prompt fragments - prioritize working state
  const getCurrentFragments = useCallback((): PromptFragment[] => {
    if (workingFragments.length > 0) {
      return workingFragments
    }
    if (activeVersion && promptVersions.length > 0) {
      const version = promptVersions.find(v => v.id === activeVersion)
      if (version) return version.fragments
    }
    const vibe = vibeInterpretations.find(v => v.id === selectedVibe)
    if (vibe) return parsePromptToFragments(vibe.promptTemplate)
    return []
  }, [selectedVibe, activeVersion, promptVersions, workingFragments])

  // Get prompt as string
  const getPromptString = useCallback(() => {
    return getCurrentFragments().map(f => f.text).join('')
  }, [getCurrentFragments])

  // Initialize prompt versions when vibe is selected
  useEffect(() => {
    if (selectedVibe && promptVersions.length === 0) {
      const vibe = vibeInterpretations.find(v => v.id === selectedVibe)
      if (vibe) {
        const fragments = parsePromptToFragments(vibe.promptTemplate)
        setPromptVersions([
          {
            id: "v1",
            label: `Initial ${vibe.label} direction`,
            fragments,
            timestamp: "Just now",
            isCheckpoint: true
          }
        ])
        setActiveVersion("v1")
        setWorkingFragments(fragments)
      }
    }
  }, [selectedVibe, promptVersions.length])

  // Trigger prompt workspace when vibe is selected
  useEffect(() => {
    if (selectedVibe && !showPromptWorkspace) {
      const timer = setTimeout(() => {
        setShowPromptWorkspace(true)
        setTimeout(() => setPromptPhase(1), 200)
        setTimeout(() => setPromptPhase(2), 600)
      }, 300)
      return () => clearTimeout(timer)
    }
    if (!selectedVibe) {
      setShowPromptWorkspace(false)
      setPromptPhase(0)
    }
  }, [selectedVibe, showPromptWorkspace])

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
    }, 30)
    
    return () => clearInterval(interval)
  }, [])

  // Progressive message reveal
  useEffect(() => {
    if (hasSubmitted && currentThinkingIndex < thinkingSequence.length) {
      const currentMessage = thinkingSequence[currentThinkingIndex]
      
      const cleanup = streamText(currentMessage.content, () => {
        setMessages(prev => [...prev, currentMessage])
        setStreamedContent("")
        
        const delay = 600
        const timer = setTimeout(() => {
          setCurrentThinkingIndex(prev => prev + 1)
        }, delay)
        
        return () => clearTimeout(timer)
      })
      
      return cleanup
    }
    
    if (hasSubmitted && currentThinkingIndex >= thinkingSequence.length && !showExploration) {
      const timer = setTimeout(() => {
        setShowExploration(true)
        setTimeout(() => setExplorationPhase(1), 200)
        setTimeout(() => setExplorationPhase(2), 600)
        setTimeout(() => setExplorationPhase(3), 1000)
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
    setClarificationDimensions(prev => prev.map(d => 
      d.id === dimensionId ? { ...d, selectedOption: option, isPresent: true } : d
    ))
    setExpandedDimension(null)
  }

  const handleVibeSelect = (vibeId: string) => {
    const isCurrentlySelected = selectedVibe === vibeId
    setSelectedVibe(isCurrentlySelected ? null : vibeId)
    if (isCurrentlySelected) {
      setPromptVersions([])
      setActiveVersion(null)
      setWorkingFragments([])
      setHasUnsavedChanges(false)
    }
  }

  // Update working fragments without creating a version (live editing)
  const handleFragmentChange = (fragmentId: string, newText: string) => {
    const currentFragments = getCurrentFragments()
    const updatedFragments = currentFragments.map(f => 
      f.id === fragmentId ? { ...f, text: newText, alternatives: getAlternativesForFragment(newText) } : f
    )
    
    setWorkingFragments(updatedFragments)
    setHasUnsavedChanges(true)
    setExpandedFragment(null)
    setRecentlyChanged(fragmentId)
    setTimeout(() => setRecentlyChanged(null), 1500)
  }

  // Save a checkpoint - intentional user action
  const handleSaveCheckpoint = () => {
    if (!hasUnsavedChanges || workingFragments.length === 0) return
    
    const newVersionId = `v${promptVersions.length + 1}`
    const checkpointLabels = [
      "Refined direction",
      "Atmospheric adjustment", 
      "Tonal shift",
      "Creative evolution",
      "Mood refinement"
    ]
    const label = checkpointLabels[promptVersions.length % checkpointLabels.length]
    
    setPromptVersions(prev => [...prev, {
      id: newVersionId,
      label,
      fragments: workingFragments,
      timestamp: "Just now",
      isCheckpoint: true
    }])
    
    setActiveVersion(newVersionId)
    setHasUnsavedChanges(false)
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(getPromptString())
    setCopied(true)
    // Also save as checkpoint when copying
    if (hasUnsavedChanges) {
      handleSaveCheckpoint()
    }
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExampleClick = () => {
    setUserInput(featuredExample.prompt)
  }

  const currentThinkingMessage = hasSubmitted && currentThinkingIndex < thinkingSequence.length 
    ? thinkingSequence[currentThinkingIndex] 
    : null

  const analysisComplete = currentThinkingIndex >= thinkingSequence.length

  // Get dimensions that could be further shaped
  const shapableDimensions = clarificationDimensions.filter(d => !d.isPresent && d.options)

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
            ? "w-[22%] min-w-[260px] max-w-[300px]" 
            : showExploration 
              ? "w-[30%] min-w-[300px] max-w-[380px]" 
              : "w-[40%] min-w-[400px] max-w-[560px]"
        )}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">AIONE</h1>
              <p className="text-xs text-muted-foreground">Creative Clarification</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-6">
          {!hasSubmitted ? (
            <div className="h-full flex flex-col justify-center">
              <div className="space-y-8">
                {/* Hero Language */}
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold text-foreground leading-tight">
                    Bring vague ideas into focus
                  </h2>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Clarify visual ideas through collaborative exploration. Turn half-formed intuitions into clear creative direction.
                  </p>
                </div>
                
                {/* Featured Example */}
                <div className="space-y-3">
                  <button
                    onClick={handleExampleClick}
                    className={cn(
                      "w-full text-left p-5 rounded-2xl transition-all duration-300",
                      "bg-gradient-to-br from-muted/50 via-muted/30 to-transparent",
                      "border border-border/50 hover:border-primary/40",
                      "hover:bg-gradient-to-br hover:from-primary/10 hover:via-muted/30 hover:to-transparent",
                      "group"
                    )}
                  >
                    <p className="text-sm text-foreground leading-relaxed mb-3 group-hover:text-foreground transition-colors">
                      {featuredExample.prompt}
                    </p>
                    <span className="text-xs text-primary/80 font-medium group-hover:text-primary transition-colors">
                      {featuredExample.label}
                    </span>
                  </button>
                  <p className="text-xs text-muted-foreground text-center">
                    Click to use as starting point
                  </p>
                </div>
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
                  <div className="flex-1 text-sm leading-relaxed text-foreground">
                    {streamedContent}
                    <span className="inline-block w-0.5 h-4 bg-primary/70 ml-0.5 animate-blink" />
                  </div>
                </div>
              )}
              
              {analysisComplete && (
                <div className="pt-2 animate-fade-in">
                  <span className="text-xs text-muted-foreground/60">
                    {selectedVibe 
                      ? "Shaping your direction..."
                      : "Choose an interpretation to continue."
                    }
                  </span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-6 py-5 border-t border-border/30">
          <form onSubmit={handleSubmit}>
            <div className={cn(
              "relative rounded-2xl transition-all duration-300",
              "bg-muted/40 border border-border/50",
              "focus-within:border-primary/40 focus-within:bg-muted/50",
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
                placeholder="Describe a mood, atmosphere, or visual feeling..."
                disabled={hasSubmitted}
                rows={3}
                className="w-full bg-transparent px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none resize-none"
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

      {/* Center Panel - Creative Clarification Workspace */}
      <div 
        className={cn(
          "h-screen overflow-y-auto scrollbar-hide border-r border-border/30 transition-all duration-700",
          showExploration ? "opacity-100" : "opacity-0 pointer-events-none",
          showPromptWorkspace ? "w-[38%] min-w-[400px]" : "flex-1"
        )}
      >
        <div className={cn(
          "p-8 space-y-10",
          showPromptWorkspace ? "max-w-lg" : "max-w-2xl mx-auto"
        )}>
          
          {/* Section Header */}
          <div 
            className={cn(
              "transition-all duration-500",
              explorationPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <h2 className="text-xl font-semibold text-foreground mb-2">Shape Your Vision</h2>
            <p className="text-sm text-muted-foreground">Clarify and deepen the creative direction</p>
          </div>

          {/* Creative Clarification - Structural shaping */}
          <div 
            className={cn(
              "transition-all duration-500 pb-6 border-b border-border/30",
              explorationPhase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wide">
              Structural Dimensions
            </p>
            <div className="flex flex-wrap gap-2.5">
              {shapableDimensions.map((dimension, index) => (
                <div 
                  key={dimension.id}
                  className={cn(
                    "relative transition-all duration-300",
                    explorationPhase >= 2 ? "opacity-100" : "opacity-0"
                  )}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <button
                    onClick={() => setExpandedDimension(expandedDimension === dimension.id ? null : dimension.id)}
                    className={cn(
                      "px-3.5 py-2 rounded-xl text-sm transition-all",
                      "border",
                      dimension.selectedOption
                        ? "bg-primary/15 border-primary/40 text-foreground font-medium"
                        : "bg-muted/30 border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    {dimension.selectedOption || dimension.label}
                  </button>
                  
                  {expandedDimension === dimension.id && dimension.options && (
                    <div className="absolute z-30 left-0 top-full mt-2 min-w-[240px] p-3 rounded-xl bg-card border border-border/60 shadow-2xl animate-expand">
                      <p className="px-2 py-1.5 text-xs text-muted-foreground mb-2">
                        {dimension.description}
                      </p>
                      {dimension.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleDimensionSelect(dimension.id, option)}
                          className={cn(
                            "w-full px-3 py-2.5 rounded-lg text-sm text-left transition-all",
                            "hover:bg-primary/15 hover:text-primary",
                            dimension.selectedOption === option
                              ? "bg-primary/15 text-primary font-medium"
                              : "text-foreground"
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

          {/* Vibe Interpretations - Emotional / cinematic reinterpretation */}
          <div 
            className={cn(
              "transition-all duration-500",
              explorationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wide">
              Emotional Interpretations
            </p>
            
            {/* Organic staggered grid */}
            <div className={cn(
              "grid gap-3",
              showPromptWorkspace ? "grid-cols-2" : "grid-cols-4"
            )}>
              {vibeInterpretations.map((vibe, index) => {
                const isSelected = selectedVibe === vibe.id
                const isDimmed = selectedVibe && !isSelected
                
                // Stagger heights for organic feel
                const heightVariants = ["h-28", "h-32", "h-24", "h-30", "h-26", "h-34", "h-28", "h-32"]
                const height = heightVariants[index % heightVariants.length]

                return (
                  <button
                    key={vibe.id}
                    onClick={() => handleVibeSelect(vibe.id)}
                    className={cn(
                      "relative text-left rounded-xl transition-all duration-500 overflow-hidden group",
                      height,
                      explorationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
                      isSelected && "ring-2 ring-primary/60 scale-[1.02]",
                      isDimmed && "opacity-30 scale-[0.97] saturate-50",
                      !isSelected && !isDimmed && "hover:scale-[1.02]"
                    )}
                    style={{ transitionDelay: `${index * 60}ms` }}
                  >
                    {/* Gradient background */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-br transition-all duration-500",
                      vibe.gradient
                    )} />
                    
                    {/* Accent glow */}
                    <div className={cn(
                      "absolute w-24 h-24 rounded-full blur-2xl transition-opacity duration-500",
                      "bg-white/10",
                      vibe.accentPosition === "top-right" && "top-0 right-0 -translate-y-1/2 translate-x-1/2",
                      vibe.accentPosition === "top-left" && "top-0 left-0 -translate-y-1/2 -translate-x-1/2",
                      vibe.accentPosition === "center" && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                      vibe.accentPosition === "bottom" && "bottom-0 left-1/2 translate-y-1/2 -translate-x-1/2",
                      vibe.accentPosition === "bottom-left" && "bottom-0 left-0 translate-y-1/2 -translate-x-1/2",
                      isSelected ? "opacity-60" : "opacity-30 group-hover:opacity-50"
                    )} />
                    
                    {/* Content overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    
                    {/* Label */}
                    <div className="absolute bottom-0 left-0 right-0 p-3.5">
                      <p className={cn(
                        "text-sm font-medium text-white mb-0.5 transition-colors",
                        isSelected && "text-white"
                      )}>
                        {vibe.label}
                      </p>
                      <p className="text-xs text-white/60 line-clamp-1">
                        {vibe.atmosphere}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
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
        <div className="p-8 space-y-8">
          
          {/* Header */}
          <div 
            className={cn(
              "transition-all duration-500",
              promptPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <h2 className="text-xl font-semibold text-foreground mb-1">Refine</h2>
            <p className="text-sm text-muted-foreground">Click highlighted elements to explore variations</p>
          </div>

          {/* Interactive Prompt - The Main Steering Interface */}
          <div 
            className={cn(
              "transition-all duration-500",
              promptPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="relative rounded-2xl bg-muted/15 border border-border/40 p-6 group">
              <p className="text-sm leading-[2] text-foreground">
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
                          "relative px-1.5 -mx-0.5 rounded transition-all duration-300",
                          "bg-primary/10 border-b-2 border-primary/30",
                          "hover:bg-primary/20 hover:border-primary/50",
                          isExpanded && "bg-primary/25 border-primary/60 ring-1 ring-primary/30",
                          wasChanged && "animate-pulse bg-chart-4/20 border-chart-4/40"
                        )}
                      >
                        <span className={cn(
                          "transition-colors duration-300",
                          isHovered || isExpanded ? "text-primary" : "text-primary/90"
                        )}>
                          {fragment.text}
                        </span>
                      </button>
                      
                      {/* Semantic reinterpretation options */}
                      {isExpanded && fragment.alternatives && (
                        <span className="absolute z-30 left-0 top-full mt-2 animate-expand">
                          <span className="flex flex-col gap-0.5 p-3 rounded-xl bg-card border border-border/60 shadow-2xl min-w-[240px]">
                            <span className="px-2 py-1.5 text-xs text-muted-foreground">
                              Reimagine this element
                            </span>
                            {fragment.alternatives.map((alt) => (
                              <button
                                key={alt}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleFragmentChange(fragment.id, alt)
                                }}
                                className={cn(
                                  "px-3 py-2.5 rounded-lg text-sm text-left transition-all",
                                  "hover:bg-primary/15 hover:text-primary",
                                  "text-foreground"
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
              
              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {hasUnsavedChanges && (
                  <button 
                    onClick={handleSaveCheckpoint}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save
                  </button>
                )}
                <button 
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors opacity-0 group-hover:opacity-100"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-chart-3" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Saved Directions - Timeline Style */}
          <div 
            className={cn(
              "space-y-4 transition-all duration-500",
              promptPhase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">
                Saved Directions
              </h3>
            </div>
            
            <div className="relative pl-5 border-l-2 border-border/40 space-y-3">
              {promptVersions.filter(v => v.isCheckpoint).map((version, index, filtered) => {
                const isActive = activeVersion === version.id
                const isLatest = index === filtered.length - 1
                
                return (
                  <button
                    key={version.id}
                    onClick={() => {
                      setActiveVersion(version.id)
                      setWorkingFragments(version.fragments)
                      setHasUnsavedChanges(false)
                    }}
                    className={cn(
                      "relative w-full text-left pl-4 py-2.5 rounded-r-lg transition-all",
                      isActive 
                        ? "bg-primary/10" 
                        : "hover:bg-muted/30"
                    )}
                  >
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute -left-[25px] top-3.5 w-3.5 h-3.5 rounded-full border-2 transition-colors",
                      isActive 
                        ? "bg-primary border-primary" 
                        : "bg-background border-border"
                    )} />
                    
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-sm font-medium",
                            isActive ? "text-primary" : "text-foreground"
                          )}>
                            {index + 1}
                          </span>
                          {isLatest && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {version.label}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
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
        <div className="max-w-[90%] bg-primary/15 border border-primary/25 rounded-2xl rounded-br-md px-4 py-3">
          <p className="text-sm text-foreground leading-relaxed">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
        message.type === "ai-insight" ? "bg-primary/20" : "bg-chart-4/20"
      )}>
        <div className={cn(
          "w-2 h-2 rounded-full",
          message.type === "ai-insight" ? "bg-primary" : "bg-chart-4"
        )} />
      </div>
      <span className="text-sm leading-relaxed text-foreground">
        {message.content}
      </span>
    </div>
  )
}
