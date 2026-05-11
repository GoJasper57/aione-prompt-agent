"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Brain } from "lucide-react"
import { Shimmer } from "./loading-states"

interface ReasoningSection {
  title: string
  content: string
}

interface ReasoningPanelProps {
  sections: ReasoningSection[]
  isLoading: boolean
}

export function ReasoningPanel({ sections, isLoading }: ReasoningPanelProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground/80">Why this direction works</h3>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/30 p-5">
          <Shimmer lines={4} />
        </div>
      </div>
    )
  }

  if (sections.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground/60">Why this direction works</h3>
        </div>
        <div className="rounded-2xl border border-border/30 border-dashed bg-card/20 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Select a direction to see reasoning
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground/80">Why this direction works</h3>
      </div>
      
      <div className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden">
        {sections.map((section, index) => (
          <div key={index} className="border-b border-border/30 last:border-b-0">
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className={cn(
                "w-full flex items-center justify-between p-4 text-left",
                "hover:bg-secondary/20 transition-colors"
              )}
            >
              <span className="text-sm font-medium text-foreground/80">
                {section.title}
              </span>
              <ChevronDown 
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform duration-200",
                  expandedIndex === index && "rotate-180"
                )}
              />
            </button>
            
            {expandedIndex === index && (
              <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
