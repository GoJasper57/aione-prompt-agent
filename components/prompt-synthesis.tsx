"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Copy, RefreshCw, Check, FileCode } from "lucide-react"
import { Shimmer } from "./loading-states"

interface PromptSynthesisProps {
  prompt: string
  isLoading: boolean
  isStreaming: boolean
  onRegenerate: () => void
}

export function PromptSynthesis({ 
  prompt, 
  isLoading,
  isStreaming,
  onRegenerate 
}: PromptSynthesisProps) {
  const [copied, setCopied] = useState(false)
  const [displayedPrompt, setDisplayedPrompt] = useState("")
  const textRef = useRef<HTMLPreElement>(null)

  // Streaming text effect
  useEffect(() => {
    if (isStreaming && prompt) {
      let index = 0
      const interval = setInterval(() => {
        if (index <= prompt.length) {
          setDisplayedPrompt(prompt.slice(0, index))
          index++
        } else {
          clearInterval(interval)
        }
      }, 15)
      return () => clearInterval(interval)
    } else {
      setDisplayedPrompt(prompt)
    }
  }, [prompt, isStreaming])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground/80">Synthesized Prompt</h3>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/30 p-5">
          <Shimmer lines={5} />
        </div>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground/60">Synthesized Prompt</h3>
        </div>
        <div className="rounded-2xl border border-border/30 border-dashed bg-card/20 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Your refined prompt will appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground/80">Synthesized Prompt</h3>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={onRegenerate}
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="relative rounded-2xl border border-border/50 bg-[#0d0d12] overflow-hidden">
        <pre 
          ref={textRef}
          className={cn(
            "p-5 text-sm font-mono text-foreground/90 whitespace-pre-wrap leading-relaxed",
            "max-h-[200px] overflow-y-auto"
          )}
        >
          {displayedPrompt}
          {isStreaming && displayedPrompt.length < prompt.length && (
            <span className="inline-block w-2 h-4 bg-primary ml-0.5 animate-pulse" />
          )}
        </pre>
      </div>
    </div>
  )
}
