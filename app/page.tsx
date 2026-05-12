"use client"

import { useState, useCallback, useEffect } from "react"
import { IntentInput } from "@/components/intent-input"
import { ConversationStream } from "@/components/conversation-stream"
import { ExplorationWorkspace } from "@/components/exploration-workspace"
import { DirectionCards, type Direction } from "@/components/direction-cards"
import { PromptEvolution, type PromptVersion } from "@/components/prompt-evolution"
import { SemanticSteering } from "@/components/semantic-steering"
import { cn } from "@/lib/utils"

// Types
interface Message {
  id: string
  type: "user" | "ai-thinking" | "ai-observation" | "ai-question"
  content: string
  isStreaming?: boolean
}

interface MissingDimension {
  id: string
  label: string
  options: string[]
  selectedOption?: string
}

// Mock data
const examplePrompt = "A moody portrait of a person standing in rain, looking contemplative, with city lights reflecting off wet surfaces"

const mockDirections: Direction[] = [
  {
    id: "1",
    title: "Neo-Noir Cinematic",
    description: "Deep shadows, neon reflections, and a sense of urban isolation. Think Blade Runner meets street photography.",
    moodTags: ["Dark", "Cinematic", "Urban"],
    confidence: 0.92
  },
  {
    id: "2",
    title: "Intimate Documentary",
    description: "Raw, authentic emotion captured in natural light. Less stylized, more human connection.",
    moodTags: ["Raw", "Authentic", "Emotional"],
    confidence: 0.85
  },
  {
    id: "3",
    title: "Painterly Impressionist",
    description: "Soft focus, dreamy rain effects, blurred city lights creating an almost abstract quality.",
    moodTags: ["Artistic", "Dreamy", "Abstract"],
    confidence: 0.78
  }
]

const initialDimensions: MissingDimension[] = [
  {
    id: "lighting",
    label: "Lighting Style",
    options: ["Neon reflections", "Soft cinematic glow", "Hard contrast shadows", "Overcast realism"]
  },
  {
    id: "camera",
    label: "Camera Angle",
    options: ["Low angle dramatic", "Eye level intimate", "High angle vulnerable", "Dutch angle tension"]
  },
  {
    id: "color",
    label: "Color Language",
    options: ["Cyan & magenta", "Warm amber tones", "Desaturated moody", "High contrast B&W"]
  },
  {
    id: "mood",
    label: "Emotional Intensity",
    options: ["Subtle melancholy", "Deep contemplation", "Quiet strength", "Raw vulnerability"]
  }
]

const aiMessages: Message[] = [
  {
    id: "1",
    type: "ai-thinking",
    content: "I'm detecting a cinematic urban mood in your description...",
    isStreaming: true
  },
  {
    id: "2",
    type: "ai-observation",
    content: "Your mention of rain and reflections strongly suggests neo-noir aesthetics. The contemplative figure creates a powerful emotional anchor.",
    isStreaming: true
  },
  {
    id: "3",
    type: "ai-thinking",
    content: "Several visual directions are emerging. Let me map out the creative possibilities...",
    isStreaming: true
  },
  {
    id: "4",
    type: "ai-question",
    content: "To refine further: should the mood lean more melancholic or mysteriously alluring?",
    isStreaming: true
  }
]

type Stage = "input" | "exploring" | "directions" | "evolution"

