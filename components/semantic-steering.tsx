"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { clarificationFramework } from "@/data/clarification-framework"
import { vibeInterpretations } from "@/data/vibe-interpretations"
import { PromptAnalysis } from "@/lib/intelligence/analyzePrompt"
import { getRelevantVibes } from "@/lib/intelligence/getRelevantVibes"
import { ClarificationDimension } from "@/types/ai-workspace"

interface SemanticSteeringProps {
  isVisible: boolean
  currentPrompt: string
  analysis: PromptAnalysis | null
  onSelectDirection: (direction: { promptTemplate: string; label: string } | null) => void
}

const analyzedDimensionMeta: Record<string, { label: string; description: string }> = {
  environment: { label: "Environment", description: "Where this takes place" },
  character: { label: "Character", description: "Who or what is present" },
  emotion: { label: "Emotion", description: "The feeling it carries" },
  motion: { label: "Motion", description: "How stillness or movement behaves" },
  materiality: { label: "Materiality", description: "What surfaces and forms are made of" },
  atmosphere: { label: "Atmosphere", description: "The surrounding sensory mood" },
  worldLogic: { label: "World Logic", description: "The rules shaping the idea" },
  time: { label: "Time", description: "When or what era it inhabits" },
  scale: { label: "Scale", description: "How intimate or vast it feels" },
  interaction: { label: "Interaction", description: "How elements relate or respond" }
}

const buildAnalyzedDimensions = (analysis: PromptAnalysis): ClarificationDimension[] =>
  Object.entries(analysis.dimensionAnalysis)
    .filter(([, strength]) => strength === "missing" || strength === "weak")
    .map(([dimension]) => ({
      id: dimension,
      label: analyzedDimensionMeta[dimension]?.label ?? dimension,
      description: analyzedDimensionMeta[dimension]?.description ?? "Creative steering direction",
      isPresent: false,
      options: analysis.steeringSuggestions[dimension]?.slice(0, 4) ?? []
    }))

