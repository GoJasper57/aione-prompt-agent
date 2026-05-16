"use client"

import { useCallback, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { PromptEvolution } from "@/components/prompt-evolution"
import { SemanticSteering } from "@/components/semantic-steering"
import { PromptAnalysis } from "@/lib/intelligence/analyzePrompt"
import { WorkspaceSession } from "@/types/ai-workspace"

interface WorkspaceDirection {
  promptTemplate: string
  label: string
}

interface CreativeWorkspaceProps {
  isVisible: boolean
  currentPrompt: string
  analysis: PromptAnalysis | null
  archivedSessions: WorkspaceSession[]
  onPromptSnapshotChange: (promptSnapshot: string) => void
}

export function CreativeWorkspace({
  isVisible,
  currentPrompt,
  analysis,
  archivedSessions,
  onPromptSnapshotChange
}: CreativeWorkspaceProps) {
  const [selectedDirection, setSelectedDirection] = useState<WorkspaceDirection | null>(null)
  const [showPromptWorkspace, setShowPromptWorkspace] = useState(false)
  const [promptAnalysis, setPromptAnalysis] = useState<PromptAnalysis | null>(analysis)
  const handleSelectDirection = useCallback((value: WorkspaceDirection | null) => {
    setSelectedDirection(value)
  }, [])

  useEffect(() => {
    if (!isVisible) {
      setSelectedDirection(null)
      setShowPromptWorkspace(false)
      return
    }

    const timer = setTimeout(() => {
      setShowPromptWorkspace(true)
    }, 420)

    return () => clearTimeout(timer)
  }, [isVisible])

  useEffect(() => {
    setPromptAnalysis(analysis)
  }, [analysis])

  useEffect(() => {
    if (selectedDirection?.promptTemplate) {
      onPromptSnapshotChange(selectedDirection.promptTemplate)
    }
  }, [selectedDirection, onPromptSnapshotChange])

  return (
    <div className="workspace-shell">
      <div className={cn(
        "workspace-side-panel",
        isVisible ? "w-[56%] min-w-[500px]" : "w-0 opacity-0 pointer-events-none"
      )}>
        <SemanticSteering
          isVisible={isVisible}
          currentPrompt={currentPrompt}
          analysis={promptAnalysis}
          onSelectDirection={handleSelectDirection}
        />
      </div>

      <div className={cn(
        "workspace-main-panel",
        showPromptWorkspace
          ? "w-[44%] min-w-[420px] opacity-100 translate-x-0"
          : "w-0 opacity-0 translate-x-8 pointer-events-none"
      )}>
        <PromptEvolution
          initialPrompt={selectedDirection?.promptTemplate ?? null}
          initialLabel={selectedDirection?.label ?? null}
          isVisible={showPromptWorkspace}
          archivedSessions={archivedSessions}
          onPromptSnapshotChange={onPromptSnapshotChange}
        />
      </div>
    </div>
  )
}
