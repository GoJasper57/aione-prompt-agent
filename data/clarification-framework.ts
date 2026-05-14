import { ClarificationDimension } from "@/types/ai-workspace"

// Creative Clarification Framework - 8 dimensions
export const clarificationFramework: ClarificationDimension[] = [
  { id: "subject", label: "Subject", description: "Who or what is the focus", isPresent: true },
  { id: "environment", label: "Environment", description: "Where this takes place", isPresent: true },
  { id: "emotional-tone", label: "Emotional Tone", description: "The feeling it evokes", isPresent: true },
  { id: "lighting", label: "Lighting & Color", description: "How light shapes the mood", isPresent: false, options: ["Cold neon glow", "Warm tungsten intimacy", "Harsh contrast shadows", "Soft diffused ambience"] },
  { id: "framing", label: "Framing & Perspective", description: "How we see the scene", isPresent: false, options: ["Intimate close framing", "Environmental wide shot", "Low angle dramatic", "Voyeuristic distance"] },
  { id: "motion", label: "Motion & Energy", description: "Stillness or movement", isPresent: false, options: ["Frozen stillness", "Subtle motion blur", "Dynamic energy", "Dreamlike drift"] },
  { id: "style", label: "Visual Style", description: "The aesthetic language", isPresent: false, options: ["Photorealistic cinema", "Analog film texture", "Painterly atmosphere", "Minimal graphic"] },
  { id: "atmosphere", label: "Atmosphere & Texture", description: "Environmental mood", isPresent: false, options: ["Misty and ethereal", "Gritty and raw", "Clean and precise", "Layered and dense"] },
]