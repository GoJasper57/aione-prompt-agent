"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface Direction {
  id: string
  title: string
  description: string
  moodTags: string[]
  confidence: number
}

interface DirectionCardsProps {
  directions: Direction[]
  selectedId: string | null
  onSelect: (id: string) => void
  isLoading: boolean
}

export function DirectionCards({ directions, selectedId, onSelect, isLoading }: DirectionCardsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Exploring Directions
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl animate-shimmer"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (directions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground/50 text-sm">
        Directions will appear here...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Creative Directions
      </h3>
      
      <div className="space-y-3">
        {directions.map((direction, index) => {
          const isSelected = selectedId === direction.id
          const isDimmed = selectedId && !isSelected

          return (
            <button
              key={direction.id}
              onClick={() => onSelect(direction.id)}
              className={cn(
                "w-full text-left rounded-2xl p-5 transition-all duration-500",
                "border",
                "animate-fade-in opacity-0",
                isSelected && [
                  "bg-gradient-to-br from-primary/15 to-primary/5",
                  "border-primary/40",
                  "glow-subtle",
                  "scale-[1.02]"
                ],
                isDimmed && "dim-inactive",
                !isSelected && !isDimmed && [
                  "bg-muted/20 border-border/40",
                  "hover:bg-muted/40 hover:border-border/60"
                ]
              )}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className={cn(
                      "font-medium transition-colors",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {direction.title}
                    </h4>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-expand opacity-0">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <p className={cn(
                    "text-sm leading-relaxed transition-colors",
                    isSelected ? "text-foreground/80" : "text-muted-foreground"
                  )}>
                    {direction.description}
                  </p>
                  
                  <div className="flex items-center gap-3 pt-1">
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
                    
                    {/* Confidence indicator */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <div className="w-16 h-1 rounded-full bg-muted/50 overflow-hidden">
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
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
