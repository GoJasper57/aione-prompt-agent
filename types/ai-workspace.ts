// AI Workspace Types
export interface Message {
  id: string
  type: "user" | "ai-insight" | "ai-transition"
  content: string
}

export interface ClarificationDimension {
  id: string
  label: string
  description: string
  isPresent: boolean
  options?: string[]
  selectedOption?: string
}

export interface VibeInterpretation {
  id: string
  label: string
  atmosphere: string
  gradient: string
  accentPosition: string
  promptTemplate: string
}

export interface PromptFragment {
  id: string
  text: string
  isEditable: boolean
  category?: string
  alternatives?: string[]
}

export interface PromptVersion {
  id: string
  label: string
  fragments: PromptFragment[]
  timestamp: string
  isCheckpoint: boolean
}