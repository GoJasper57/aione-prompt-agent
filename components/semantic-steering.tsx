"use client"

import { cn } from "@/lib/utils"

interface SemanticSlider {
  id: string
  leftLabel: string
  rightLabel: string
  value: number // 0 to 1
}

interface SemanticSteeringProps {
  sliders: SemanticSlider[]
  onChange: (id: string, value: number) => void
  onApply: () => void
  isVisible: boolean
  disabled: boolean
}

export function SemanticSteering({
  sliders,
  onChange,
  onApply,
  isVisible,
  disabled
}: SemanticSteeringProps) {
  if (!isVisible) return null

  return (
    <div className="space-y-5 animate-fade-in opacity-0" style={{ animationDelay: '0.3s' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Steer Creative Direction
        </h3>
      </div>

      <div className="space-y-4">
        {sliders.map((slider, index) => (
          <div 
            key={slider.id}
            className="animate-fade-in opacity-0"
            style={{ animationDelay: `${0.4 + index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={cn(
                "text-xs transition-colors",
                slider.value < 0.4 ? "text-primary" : "text-muted-foreground"
              )}>
                {slider.leftLabel}
              </span>
              <span className={cn(
                "text-xs transition-colors",
                slider.value > 0.6 ? "text-primary" : "text-muted-foreground"
              )}>
                {slider.rightLabel}
              </span>
            </div>
            
            <div className="relative">
              <div className="h-1.5 rounded-full bg-muted/40" />
              <div 
                className="absolute top-0 left-0 h-1.5 rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all"
                style={{ width: `${slider.value * 100}%` }}
              />
              <input
                type="range"
                min={0}
                max={100}
                value={slider.value * 100}
                onChange={(e) => onChange(slider.id, parseInt(e.target.value) / 100)}
                disabled={disabled}
                className={cn(
                  "absolute top-0 left-0 w-full h-1.5 opacity-0 cursor-pointer",
                  disabled && "cursor-not-allowed"
                )}
              />
              {/* Thumb indicator */}
              <div 
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full",
                  "bg-primary border-2 border-background",
                  "transition-all shadow-lg",
                  disabled && "opacity-50"
                )}
                style={{ left: `calc(${slider.value * 100}% - 6px)` }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onApply}
        disabled={disabled}
        className={cn(
          "w-full py-2.5 rounded-xl text-sm font-medium transition-all",
          "bg-primary/10 text-primary border border-primary/30",
          "hover:bg-primary/20 hover:border-primary/50",
          "disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        Apply Refinements
      </button>
    </div>
  )
}
