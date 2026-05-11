"use client"

import { cn } from "@/lib/utils"
import { Compass, RefreshCw } from "lucide-react"

interface ModePanelProps {
  mode: "exploration" | "recovery"
}

export function ModePanel({ mode }: ModePanelProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground/60">Current Mode</h3>
      
      <div 
        className={cn(
          "relative inline-flex items-center gap-2 px-4 py-2 rounded-xl",
          "border border-border/50 bg-card/50",
          "transition-all duration-300"
        )}
      >
        {/* Glow effect */}
        <div 
          className={cn(
            "absolute inset-0 rounded-xl opacity-20 blur-sm animate-pulse-glow",
            mode === "exploration" ? "bg-primary" : "bg-amber-500"
          )}
        />
        
        <div className="relative flex items-center gap-2">
          {mode === "exploration" ? (
            <Compass className="w-4 h-4 text-primary" />
          ) : (
            <RefreshCw className="w-4 h-4 text-amber-500" />
          )}
          <span className={cn(
            "text-sm font-medium",
            mode === "exploration" ? "text-primary" : "text-amber-500"
          )}>
            {mode === "exploration" ? "Exploration Mode" : "Recovery Mode"}
          </span>
        </div>
      </div>
    </div>
  )
}
