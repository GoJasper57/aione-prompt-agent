"use client"

import { useEffect, useState } from "react"
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

  useEffect(() => {
    if (!isVisible) {
      setSelectedDirection(null)
      setShowPromptWorkspace(false)
      return
    }

    if (selectedDirection) {
      const timer = setTimeout(() => {
        setShowPromptWorkspace(true)
      }, 300)
      return () => clearTimeout(timer)
    }

    setShowPromptWorkspace(false)
  }, [isVisible, selectedDirection])

  return (
    <div className="h-screen flex">
      <div className={cn(
        "h-screen overflow-y-auto scrollbar-hide border-r border-border/30 transition-all duration-700",
        isVisible ? "w-[38%] min-w-[400px]" : "w-0 opacity-0 pointer-events-none"
      )}>
        <SemanticSteering
          isVisible={isVisible}
          onSelectDirection={(value) => setSelectedDirection(value)}
        />
      </div>

      <div className={cn(
        "h-screen overflow-y-auto scrollbar-hide transition-all duration-700 ease-out",
        showPromptWorkspace
          ? "w-[40%] min-w-[420px] opacity-100 translate-x-0"
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
