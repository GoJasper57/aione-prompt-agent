"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Copy, Check, ChevronDown, GitBranch } from "lucide-react"

export interface PromptVersion {
  id: string
  version: number
  label: string
  content: string
  additions?: string[]
  timestamp: Date
}

interface PromptEvolutionProps {
  versions: PromptVersion[]
  currentVersion: PromptVersion | null
  isStreaming: boolean
  isVisible: boolean
  onCopy: () => void
}

export function PromptEvolution({
  versions,
  currentVersion,
  isStreaming,
  isVisible,
  onCopy
}: PromptEvolutionProps) {
  const [copied, setCopied] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [displayedContent, setDisplayedContent] = useState("")
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isStreaming && currentVersion?.content) {
      let index = 0
      const interval = setInterval(() => {
        if (index < currentVersion.content.length) {
          setDisplayedContent(currentVersion.content.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
        }
      }, 12)
      return () => clearInterval(interval)
    } else if (currentVersion?.content) {
      setDisplayedContent(currentVersion.content)
    }
  }, [currentVersion?.content, isStreaming])

  const handleCopy = () => {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isVisible) return null

  return (
    <div className="h-full flex flex-col animate-slide-in-left opacity-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-foreground">Prompt Evolution</h2>
          {currentVersion && (
            <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary text-xs font-medium">
              V{currentVersion.version}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {versions.length > 1 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                showHistory
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              <GitBranch className="w-3.5 h-3.5" />
              History
              <ChevronDown className={cn(
                "w-3 h-3 transition-transform",
                showHistory && "rotate-180"
              )} />
            </button>
          )}
          
          <button
            onClick={handleCopy}
            disabled={!currentVersion}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-chart-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Version History */}
      {showHistory && versions.length > 1 && (
        <div className="mb-4 p-3 rounded-xl bg-muted/20 border border-border/30 animate-expand opacity-0">
          <div className="space-y-2">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-xs",
                  version.id === currentVersion?.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                )}
              >
                <span className="font-mono font-medium">V{version.version}</span>
                <span className="flex-1 truncate">{version.label}</span>
                {version.additions && version.additions.length > 0 && (
                  <span className="text-chart-3">+{version.additions.length}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Version Label */}
      {currentVersion && (
        <div className="mb-3 text-xs text-muted-foreground">
          {currentVersion.label}
        </div>
      )}

      {/* Prompt Content */}
      <div 
        ref={contentRef}
        className={cn(
          "flex-1 rounded-xl p-4 overflow-y-auto scrollbar-hide",
          "bg-muted/20 border border-border/30",
          "focus-within:border-primary/30 transition-colors"
        )}
      >
        {currentVersion ? (
          <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {displayedContent}
            {isStreaming && displayedContent.length < (currentVersion?.content?.length || 0) && (
              <span className="animate-blink text-primary">|</span>
            )}
            
            {/* Diff highlights for additions */}
            {!isStreaming && currentVersion.additions && currentVersion.additions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/30">
                <div className="text-xs text-muted-foreground mb-2">Recent additions:</div>
                <div className="space-y-1">
                  {currentVersion.additions.map((addition, i) => (
                    <div key={i} className="diff-add text-xs">
                      + {addition}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground/50 text-sm">
            Select a direction to generate prompt...
          </div>
        )}
      </div>
    </div>
  )
}
