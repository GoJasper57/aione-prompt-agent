"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Copy, Check } from "lucide-react"
import { parsePromptToFragments } from "@/lib/prompt-parser"
import { getAlternativesForFragment } from "@/lib/semantic-alternatives"
import { PromptFragment, PromptVersion } from "@/types/ai-workspace"

interface PromptEvolutionProps {
  initialPrompt: string | null
  initialLabel: string | null
  isVisible: boolean
}

const checkpointLabels = [
  "Refined direction",
  "Atmospheric adjustment",
  "Tonal shift",
  "Creative evolution",
  "Mood refinement"
]

export function PromptEvolution({ initialPrompt, initialLabel, isVisible }: PromptEvolutionProps) {
  const [promptVersions, setPromptVersions] = useState<PromptVersion[]>([])
  const [activeVersion, setActiveVersion] = useState<string | null>(null)
  const [workingFragments, setWorkingFragments] = useState<PromptFragment[]>([])
  const [copied, setCopied] = useState(false)
  const [hoveredFragment, setHoveredFragment] = useState<string | null>(null)
  const [expandedFragment, setExpandedFragment] = useState<string | null>(null)
  const [recentlyChanged, setRecentlyChanged] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [promptPhase, setPromptPhase] = useState(0)

  useEffect(() => {
    if (!initialPrompt) {
      setPromptVersions([])
      setActiveVersion(null)
      setWorkingFragments([])
      setHasUnsavedChanges(false)
      return
    }

    const fragments = parsePromptToFragments(initialPrompt)
    setPromptVersions([
      {
        id: "v1",
        label: `Initial ${initialLabel ?? "direction"} direction`,
        fragments,
        timestamp: "Just now",
        isCheckpoint: true
      }
    ])
    setActiveVersion("v1")
    setWorkingFragments(fragments)
    setHasUnsavedChanges(false)
    setExpandedFragment(null)
    setRecentlyChanged(null)
  }, [initialPrompt, initialLabel])

  useEffect(() => {
    if (!isVisible || !initialPrompt) {
      setPromptPhase(0)
      return
    }

    const timers = [
      setTimeout(() => setPromptPhase(1), 200),
      setTimeout(() => setPromptPhase(2), 400),
    ]

    return () => timers.forEach(clearTimeout)
  }, [isVisible, initialPrompt])

  const currentVersion = promptVersions.find(v => v.id === activeVersion) ?? null

  const getCurrentFragments = (): PromptFragment[] => {
    if (workingFragments.length > 0) return workingFragments
    if (currentVersion) return currentVersion.fragments
    return []
  }

  const getPromptString = () => getCurrentFragments().map(fragment => fragment.text).join("")

  const handleFragmentChange = (fragmentId: string, newText: string) => {
    const currentFragments = getCurrentFragments()
    const updatedFragments = currentFragments.map(fragment =>
      fragment.id === fragmentId
        ? { ...fragment, text: newText, alternatives: getAlternativesForFragment(newText) }
        : fragment
    )

    setWorkingFragments(updatedFragments)
    setHasUnsavedChanges(true)
    setExpandedFragment(null)
    setRecentlyChanged(fragmentId)
    setTimeout(() => setRecentlyChanged(null), 1500)
  }

  const handleSaveCheckpoint = () => {
    if (!hasUnsavedChanges || workingFragments.length === 0) return

    const newVersionId = `v${promptVersions.length + 1}`
    const label = checkpointLabels[promptVersions.length % checkpointLabels.length]

    setPromptVersions(prev => [
      ...prev,
      {
        id: newVersionId,
        label,
        fragments: workingFragments,
        timestamp: "Just now",
        isCheckpoint: true
      }
    ])

    setActiveVersion(newVersionId)
    setHasUnsavedChanges(false)
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(getPromptString())
    setCopied(true)
    if (hasUnsavedChanges) {
      handleSaveCheckpoint()
    }
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isVisible) return null

  const currentFragments = getCurrentFragments()

  return (
    <div className="h-full flex flex-col animate-slide-in-left opacity-0">
      <div className={cn(
        "transition-all duration-500",
        promptPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium text-foreground">Prompt Evolution</h2>
            {currentVersion && (
              <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary text-xs font-medium">
                {currentVersion.label.includes("Initial") ? "V1" : `V${promptVersions.findIndex(v => v.id === currentVersion.id) + 1}`}
              </span>
            )}
          </div>

          <button
            onClick={handleCopyPrompt}
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

      <div className={cn(
        "transition-all duration-500",
        promptPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <div className="relative rounded-2xl bg-muted/15 border border-border/40 p-6 group">
          <p className="text-sm leading-[2] text-foreground">
            {currentFragments.length > 0 ? (
              currentFragments.map(fragment => {
                if (!fragment.isEditable) {
                  return <span key={fragment.id}>{fragment.text}</span>
                }

                const isHovered = hoveredFragment === fragment.id
                const isExpanded = expandedFragment === fragment.id
                const wasChanged = recentlyChanged === fragment.id

                return (
                  <span key={fragment.id} className="relative inline">
                    <button
                      onMouseEnter={() => setHoveredFragment(fragment.id)}
                      onMouseLeave={() => !isExpanded && setHoveredFragment(null)}
                      onClick={() => setExpandedFragment(isExpanded ? null : fragment.id)}
                      className={cn(
                        "relative px-1.5 -mx-0.5 rounded transition-all duration-300 bg-primary/10 border-b-2 border-primary/30 hover:bg-primary/20 hover:border-primary/50",
                        isExpanded && "bg-primary/25 border-primary/60 ring-1 ring-primary/30",
                        wasChanged && "animate-pulse bg-chart-4/20 border-chart-4/40"
                      )}
                    >
                      <span className={cn(
                        "transition-colors duration-300",
                        isHovered || isExpanded ? "text-primary" : "text-primary/90"
                      )}>
                        {fragment.text}
                      </span>
                    </button>

                    {isExpanded && fragment.alternatives && (
                      <>
                        <span className="fixed inset-0 z-40" onClick={() => setExpandedFragment(null)} />
                        <span className="absolute z-50 left-0 top-full mt-2 animate-expand">
                          <span className="flex flex-col gap-0.5 p-3 rounded-xl bg-popover border border-border shadow-2xl min-w-[260px]">
                            <span className="px-2 py-1.5 text-xs text-muted-foreground">
                              Reimagine this element
                            </span>
                            {fragment.alternatives.map(alt => (
                              <button
                                key={alt}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleFragmentChange(fragment.id, alt)
                                }}
                                className="px-3 py-2.5 rounded-lg text-sm text-left transition-all hover:bg-primary/15 hover:text-primary text-foreground"
                              >
                                {alt}
                              </button>
                            ))}
                          </span>
                        </span>
                      </>
                    )}
                  </span>
                )
              })
            ) : (
              <span className="text-sm text-muted-foreground">
                Select an interpretation to generate prompt content.
              </span>
            )}
          </p>

          <div className="absolute top-4 right-4 flex items-center gap-2">
            {hasUnsavedChanges && (
              <button
                onClick={handleSaveCheckpoint}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <span className="text-[10px]">Save</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={cn(
        "space-y-4 transition-all duration-500",
        promptPhase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Saved Directions</span>
        </div>

        <div className="relative pl-5 border-l-2 border-border/40 space-y-3">
          {promptVersions.filter(v => v.isCheckpoint).map((version, index, filtered) => {
            const isActive = activeVersion === version.id
            const isLatest = index === filtered.length - 1

            return (
              <button
                key={version.id}
                onClick={() => {
                  setActiveVersion(version.id)
                  setWorkingFragments(version.fragments)
                  setHasUnsavedChanges(false)
                }}
                className={cn(
                  "relative w-full text-left pl-4 py-2.5 rounded-r-lg transition-all",
                  isActive ? "bg-primary/10" : "hover:bg-muted/30"
                )}
              >
                <div className={cn(
                  "absolute -left-[25px] top-3.5 w-3.5 h-3.5 rounded-full border-2 transition-colors",
                  isActive ? "bg-primary border-primary" : "bg-background border-border"
                )} />
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm font-medium",
                        isActive ? "text-primary" : "text-foreground"
                      )}>
                        {index + 1}
                      </span>
                      {isLatest && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{version.label}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{version.timestamp}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
