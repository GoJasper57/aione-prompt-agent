"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Sparkles, Wand2 } from "lucide-react"

interface PromptInputProps {
  value: string
  onChange: (value: string) => void
  onAnalyze: () => void
  onUseExample: () => void
  isAnalyzing: boolean
}

export function PromptInput({ 
  value, 
  onChange, 
  onAnalyze, 
  onUseExample, 
  isAnalyzing 
}: PromptInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground/80">Your Intent</h3>
      </div>
      
      <div 
        className={cn(
          "relative rounded-2xl transition-all duration-300",
          isFocused && "glow-accent"
        )}
      >
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Describe what you want to create..."
          className={cn(
            "min-h-[140px] resize-none rounded-2xl border-border/50 bg-card/50 p-4",
            "text-foreground placeholder:text-muted-foreground/50",
            "focus:border-primary/50 focus:ring-1 focus:ring-primary/20",
            "transition-all duration-300"
          )}
        />
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onAnalyze}
          disabled={!value.trim() || isAnalyzing}
          className={cn(
            "flex-1 h-11 rounded-xl font-medium",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 transition-all duration-200",
            "disabled:opacity-50"
          )}
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Analyze Intent
            </span>
          )}
        </Button>
        
        <Button
          onClick={onUseExample}
          variant="outline"
          className={cn(
            "h-11 px-4 rounded-xl font-medium",
            "border-border/50 bg-secondary/50 text-secondary-foreground",
            "hover:bg-secondary hover:border-border transition-all duration-200"
          )}
        >
          Use Example
        </Button>
      </div>
    </div>
  )
}
