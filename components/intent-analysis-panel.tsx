"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Target, AlertCircle, Lightbulb } from "lucide-react"
import { Shimmer } from "./loading-states"

interface IntentAnalysis {
  detectedMood: string[]
  missingDimensions: string[]
  possibleDirections: string[]
}

interface IntentAnalysisPanelProps {
  analysis: IntentAnalysis | null
  isLoading: boolean
}

export function IntentAnalysisPanel({ analysis, isLoading }: IntentAnalysisPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <h3 className="text-sm font-medium text-foreground/60">Intent Analysis</h3>
        <div className="rounded-2xl border border-border/50 bg-card/30 p-5 space-y-5">
          <Shimmer lines={2} />
          <Shimmer lines={2} />
          <Shimmer lines={3} />
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground/60">Intent Analysis</h3>
        <div className="rounded-2xl border border-border/30 border-dashed bg-card/20 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Enter a prompt and click analyze to see insights
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground/60">Intent Analysis</h3>
      
      <div className="rounded-2xl border border-border/50 bg-card/30 p-5 space-y-5">
        {/* Detected Mood */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Target className="w-3.5 h-3.5" />
            Detected Mood
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.detectedMood.map((mood) => (
              <Badge 
                key={mood}
                variant="secondary"
                className="rounded-lg bg-primary/10 text-primary border-0 text-xs"
              >
                {mood}
              </Badge>
            ))}
          </div>
        </div>

        {/* Missing Dimensions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <AlertCircle className="w-3.5 h-3.5" />
            Missing Dimensions
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.missingDimensions.map((dim) => (
              <Badge 
                key={dim}
                variant="secondary"
                className="rounded-lg bg-amber-500/10 text-amber-400 border-0 text-xs"
              >
                {dim}
              </Badge>
            ))}
          </div>
        </div>

        {/* Possible Directions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Lightbulb className="w-3.5 h-3.5" />
            Possible Directions
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.possibleDirections.map((dir) => (
              <Badge 
                key={dir}
                variant="secondary"
                className="rounded-lg bg-secondary text-secondary-foreground border-0 text-xs"
              >
                {dir}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
