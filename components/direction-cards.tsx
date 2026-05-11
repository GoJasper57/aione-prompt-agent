"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles } from "lucide-react"
import { SkeletonCard } from "./loading-states"

export interface Direction {
  id: string
  title: string
  description: string
  moodTags: string[]
  confidence: number
}

interface DirectionCardProps {
  direction: Direction
  isSelected: boolean
  onSelect: () => void
}

function DirectionCard({ direction, isSelected, onSelect }: DirectionCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative w-full text-left rounded-2xl border p-5 transition-all duration-300",
        "hover:translate-y-[-2px]",
        isSelected 
          ? "border-primary/50 bg-primary/5 glow-accent" 
          : "border-border/50 bg-card/30 hover:border-border hover:bg-card/50"
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}

      {/* Preview placeholder */}
      <div className={cn(
        "h-24 rounded-xl mb-4 flex items-center justify-center",
        "bg-gradient-to-br from-secondary/50 to-secondary/20",
        "border border-border/30"
      )}>
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          "bg-primary/10"
        )}>
          <Sparkles className={cn(
            "w-5 h-5",
            isSelected ? "text-primary" : "text-muted-foreground"
          )} />
        </div>
      </div>

      {/* Content */}
      <h4 className={cn(
        "font-semibold mb-2 transition-colors",
        isSelected ? "text-foreground" : "text-foreground/80"
      )}>
        {direction.title}
      </h4>
      
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {direction.description}
      </p>

      {/* Tags and Confidence */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {direction.moodTags.slice(0, 2).map((tag) => (
            <Badge 
              key={tag}
              variant="secondary"
              className="rounded-md bg-secondary/50 text-secondary-foreground/70 border-0 text-[10px] px-2 py-0.5"
            >
              {tag}
            </Badge>
          ))}
        </div>
        
        {/* Confidence indicator */}
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={cn(
                  "w-1 h-3 rounded-full transition-colors",
                  level <= Math.round(direction.confidence * 5)
                    ? "bg-primary"
                    : "bg-border"
                )}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {Math.round(direction.confidence * 100)}%
          </span>
        </div>
      </div>
    </button>
  )
}

interface DirectionCardsProps {
  directions: Direction[]
  selectedId: string | null
  onSelect: (id: string) => void
  isLoading: boolean
}

export function DirectionCards({ 
  directions, 
  selectedId, 
  onSelect, 
  isLoading 
}: DirectionCardsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Possible Creative Directions</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (directions.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Possible Creative Directions</h3>
        <div className="rounded-2xl border border-border/30 border-dashed bg-card/20 p-12 text-center">
          <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Directions will appear here after analysis
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Possible Creative Directions</h3>
        <span className="text-xs text-muted-foreground">
          {directions.length} directions found
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {directions.map((direction) => (
          <DirectionCard
            key={direction.id}
            direction={direction}
            isSelected={selectedId === direction.id}
            onSelect={() => onSelect(direction.id)}
          />
        ))}
      </div>
    </div>
  )
}
