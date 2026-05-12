"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Send, Sparkles, Lightbulb } from "lucide-react"

interface IntentInputProps {
  onSubmit: (intent: string) => void
  isProcessing: boolean
  examplePrompt?: string
}

export function IntentInput({ onSubmit, isProcessing, examplePrompt }: IntentInputProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [value])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && !isProcessing) {
      onSubmit(value.trim())
    }
  }

  const handleUseExample = () => {
    if (examplePrompt) {
      setValue(examplePrompt)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">AIONE</h1>
          <p className="text-xs text-muted-foreground">Prompt Agent</p>
        </div>
      </div>

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
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Describe your creative vision..."
            disabled={isProcessing}
            rows={3}
            className={cn(
              "w-full bg-transparent px-4 py-4 text-sm text-foreground",
              "placeholder:text-muted-foreground/50",
              "focus:outline-none resize-none",
              "disabled:opacity-60"
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
              disabled={!value.trim() || isProcessing}
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
                  Exploring...
                </>
              ) : (
                <>
                  Begin
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
