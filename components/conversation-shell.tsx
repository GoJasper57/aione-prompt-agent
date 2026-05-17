"use client"

import { useState, useEffect, useRef } from "react"
import { Sparkles } from "lucide-react"
import { IntentInput } from "@/components/intent-input"
import { analyzePrompt, PromptAnalysis } from "@/lib/intelligence/analyzePrompt"
import { classifyRequest } from "@/lib/intelligence/classifyRequest"
import { normalizePromptInput } from "@/lib/intelligence/normalizePromptInput"
import { Message, SessionMessage } from "@/types/ai-workspace"

interface ConversationShellProps {
  onAnalysisComplete: () => void
  onNewSession: () => string
  onPromptAnalyzed: (analysis: PromptAnalysis) => void
  onPromptSubmitted: (prompt: string) => void
  onMessagesChange: (messages: SessionMessage[]) => void
}

const featuredExample = {
  prompt: "A lone figure walks through a rain-soaked Tokyo alley at 2am, illuminated by cold neon reflections and drifting steam. The atmosphere feels emotionally distant but strangely intimate, framed like a quiet cinematic memory with soft film grain and muted contrast.",
  label: "Neo-noir cinematic realism"
}

const thinkingSequence: Message[] = [
  { id: "t1", type: "ai-insight", content: "I can see the emotional atmosphere you're reaching for." },
  { id: "t2", type: "ai-transition", content: "Explore visual directions on the right to refine and evolve your prompt." },
]

