"use client"

import { useState, useCallback } from "react"
import { PromptInput } from "@/components/prompt-input"
import { ModePanel } from "@/components/mode-panel"
import { IntentAnalysisPanel } from "@/components/intent-analysis-panel"
import { DirectionCards, type Direction } from "@/components/direction-cards"
import { ExplorationPanel } from "@/components/exploration-panel"
import { ReasoningPanel } from "@/components/reasoning-panel"
import { PromptSynthesis } from "@/components/prompt-synthesis"
import { SteeringControls } from "@/components/steering-controls"
import { Sparkles } from "lucide-react"

// Mock data
const examplePrompt = "A moody portrait of a person standing in rain, looking contemplative, with city lights reflecting off wet surfaces"

const mockAnalysis = {
  detectedMood: ["Melancholic", "Contemplative", "Urban", "Cinematic"],
  missingDimensions: ["Lighting details", "Camera angle", "Time of day", "Color palette"],
  possibleDirections: ["Neo-noir aesthetic", "Documentary style", "Artistic blur", "High contrast"]
}

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
  },
  {
    id: "4",
    title: "High-Fashion Editorial",
    description: "Polished and dramatic with intentional composition. Rain as a design element, not just weather.",
    moodTags: ["Fashion", "Dramatic", "Composed"],
    confidence: 0.71
  }
]

const mockReasoning = [
  {
    title: "Visual Coherence",
    content: "The neo-noir aesthetic aligns perfectly with your mention of city lights and wet surfaces. This style naturally emphasizes reflections and creates the contemplative mood you described through its use of dramatic lighting contrasts."
  },
  {
    title: "Emotional Resonance",
    content: "Rain in urban settings carries inherent melancholy. By leaning into cinematic techniques like shallow depth of field and strategic color grading, we can amplify the contemplative feeling without making it feel heavy-handed."
  },
  {
    title: "Technical Compatibility",
    content: "This direction works well with current AI image generators. The specific lighting conditions (night, neon, wet surfaces) give the model clear guidance while leaving room for creative interpretation."
  }
]

const mockSynthesizedPrompt = `Cinematic portrait photography, single figure standing alone in urban rain, contemplative expression, face partially illuminated by neon signs, deep shadows and rich blacks, wet pavement reflecting cyan and magenta city lights, shallow depth of field, bokeh from distant traffic, neo-noir color grading, 35mm film grain, moody atmosphere, nighttime urban setting, high contrast lighting, photorealistic, detailed skin texture, rain droplets visible on clothing, steam rising from street vents --ar 2:3 --style raw --v 6`

export default function AIWorkspace() {
  const [prompt, setPrompt] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<typeof mockAnalysis | null>(null)
  const [directions, setDirections] = useState<Direction[]>([])
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null)
  const [reasoning, setReasoning] = useState<typeof mockReasoning>([])
  const [synthesizedPrompt, setSynthesizedPrompt] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [explorationItems, setExplorationItems] = useState<Array<{label: string, status: "complete" | "loading" | "pending"}>>([])
  const [steeringValues, setSteeringValues] = useState({
    cinematic: 0.7,
    detail: 0.6,
    realistic: 0.4,
    experimental: 0.3
  })

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true)
    setAnalysis(null)
    setDirections([])
    setSelectedDirection(null)
    setReasoning([])
    setSynthesizedPrompt("")
    
    // Simulate exploration steps
    setExplorationItems([
      { label: "Parsing intent keywords...", status: "loading" },
      { label: "Analyzing mood indicators", status: "pending" },
      { label: "Mapping creative dimensions", status: "pending" },
      { label: "Generating directions", status: "pending" }
    ])

    // Simulate step-by-step progress
    await new Promise(r => setTimeout(r, 800))
    setExplorationItems(prev => [
      { ...prev[0], status: "complete" },
      { ...prev[1], status: "loading" },
      prev[2],
      prev[3]
    ])

    await new Promise(r => setTimeout(r, 600))
    setExplorationItems(prev => [
      prev[0],
      { ...prev[1], status: "complete" },
      { ...prev[2], status: "loading" },
      prev[3]
    ])

    await new Promise(r => setTimeout(r, 700))
    setAnalysis(mockAnalysis)
    setExplorationItems(prev => [
      prev[0],
      prev[1],
      { ...prev[2], status: "complete" },
      { ...prev[3], status: "loading" }
    ])

    await new Promise(r => setTimeout(r, 900))
    setExplorationItems(prev => [
      prev[0],
      prev[1],
      prev[2],
      { ...prev[3], status: "complete" }
    ])
    setDirections(mockDirections)
    setIsAnalyzing(false)
  }, [])

  const handleUseExample = useCallback(() => {
    setPrompt(examplePrompt)
  }, [])

  const handleSelectDirection = useCallback((id: string) => {
    setSelectedDirection(id)
    setReasoning(mockReasoning)
    setIsStreaming(true)
    setSynthesizedPrompt(mockSynthesizedPrompt)
    
    // Reset streaming state after animation
    setTimeout(() => setIsStreaming(false), mockSynthesizedPrompt.length * 15 + 100)
  }, [])

  const handleRefine = useCallback(() => {
    if (!selectedDirection) return
    setIsStreaming(true)
    setSynthesizedPrompt(mockSynthesizedPrompt)
    setTimeout(() => setIsStreaming(false), mockSynthesizedPrompt.length * 15 + 100)
  }, [selectedDirection])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient accents */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">AIONE</h1>
              <p className="text-xs text-muted-foreground">Prompt Agent</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">v1.0.0</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-[1800px] mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column */}
          <div className="col-span-3 space-y-6">
            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6 space-y-6">
              <PromptInput
                value={prompt}
                onChange={setPrompt}
                onAnalyze={handleAnalyze}
                onUseExample={handleUseExample}
                isAnalyzing={isAnalyzing}
              />
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6">
              <ModePanel mode="exploration" />
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6">
              <IntentAnalysisPanel 
                analysis={analysis}
                isLoading={isAnalyzing && !analysis}
              />
            </div>
          </div>

          {/* Center Column */}
          <div className="col-span-6 space-y-6">
            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6">
              <DirectionCards
                directions={directions}
                selectedId={selectedDirection}
                onSelect={handleSelectDirection}
                isLoading={isAnalyzing && directions.length === 0}
              />
            </div>

            {explorationItems.length > 0 && (
              <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6">
                <ExplorationPanel 
                  items={explorationItems}
                  isActive={isAnalyzing}
                />
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="col-span-3 space-y-6">
            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6">
              <ReasoningPanel
                sections={reasoning}
                isLoading={false}
              />
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6">
              <PromptSynthesis
                prompt={synthesizedPrompt}
                isLoading={false}
                isStreaming={isStreaming}
                onRegenerate={handleRefine}
              />
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6">
              <SteeringControls
                values={steeringValues}
                onChange={setSteeringValues}
                onRefine={handleRefine}
                disabled={!selectedDirection}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
