"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Sparkles } from "lucide-react"

interface MissingDimension {
  id: string
  label: string
  options: string[]
  selectedOption?: string
}

interface ExplorationWorkspaceProps {
  detectedThemes: string[]
  emotionalSignals: string[]
  missingDimensions: MissingDimension[]
  onDimensionSelect: (dimensionId: string, option: string) => void
  isVisible: boolean
}

export function ExplorationWorkspace({
  detectedThemes,
  emotionalSignals,
  missingDimensions,
  onDimensionSelect,
  isVisible
}: ExplorationWorkspaceProps) {
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null)

  if (!isVisible) return null

  return (
    <div className="space-y-6 animate-slide-in-right opacity-0">
      {/* Detected Themes */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Detected Themes
        </h3>
        <div className="flex flex-wrap gap-2">
          {detectedThemes.map((theme, index) => (
            <span
              key={theme}
              className="px-3 py-1.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 animate-fade-in opacity-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {theme}
            </span>
          ))}
        </div>
      </div>

      {/* Emotional Signals */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Emotional Signals
        </h3>
        <div className="flex flex-wrap gap-2">
          {emotionalSignals.map((signal, index) => (
            <span
              key={signal}
              className="px-3 py-1.5 rounded-full text-xs bg-chart-5/10 text-chart-5 border border-chart-5/20 animate-fade-in opacity-0"
              style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
            >
              {signal}
            </span>
          ))}
        </div>
      </div>

      {/* Missing Dimensions - Interactive */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Refine Dimensions
          </h3>
          <Sparkles className="w-3 h-3 text-primary animate-pulse-glow" />
        </div>
        
        <div className="space-y-2">
          {missingDimensions.map((dimension, index) => (
            <DimensionSelector
              key={dimension.id}
              dimension={dimension}
              isExpanded={expandedDimension === dimension.id}
              onToggle={() => setExpandedDimension(
                expandedDimension === dimension.id ? null : dimension.id
              )}
              onSelect={(option) => onDimensionSelect(dimension.id, option)}
              delay={index * 0.1 + 0.5}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function DimensionSelector({
  dimension,
  isExpanded,
  onToggle,
  onSelect,
  delay
}: {
  dimension: MissingDimension
  isExpanded: boolean
  onToggle: () => void
  onSelect: (option: string) => void
  delay: number
}) {
  return (
    <div 
      className="animate-fade-in opacity-0"
      style={{ animationDelay: `${delay}s` }}
    >
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all",
          "border",
          dimension.selectedOption
            ? "bg-primary/10 border-primary/30 text-foreground"
            : "bg-muted/30 border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
        )}
      >
        <span className="flex items-center gap-2">
          {dimension.label}
          {dimension.selectedOption && (
            <span className="text-primary text-xs">
              {dimension.selectedOption}
            </span>
          )}
        </span>
        <ChevronDown 
          className={cn(
            "w-4 h-4 transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>
      
      {isExpanded && (
        <div className="mt-2 p-2 rounded-xl bg-muted/20 border border-border/30 animate-expand opacity-0">
          <div className="grid grid-cols-2 gap-2">
            {dimension.options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onSelect(option)
                  onToggle()
                }}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs text-left transition-all",
                  "hover:bg-primary/10 hover:text-primary",
                  dimension.selectedOption === option
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "bg-muted/30 text-muted-foreground border border-transparent"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
