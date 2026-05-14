"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { clarificationFramework } from "@/data/clarification-framework"
import { vibeInterpretations } from "@/data/vibe-interpretations"
import { ClarificationDimension } from "@/types/ai-workspace"

interface SemanticSteeringProps {
  isVisible: boolean
  onSelectDirection: (direction: { promptTemplate: string; label: string } | null) => void
}

export function SemanticSteering({ isVisible, onSelectDirection }: SemanticSteeringProps) {
  const [clarificationDimensions, setClarificationDimensions] = useState<ClarificationDimension[]>(clarificationFramework)
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null)
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null)
  const [explorationPhase, setExplorationPhase] = useState(0)

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

  const handleDimensionSelect = (dimensionId: string, option: string) => {
    setClarificationDimensions(prev => prev.map(d =>
      d.id === dimensionId ? { ...d, selectedOption: option, isPresent: true } : d
    ))
    setExpandedDimension(null)
  }

  const handleVibeSelect = (vibeId: string) => {
    const isCurrentlySelected = selectedVibe === vibeId
    const selected = vibeInterpretations.find(v => v.id === vibeId)
    setSelectedVibe(isCurrentlySelected ? null : vibeId)
    onSelectDirection(isCurrentlySelected ? null : selected ? { promptTemplate: selected.promptTemplate, label: selected.label } : null)
  }

  const shapableDimensions = clarificationDimensions.filter(d => !d.isPresent && d.options)

  return (
    <div className={cn(
      "h-screen overflow-y-auto scrollbar-hide transition-all duration-700",
      isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className="p-8 space-y-10">
        <div className={cn(
          "transition-all duration-500",
          explorationPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <h2 className="text-xl font-semibold text-foreground mb-2">Shape Your Vision</h2>
          <p className="text-sm text-muted-foreground">
            Clarify and deepen the creative direction before you evolve the prompt.
          </p>
        </div>

        <div className={cn(
          "transition-all duration-500 pb-6 border-b border-border/30",
          explorationPhase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
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
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setExpandedDimension(null)} />
                    <div className="absolute z-50 left-0 top-full mt-2 min-w-[260px] p-3 rounded-xl bg-popover border border-border shadow-2xl animate-expand">
                      <p className="px-2 py-1.5 text-xs text-muted-foreground mb-2">
                        {dimension.description}
                      </p>
                      {dimension.options.map(option => (
                        <button
                          key={option}
                          onClick={() => handleDimensionSelect(dimension.id, option)}
                          className={cn(
                            "w-full px-3 py-2.5 rounded-lg text-sm text-left transition-all hover:bg-primary/15 hover:text-primary",
                            dimension.selectedOption === option ? "bg-primary/15 text-primary font-medium" : "text-foreground"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={cn(
          "transition-all duration-500",
          explorationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wide">
            Emotional Interpretations
          </p>

          <div className="grid gap-3 grid-cols-2">
            {vibeInterpretations.map((vibe, index) => {
              const isSelected = selectedVibe === vibe.id
              const isDimmed = selectedVibe && !isSelected
              const heightVariants = ["h-28", "h-32", "h-24", "h-30", "h-26", "h-34", "h-28", "h-32"]
              const height = heightVariants[index % heightVariants.length]

              return (
                <button
                  key={vibe.id}
                  onClick={() => handleVibeSelect(vibe.id)}
                  className={cn(
                    "relative text-left rounded-xl transition-all duration-500 overflow-hidden group",
                    height,
                    isSelected && "ring-2 ring-primary/60 scale-[1.02]",
                    isDimmed && "opacity-30 scale-[0.97] saturate-50",
                    !isSelected && !isDimmed && "hover:scale-[1.02]"
                  )}
                  style={{ transitionDelay: `${index * 60}ms` }}
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br transition-all duration-500",
                    vibe.gradient
                  )} />
                  <div className={cn(
                    "absolute w-24 h-24 rounded-full blur-2xl transition-opacity duration-500 bg-white/10",
                    vibe.accentPosition === "top-right" && "top-0 right-0 -translate-y-1/2 translate-x-1/2",
                    vibe.accentPosition === "top-left" && "top-0 left-0 -translate-y-1/2 -translate-x-1/2",
                    vibe.accentPosition === "center" && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                    vibe.accentPosition === "bottom" && "bottom-0 left-1/2 translate-y-1/2 -translate-x-1/2",
                    vibe.accentPosition === "bottom-left" && "bottom-0 left-0 translate-y-1/2 -translate-x-1/2",
                    isSelected ? "opacity-60" : "opacity-30 group-hover:opacity-50"
                  )} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
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
  )
}
