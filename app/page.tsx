"use client"

import { useCallback, useState } from "react"
import { ConversationShell } from "@/components/conversation-shell"
import { CreativeWorkspace } from "@/components/creative-workspace"
import { PromptAnalysis } from "@/lib/intelligence/analyzePrompt"
import { summarizePromptChange } from "@/lib/intelligence/summarizePromptChange"
import { SessionMessage, WorkspaceSessionCollection } from "@/types/ai-workspace"

export default function AIWorkspace() {
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [workspaceSessionId, setWorkspaceSessionId] = useState(0)
  const [promptAnalysis, setPromptAnalysis] = useState<PromptAnalysis | null>(null)
  const [workspaceSessions, setWorkspaceSessions] = useState<WorkspaceSessionCollection>({
    currentSession: {
      id: 0,
      versionLabel: "Current",
      timestamp: "Just now",
      promptSnapshot: "",
      messages: []
    },
    archivedSessions: []
  })

  const handleNewSession = () => {
    const archivedVersionName = `V${workspaceSessionId + 1}`
    setWorkspaceSessions(prev => ({
      currentSession: {
        id: workspaceSessionId + 1,
        versionLabel: "Current",
        timestamp: "Just now",
        promptSnapshot: "",
        messages: []
      },
      archivedSessions: [
        ...prev.archivedSessions,
        {
          ...prev.currentSession,
          versionLabel: archivedVersionName,
          changeLog: summarizePromptChange(
            prev.archivedSessions.at(-1)?.promptSnapshot ?? "",
            prev.currentSession.promptSnapshot
          )
        }
      ]
    }))
    setWorkspaceSessionId(prev => prev + 1)
    return archivedVersionName
  }

  const handleMessagesChange = useCallback((messages: SessionMessage[]) => {
    setWorkspaceSessions(prev => ({
      ...prev,
      currentSession: { ...prev.currentSession, messages }
    }))
  }, [])

  const handlePromptSnapshotChange = useCallback((promptSnapshot: string) => {
    setWorkspaceSessions(prev => ({
      ...prev,
      currentSession: { ...prev.currentSession, promptSnapshot }
    }))
  }, [])

  return (
    <div className="min-h-screen bg-background flex">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/[0.02] rounded-full blur-[120px]" />
        <div className={analysisComplete ? "absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-chart-3/[0.02] rounded-full blur-[100px] animate-fade-in opacity-100" : "absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-chart-3/[0.02] rounded-full blur-[100px] opacity-0 pointer-events-none"} />
      </div>

      <ConversationShell
        onAnalysisComplete={() => setAnalysisComplete(true)}
        onNewSession={handleNewSession}
        onPromptAnalyzed={setPromptAnalysis}
        onMessagesChange={handleMessagesChange}
      />
      <CreativeWorkspace
        key={workspaceSessionId}
        isVisible={analysisComplete}
        analysis={promptAnalysis}
        archivedSessions={workspaceSessions.archivedSessions}
        onPromptSnapshotChange={handlePromptSnapshotChange}
      />
    </div>
  )
}
