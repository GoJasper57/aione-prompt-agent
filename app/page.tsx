"use client"

import { useState } from "react"
import { ConversationShell } from "@/components/conversation-shell"
import { CreativeWorkspace } from "@/components/creative-workspace"

export default function AIWorkspace() {
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [workspaceSessionId, setWorkspaceSessionId] = useState(0)

  const handleNewSession = () => {
    const archivedVersionName = `V${workspaceSessionId + 1}`
    setWorkspaceSessionId(prev => prev + 1)
    return archivedVersionName
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/[0.02] rounded-full blur-[120px]" />
        <div className={analysisComplete ? "absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-chart-3/[0.02] rounded-full blur-[100px] animate-fade-in opacity-100" : "absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-chart-3/[0.02] rounded-full blur-[100px] opacity-0 pointer-events-none"} />
      </div>

      <ConversationShell
        onAnalysisComplete={() => setAnalysisComplete(true)}
        onNewSession={handleNewSession}
      />
      <CreativeWorkspace key={workspaceSessionId} isVisible={analysisComplete} />
    </div>
  )
}
