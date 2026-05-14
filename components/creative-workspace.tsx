"use client"

import { useCallback, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { PromptEvolution } from "@/components/prompt-evolution"
import { SemanticSteering } from "@/components/semantic-steering"

interface WorkspaceDirection {
  promptTemplate: string
  label: string
}

interface CreativeWorkspaceProps {
  isVisible: boolean
}

export function CreativeWorkspace({ isVisible }: CreativeWorkspaceProps) {
  const [selectedDirection, setSelectedDirection] = useState<WorkspaceDirection | null>(null)
  const [showPromptWorkspace, setShowPromptWorkspace] = useState(false)
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

  return (
    <div className="workspace-shell">
      <div className={cn(
        "workspace-side-panel",
        isVisible ? "w-[56%] min-w-[500px]" : "w-0 opacity-0 pointer-events-none"
      )}>
        <SemanticSteering
          isVisible={isVisible}
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
        />
      </div>
    </div>
  )
}