export function SemanticSteering({ isVisible, currentPrompt, analysis, onSelectDirection }: SemanticSteeringProps) {
  const [clarificationDimensions, setClarificationDimensions] = useState<ClarificationDimension[]>(clarificationFramework)
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null)
  const [dimensionMenuPosition, setDimensionMenuPosition] = useState<{ left: number; top: number } | null>(null)
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null)
  const [vibeOffset, setVibeOffset] = useState(0)
  const [explorationPhase, setExplorationPhase] = useState(0)

  const buildPromptDirection = (vibeId: string | null, dimensions: ClarificationDimension[]) => {
    const vibe = relevantVibes.find(v => v.id === vibeId)
    const fallbackVibe = vibeInterpretations[0]
    const selectedOptions = dimensions
      .filter(dimension => dimension.selectedOption)
      .map(dimension => `[${dimension.selectedOption}]`)
    const vibePhrases = vibe?.steeringPhrases.map(phrase => `[${phrase}]`) ?? []
    const basePrompt = (currentPrompt || fallbackVibe.promptTemplate).replace(/[.,\s]+$/, "")
    const promptPhrases = [...selectedOptions, ...vibePhrases]

    return {
      label: vibe?.title ?? fallbackVibe.label,
      promptTemplate: promptPhrases.length > 0
        ? `${basePrompt}, ${promptPhrases.join(", ")}.`
        : `${basePrompt}.`
    }
  }

  const selectedSteeringTags = clarificationDimensions
    .flatMap(dimension => dimension.selectedOption ? [dimension.selectedOption] : [])
  const relevantVibes = analysis
    ? getRelevantVibes({
        prompt: currentPrompt,
        dimensionAnalysis: analysis.dimensionAnalysis,
        semanticConcepts: analysis.semanticConcepts,
        selectedSteeringTags,
        offset: vibeOffset
      })
    : []

  useEffect(() => {
    if (!isVisible) {
      setExplorationPhase(0)
      return
    }

    const timers = [
      setTimeout(() => setExplorationPhase(1), 300),
      setTimeout(() => setExplorationPhase(2), 600),
      setTimeout(() => setExplorationPhase(3), 1000),
    ]

    return () => timers.forEach(clearTimeout)
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return
    onSelectDirection(buildPromptDirection(selectedVibe, clarificationDimensions))
  }, [isVisible, currentPrompt, analysis, selectedVibe, clarificationDimensions, vibeOffset, onSelectDirection])

  useEffect(() => {
    if (!analysis) return

    setClarificationDimensions(prev => {
      const previousSelections = new Map(prev.map(dimension => [dimension.id, dimension.selectedOption]))
      return buildAnalyzedDimensions(analysis).map(dimension => ({
        ...dimension,
        selectedOption: dimension.options?.includes(previousSelections.get(dimension.id) ?? "")
          ? previousSelections.get(dimension.id)
          : undefined
      }))
    })
    setSelectedVibe(null)
    setVibeOffset(0)
  }, [analysis])

  const handleDimensionSelect = (dimensionId: string, option: string) => {
    setClarificationDimensions(prev => {
      return prev.map(d =>
        d.id === dimensionId
          ? {
              ...d,
              selectedOption: d.selectedOption === option ? undefined : option,
              isPresent: d.selectedOption === option ? false : true
            }
          : d
      )
    })
    setExpandedDimension(null)
    setDimensionMenuPosition(null)
  }

  const handleDimensionMenuToggle = (dimensionId: string, element: HTMLButtonElement) => {
    if (expandedDimension === dimensionId) {
      setExpandedDimension(null)
      setDimensionMenuPosition(null)
      return
    }

    const rect = element.getBoundingClientRect()
    setExpandedDimension(dimensionId)
    setDimensionMenuPosition({ left: rect.left, top: rect.bottom + 8 })
  }

  const handleVibeSelect = (vibeId: string) => {
    const isCurrentlySelected = selectedVibe === vibeId
    const nextVibe = isCurrentlySelected ? null : vibeId
    setSelectedVibe(nextVibe)
  }

  const shapableDimensions = clarificationDimensions.filter(d => d.options)

  return (
    <div className={cn(
      "workspace-panel transition-all duration-700",
      isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className="workspace-panel-header">
        <div className={cn(
          "transition-all duration-500",
          explorationPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <h2 className="workspace-panel-title">Shape Your Vision</h2>
          <p className="workspace-panel-subtitle">
            Explore moods, atmospheres, and creative possibilities.
          </p>
        </div>
      </div>

      <div className="workspace-panel-section">
        <div className={cn(
          "workspace-panel-content transition-all duration-500 pb-8 border-b border-border/30",
          explorationPhase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <p className="workspace-section-title">
            Structural Dimensions
          </p>
          <div className="flex flex-wrap gap-3">
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
                  onClick={(event) => handleDimensionMenuToggle(dimension.id, event.currentTarget)}
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

                {expandedDimension === dimension.id && dimension.options && dimensionMenuPosition && createPortal(
                  <>
                    <div
                      className="workspace-overlay-backdrop fixed inset-0"
                      onClick={() => {
                        setExpandedDimension(null)
                        setDimensionMenuPosition(null)
                      }}
                    />
                    <div
                      className="workspace-overlay workspace-semantic-overlay fixed w-[210px] animate-expand"
                      style={{ left: dimensionMenuPosition.left, top: dimensionMenuPosition.top }}
                    >
                      <p className="workspace-semantic-overlay-title">
                        {dimension.description}
                      </p>
                      {dimension.options.map(option => (
                        <button
                          key={option}
                          onClick={() => handleDimensionSelect(dimension.id, option)}
                          className={cn(
                            "workspace-semantic-overlay-item",
                            dimension.selectedOption === option && "workspace-semantic-overlay-item-active"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </>,
                  document.body
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="workspace-panel-section">
        <div className={cn(
          "workspace-panel-content transition-all duration-500",
          explorationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <p className="workspace-section-title">
            Emotional Interpretations
          </p>

          <div className="grid gap-4 grid-cols-2">
            {relevantVibes.map((vibe, index) => {
              const isSelected = selectedVibe === vibe.id
              const isDimmed = selectedVibe && !isSelected

              return (
                <button
                  key={vibe.id}
                  onClick={() => handleVibeSelect(vibe.id)}
                  className={cn(
                    "workspace-interpretation-card text-left group",
                    isSelected && "ring-2 ring-primary/60 scale-[1.02]",
                    isDimmed && "opacity-30 scale-[0.97] saturate-50",
                    !isSelected && !isDimmed && "hover:scale-[1.02]"
                  )}
                  style={{ transitionDelay: `${index * 60}ms` }}
                >
                  <div className={cn(
                    "absolute inset-0 transition-transform duration-500 bg-cover bg-center",
                    isSelected ? "scale-105" : "group-hover:scale-105"
                  )}
                    style={{ backgroundImage: `url("${vibe.image}")` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className={cn(
                      "text-sm font-medium text-white mb-0.5 transition-colors",
                      isSelected && "text-white"
                    )}>
                      {vibe.title}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {vibe.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] text-white/70">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {relevantVibes.length > 0 && (
            <div className="pt-4">
              <button
                onClick={() => {
                  setSelectedVibe(null)
                  setVibeOffset(prev => prev + 8)
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Find More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