export function ConversationShell({
  onAnalysisComplete,
  onNewSession,
  onPromptAnalyzed,
  onPromptSubmitted,
  onMessagesChange
}: ConversationShellProps) {
  const [userInput, setUserInput] = useState("")
  const [submittedPrompt, setSubmittedPrompt] = useState("")
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentThinkingIndex, setCurrentThinkingIndex] = useState(0)
  const [thinkingSession, setThinkingSession] = useState(0)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedContent, setStreamedContent] = useState("")
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [showAnalysisHint, setShowAnalysisHint] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamedContent])

  useEffect(() => {
    onMessagesChange(messages.map(message => ({
      role: message.type === "user"
        ? "user"
        : message.id.startsWith("archive-")
          ? "system"
          : "assistant",
      content: message.content,
      timestamp: message.timestamp
    })))
  }, [messages, onMessagesChange])

  const streamText = (text: string, onComplete: () => void) => {
    setIsStreaming(true)
    setStreamedContent("")
    let index = 0

    const interval = setInterval(() => {
      if (index < text.length) {
        setStreamedContent(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        setIsStreaming(false)
        onComplete()
      }
    }, 30)

    return () => clearInterval(interval)
  }

  useEffect(() => {
    if (!hasSubmitted || currentThinkingIndex >= thinkingSequence.length) return

    const currentMessage = thinkingSequence[currentThinkingIndex]
    const keyedMessage = {
      ...currentMessage,
      id: `${currentMessage.id}-${thinkingSession}`,
      timestamp: Date.now()
    }

    let followUpTimer: ReturnType<typeof setTimeout> | null = null
    const cleanup = streamText(currentMessage.content, () => {
      setMessages(prev => [...prev, keyedMessage])
      setStreamedContent("")
      followUpTimer = setTimeout(() => {
        setCurrentThinkingIndex(prev => prev + 1)
      }, 600)
    })

    return () => {
      cleanup()
      if (followUpTimer) clearTimeout(followUpTimer)
    }
  }, [hasSubmitted, currentThinkingIndex, thinkingSession])

  useEffect(() => {
    if (hasSubmitted && currentThinkingIndex >= thinkingSequence.length && !analysisComplete) {
      setAnalysisComplete(true)
      setShowAnalysisHint(true)
      onAnalysisComplete()
      const timer = setTimeout(() => {
        setShowAnalysisHint(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [hasSubmitted, currentThinkingIndex, analysisComplete, onAnalysisComplete])

  const handleSubmit = (intent: string) => {
    if (!intent.trim()) return
    const prompt = intent.trim()
    const classification = classifyRequest(prompt, submittedPrompt || undefined)

    if (!classification.isAllowed) {
      setMessages(prev => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          type: "user",
          content: prompt,
          timestamp: Date.now()
        },
        {
          id: `safety-${Date.now()}`,
          type: "ai-transition",
          content: "AIONE currently supports safe creative prompt exploration.",
          timestamp: Date.now()
        }
      ])
      setUserInput("")
      return
    }

    if (!classification.isRelevant) {
      setMessages(prev => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          type: "user",
          content: prompt,
          timestamp: Date.now()
        },
        {
          id: `relevance-${Date.now()}`,
          type: "ai-transition",
          content: "AIONE currently supports creative prompt exploration.",
          timestamp: Date.now()
        }
      ])
      setUserInput("")
      return
    }

    const normalizedPrompt = normalizePromptInput(prompt)
    onPromptAnalyzed(analyzePrompt(normalizedPrompt))
    onPromptSubmitted(normalizedPrompt)

    if (!hasSubmitted) {
      setSubmittedPrompt(prompt)
      setMessages([{ id: "user-1", type: "user", content: prompt, timestamp: Date.now() }])
      setHasSubmitted(true)
      setAnalysisComplete(true)
      onAnalysisComplete()
      setCurrentThinkingIndex(0)
    } else if (classification.isNewSession) {
      const archivedVersionName = onNewSession()
      setSubmittedPrompt(prompt)
      setMessages(prev => [
        ...prev,
        {
          id: `archive-${Date.now()}`,
          type: "ai-transition",
          content: `Archived previous version as ${archivedVersionName}.`,
          timestamp: Date.now()
        },
        {
          id: `user-${Date.now()}`,
          type: "user",
          content: prompt,
          timestamp: Date.now()
        }
      ])
      setCurrentThinkingIndex(0)
      setThinkingSession(prev => prev + 1)
      setStreamedContent("")
    } else {
      const newMessage: Message = {
        id: `user-${Date.now()}`,
        type: "user",
        content: prompt,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, newMessage])
      setSubmittedPrompt(prompt)
      setCurrentThinkingIndex(0)
      setThinkingSession(prev => prev + 1)
      setStreamedContent("")
    }

    setUserInput("")
  }

  const handleExampleClick = () => {
    setUserInput(featuredExample.prompt)
  }

  const analysisCompleteLabel = hasSubmitted && currentThinkingIndex >= thinkingSequence.length

  return (
    <div className="workspace-panel border-r border-border/30 relative transition-all duration-700 ease-out w-[40%] min-w-[400px] max-w-[560px]">
      <div className="workspace-panel-header border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h1 className="workspace-panel-title">AIONE</h1>
            <p className="workspace-panel-subtitle">Creative Clarification</p>
          </div>
        </div>
      </div>

      <div className="workspace-panel-section flex-1 overflow-y-auto scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center space-y-7">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground leading-tight">
                Bring vague ideas into focus
              </h2>
              <p className="workspace-panel-subtitle">
                Clarify visual ideas through collaborative exploration. Turn half-formed intuitions into clear creative direction.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleExampleClick}
                className="w-full text-left p-6 rounded-2xl transition-all duration-300 bg-gradient-to-br from-muted/50 via-muted/30 to-transparent border border-border/50 hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/10 hover:via-muted/30 hover:to-transparent group"
              >
                <p className="text-sm text-foreground leading-relaxed mb-4 group-hover:text-foreground transition-colors">
                  {featuredExample.prompt}
                </p>
                <span className="text-xs text-primary/80 font-medium group-hover:text-primary transition-colors">
                  {featuredExample.label}
                </span>
              </button>
              <p className="workspace-muted">
                Click to use as starting point
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isStreaming && (
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <div className="flex-1 text-sm leading-relaxed text-foreground">
                  {streamedContent}
                  <span className="inline-block w-0.5 h-4 bg-primary/70 ml-0.5 animate-blink" />
                </div>
              </div>
            )}

            {analysisCompleteLabel && (
              <div className="pt-2 animate-fade-in">
                <span className="workspace-muted">
                  {showAnalysisHint ? "Shaping your direction..." : "Choose an interpretation to continue."}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="workspace-panel-section border-t border-border/30">
        <IntentInput
          onSubmit={handleSubmit}
          isProcessing={isStreaming}
          examplePrompt={featuredExample.prompt}
          value={userInput}
          onChange={setUserInput}
        />
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  if (message.type === "user") {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[90%] bg-primary/15 border border-primary/25 rounded-2xl rounded-br-md px-4 py-3">
          <p className="text-sm text-foreground leading-relaxed">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className={message.type === "ai-insight" ? "w-6 h-6 rounded-full flex items-center justify-center bg-primary/20" : "w-6 h-6 rounded-full flex items-center justify-center bg-chart-4/20"}>
        <div className={message.type === "ai-insight" ? "w-2 h-2 rounded-full bg-primary" : "w-2 h-2 rounded-full bg-chart-4"} />
      </div>
      <span className="text-sm leading-relaxed text-foreground">
        {message.content}
      </span>
    </div>
  )
}
