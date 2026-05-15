import dimensions from "@/data/prompt-intelligence/dimensions.json"
import semanticConcepts from "@/data/prompt-intelligence/semanticConcepts.json"
import steeringVocabulary from "@/data/prompt-intelligence/steeringVocabulary.json"

export interface PromptAnalysis {
  semanticConcepts: string[]
  dimensionAnalysis: Record<string, "missing" | "weak" | "strong">
  steeringSuggestions: Record<string, string[]>
}

interface SemanticConceptDefinition {
  concept: string
  keywords: string[]
  relatedDimensions: string[]
  steeringSuggestions: string[]
}

const dimensionKeywords: Record<string, string[]> = {
  environment: ["city", "forest", "world", "room", "landscape", "alley", "desert", "ocean", "environment", "shop", "garden"],
  character: ["character", "figure", "person", "creature", "hero", "traveler", "beast", "robot", "florist"],
  emotion: ["emotion", "mood", "lonely", "tender", "melancholy", "joy", "fear", "warm"],
  motion: ["motion", "drift", "moving", "walking", "flowing", "floating", "falling", "running"],
  materiality: ["stone", "metal", "glass", "wood", "fabric", "organic", "texture", "material"],
  atmosphere: ["atmosphere", "haze", "mist", "fog", "glow", "ambient", "smoke"],
  worldLogic: ["magic", "ritual", "impossible", "gravity", "myth", "rule", "worldbuilding"],
  time: ["ancient", "future", "dawn", "night", "era", "memory", "forgotten"],
  scale: ["vast", "tiny", "towering", "miniature", "scale", "colossal", "intimate"],
  interaction: ["holding", "touching", "watching", "meeting", "fighting", "ritual", "interaction"]
}

const fallbackSuggestions: Record<string, string[]> = {
  environment: ["misty harbor district", "overgrown glasshouse", "forgotten rooftop garden", "quiet market alley"],
  character: ["solitary keeper", "masked traveler", "gentle machine companion", "mythic wanderer"],
  emotion: ["quiet longing", "soft wonder", "uneasy tenderness", "playful melancholy"],
  motion: ["slow drifting movement", "suspended stillness", "subtle windborne motion", "ritual gestures"],
  materiality: ["weathered brass details", "translucent organic surfaces", "woven mineral textures", "reflective wet stone"],
  atmosphere: ["soft atmospheric haze", "ambient reflective surfaces", "luminous fog", "layered drifting particles"],
  worldLogic: ["impossible gravity rules", "seasonal magic cycles", "memory-shaped architecture", "ritual mechanical laws"],
  time: ["forgotten future era", "ancient twilight age", "fading memory interval", "pre-dawn stillness"],
  scale: ["intimate miniature scale", "towering vertical forms", "vast layered horizons", "unexpected scale shifts"],
  interaction: ["careful exchange ritual", "silent shared task", "objects responding to touch", "gentle environmental reaction"]
}

const normalize = (value: string) => value.toLowerCase()

const includesKeyword = (prompt: string, keyword: string) => normalize(prompt).includes(normalize(keyword))

export function analyzePrompt(prompt: string): PromptAnalysis {
  const matchedConcepts = (semanticConcepts as SemanticConceptDefinition[]).filter(concept =>
    concept.keywords.some(keyword => includesKeyword(prompt, keyword))
  )

  const dimensionAnalysis = Object.fromEntries(dimensions.map(dimension => {
    const directSignalCount = (dimensionKeywords[dimension] ?? [])
      .filter(keyword => includesKeyword(prompt, keyword))
      .length
    const relatedConceptCount = matchedConcepts
      .filter(concept => concept.relatedDimensions.includes(dimension))
      .length
    const totalSignalCount = directSignalCount + relatedConceptCount
    const strength = totalSignalCount === 0
      ? "missing"
      : totalSignalCount === 1
        ? "weak"
        : "strong"

    return [dimension, strength]
  })) as Record<string, "missing" | "weak" | "strong">

  const steeringSuggestions = Object.fromEntries(dimensions.map(dimension => {
    const conceptSuggestions = matchedConcepts
      .filter(concept => concept.relatedDimensions.includes(dimension))
      .flatMap(concept => concept.steeringSuggestions)
    const dimensionSuggestions = [
      ...new Set([...conceptSuggestions, ...(fallbackSuggestions[dimension] ?? steeringVocabulary)])
    ].slice(0, 4)

    return [dimension, dimensionSuggestions]
  })) as Record<string, string[]>

  return {
    semanticConcepts: matchedConcepts.map(concept => concept.concept),
    dimensionAnalysis,
    steeringSuggestions
  }
}