export default function AIWorkspace() {
  const [stage, setStage] = useState<Stage>("input")
  const [messages, setMessages] = useState<Message[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  
  // Exploration state
  const [detectedThemes, setDetectedThemes] = useState<string[]>([])
  const [emotionalSignals, setEmotionalSignals] = useState<string[]>([])
  const [missingDimensions, setMissingDimensions] = useState<MissingDimension[]>([])
  
  // Direction state
  const [directions, setDirections] = useState<Direction[]>([])
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null)
  const [isLoadingDirections, setIsLoadingDirections] = useState(false)
  
  // Prompt evolution state
  const [promptVersions, setPromptVersions] = useState<PromptVersion[]>([])
  const [currentPromptVersion, setCurrentPromptVersion] = useState<PromptVersion | null>(null)
  const [isStreamingPrompt, setIsStreamingPrompt] = useState(false)
  
  // Steering state
  const [steeringSliders, setSteeringSliders] = useState([
    { id: "style", leftLabel: "Subtle", rightLabel: "Cinematic", value: 0.7 },
    { id: "mood", leftLabel: "Grounded", rightLabel: "Dreamlike", value: 0.4 },
    { id: "finish", leftLabel: "Raw", rightLabel: "Stylized", value: 0.6 }
  ])

  // Progressive message reveal
  useEffect(() => {
    if (stage === "exploring" && currentMessageIndex < aiMessages.length) {
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, aiMessages[currentMessageIndex]])
        setCurrentMessageIndex(prev => prev + 1)
        
        // After second message, show exploration workspace
        if (currentMessageIndex === 1) {
          setDetectedThemes(["Urban isolation", "Rain aesthetics", "Cinematic mood", "Contemplation"])
          setEmotionalSignals(["Melancholy", "Introspection", "Solitude"])
          setMissingDimensions(initialDimensions)
        }
        
        // After all messages, show directions
        if (currentMessageIndex === aiMessages.length - 1) {
          setIsThinking(false)
          setIsLoadingDirections(true)
          setTimeout(() => {
            setDirections(mockDirections)
            setIsLoadingDirections(false)
            setStage("directions")
          }, 1500)
        }
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [stage, currentMessageIndex])

  const handleIntentSubmit = useCallback((intent: string) => {
    setMessages([{ id: "user-1", type: "user", content: intent }])
    setStage("exploring")
    setIsThinking(true)
    setCurrentMessageIndex(0)
  }, [])

  const handleDimensionSelect = useCallback((dimensionId: string, option: string) => {
    setMissingDimensions(prev => prev.map(d => 
      d.id === dimensionId ? { ...d, selectedOption: option } : d
    ))
  }, [])

  const handleSelectDirection = useCallback((id: string) => {
    setSelectedDirection(id)
    setStage("evolution")
    setIsStreamingPrompt(true)
    
    const selectedDir = mockDirections.find(d => d.id === id)
    const basePrompt = `Cinematic portrait photography, single figure standing alone in urban rain, contemplative expression, face partially illuminated by neon signs, deep shadows and rich blacks, wet pavement reflecting cyan and magenta city lights, shallow depth of field, bokeh from distant traffic, ${selectedDir?.title.toLowerCase()} aesthetic, 35mm film grain, moody atmosphere, nighttime urban setting, high contrast lighting, photorealistic, detailed skin texture, rain droplets visible on clothing, steam rising from street vents --ar 2:3 --style raw --v 6`
    
    const newVersion: PromptVersion = {
      id: "v1",
      version: 1,
      label: `Initial ${selectedDir?.title || "interpretation"}`,
      content: basePrompt,
      timestamp: new Date()
    }
    
    setPromptVersions([newVersion])
    setCurrentPromptVersion(newVersion)
    
    setTimeout(() => setIsStreamingPrompt(false), basePrompt.length * 12 + 500)
  }, [])

  const handleSteeringChange = useCallback((id: string, value: number) => {
    setSteeringSliders(prev => prev.map(s => 
      s.id === id ? { ...s, value } : s
    ))
  }, [])

  const handleApplyRefinements = useCallback(() => {
    if (!currentPromptVersion) return
    
    setIsStreamingPrompt(true)
    
    const additions = []
    const styleValue = steeringSliders.find(s => s.id === "style")?.value || 0.5
    const moodValue = steeringSliders.find(s => s.id === "mood")?.value || 0.5
    
    if (styleValue > 0.6) additions.push("dramatic cinematic lighting")
    if (moodValue > 0.5) additions.push("ethereal dreamlike atmosphere")
    
    const selectedDims = missingDimensions.filter(d => d.selectedOption)
    selectedDims.forEach(d => {
      additions.push(d.selectedOption!.toLowerCase())
    })
    
    const refinedPrompt = currentPromptVersion.content + (additions.length > 0 
      ? `, ${additions.join(", ")}` 
      : "")
    
    const newVersion: PromptVersion = {
      id: `v${promptVersions.length + 1}`,
      version: promptVersions.length + 1,
      label: "Refined with steering adjustments",
      content: refinedPrompt,
      additions,
      timestamp: new Date()
    }
    
    setPromptVersions(prev => [...prev, newVersion])
    setCurrentPromptVersion(newVersion)
    
    setTimeout(() => setIsStreamingPrompt(false), 2000)
  }, [currentPromptVersion, promptVersions.length, steeringSliders, missingDimensions])

  const handleCopyPrompt = useCallback(() => {
    if (currentPromptVersion) {
      navigator.clipboard.writeText(currentPromptVersion.content)
    }
  }, [currentPromptVersion])

  const showExploration = stage !== "input"
  const showDirections = stage === "directions" || stage === "evolution"
  const showEvolution = stage === "evolution"

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient accents */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-chart-5/3 rounded-full blur-[100px]" />
      </div>

      {/* Main Content */}
      <main className="relative h-screen flex">
        
        {/* Stage 1: Conversation / Intent */}
        <div className={cn(
          "h-full flex flex-col p-8 transition-all duration-700 ease-out",
          showExploration ? "w-[380px] border-r border-border/20" : "w-full max-w-2xl mx-auto justify-center"
        )}>
          {stage === "input" ? (
            <div className="max-w-md mx-auto w-full">
              <IntentInput
                onSubmit={handleIntentSubmit}
                isProcessing={false}
                examplePrompt={examplePrompt}
              />
              
              {/* Tagline */}
              <p className="mt-8 text-center text-sm text-muted-foreground/60 leading-relaxed">
                Transform vague creative intent into refined, controllable prompts through collaborative AI exploration.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                </div>
                <span className="text-sm font-medium text-foreground">Exploring</span>
              </div>
              
              <ConversationStream
                messages={messages}
                isThinking={isThinking}
              />
            </div>
          )}
        </div>

        {/* Stage 2: Exploration Workspace */}
        {showExploration && (
          <div className={cn(
            "h-full flex flex-col p-8 transition-all duration-700 ease-out overflow-y-auto scrollbar-hide",
            showEvolution ? "w-[420px] border-r border-border/20" : "flex-1"
          )}>
            <div className="space-y-8">
              <ExplorationWorkspace
                detectedThemes={detectedThemes}
                emotionalSignals={emotionalSignals}
                missingDimensions={missingDimensions}
                onDimensionSelect={handleDimensionSelect}
                isVisible={detectedThemes.length > 0}
              />
              
              {showDirections && (
                <div className={cn(
                  "transition-all duration-500",
                  !showEvolution && "max-w-2xl"
                )}>
                  <DirectionCards
                    directions={directions}
                    selectedId={selectedDirection}
                    onSelect={handleSelectDirection}
                    isLoading={isLoadingDirections}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stage 3: Prompt Evolution */}
        {showEvolution && (
          <div className="flex-1 h-full flex flex-col p-8 overflow-hidden">
            <div className="flex-1 min-h-0">
              <PromptEvolution
                versions={promptVersions}
                currentVersion={currentPromptVersion}
                isStreaming={isStreamingPrompt}
                isVisible={true}
                onCopy={handleCopyPrompt}
              />
            </div>
            
            <div className="pt-6 border-t border-border/20 mt-6">
              <SemanticSteering
                sliders={steeringSliders}
                onChange={handleSteeringChange}
                onApply={handleApplyRefinements}
                isVisible={true}
                disabled={isStreamingPrompt}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
