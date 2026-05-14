"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Send, Lightbulb } from "lucide-react"

// This component is evolving from an initial submission form into a persistent AI collaboration input dock.
// It now supports ongoing conversational interaction with the AI creative collaborator.

interface IntentInputProps {
  onSubmit: (intent: string) => void
  isProcessing: boolean
  examplePrompt?: string
  value?: string
  onChange?: (value: string) => void
}

export function IntentInput({ onSubmit, isProcessing, examplePrompt, value, onChange }: IntentInputProps) {
  const [internalValue, setInternalValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentValue = value !== undefined ? value : internalValue
  const setCurrentValue = onChange || setInternalValue

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [currentValue])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentValue.trim() && !isProcessing) {
      onSubmit(currentValue.trim())
    }
  }

  const handleUseExample = () => {
    if (examplePrompt) {
      setCurrentValue(examplePrompt)
    }
  }

  return (
    <div className="space-y-4">
      {/* Input Area */}
      <form onSubmit={handleSubmit}>
        <div className={cn(
          "relative rounded-2xl border transition-all duration-300",
          "bg-muted/20",
          isProcessing 
            ? "border-primary/30 glow-subtle" 
            : "border-border/40 focus-within:border-primary/40 focus-within:glow-subtle"
        )}>
          <textarea
            ref={textareaRef}
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            placeholder="Add another mood, layer, atmosphere, or refinement..."
            rows={3}
            className={cn(
              "w-full bg-transparent px-4 py-4 text-sm text-foreground",
              "placeholder:text-muted-foreground/50",
              "focus:outline-none resize-none"
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          
          <div className="flex items-center justify-between px-3 pb-3">
            <button
              type="button"
              onClick={handleUseExample}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors disabled:opacity-50"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Try example
            </button>
            
            <button
              type="submit"
              disabled={!currentValue.trim()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  Send
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
