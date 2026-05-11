"use client"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface ExplorationItem {
  label: string
  status: "complete" | "loading" | "pending"
}

interface ExplorationPanelProps {
  items: ExplorationItem[]
  isActive: boolean
}

export function ExplorationPanel({ items, isActive }: ExplorationPanelProps) {
  if (!isActive && items.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground/60">AI Exploration</h4>
      
      <div className="rounded-xl border border-border/30 bg-card/20 p-4 space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-300",
              item.status === "loading" && "bg-primary/5",
              item.status === "complete" && "opacity-60"
            )}
          >
            {/* Status indicator */}
            <div className="relative w-4 h-4 flex-shrink-0">
              {item.status === "loading" ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : item.status === "complete" ? (
                <div className="w-2 h-2 rounded-full bg-primary/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-border absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
            </div>
            
            <span className={cn(
              "text-sm transition-colors",
              item.status === "loading" ? "text-foreground" : "text-muted-foreground"
            )}>
              {item.label}
            </span>
            
            {/* Shimmer effect for loading */}
            {item.status === "loading" && (
              <div className="flex-1 h-1 rounded-full overflow-hidden bg-border/30 ml-2">
                <div className="h-full w-1/3 rounded-full bg-primary/50 animate-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
