import abstractEmotionPatterns from "@/data/intelligence/abstractEmotionPatterns.json"
import creativeModifiers from "@/data/intelligence/creativeModifiers.json"
import motionPatterns from "@/data/intelligence/motionPatterns.json"
import relationalPatterns from "@/data/intelligence/relationalPatterns.json"

export type DimensionScore = {
  detected: boolean
  confidence: number
  richness: number
  recommendExpansion: boolean
  detectedTerms: string[]
}

export type PromptDimensionAnalysis = Record<string, DimensionScore>

const dimensionTerms: Record<string, string[]> = {
  character: [
    "animal", "bear", "cat", "child", "creature", "dancer", "dog", "dragon", "figure", "fox",
    "girl", "person", "robot", "traveler", "woman"
  ],
  environment: [
    "alley", "background", "beach", "city", "forest", "garden", "landscape", "mountain", "room",
    "scene", "street", "tokyo", "world"
  ],
  lighting: [
    "backlit", "bright", "cinematic lighting", "fluorescent", "glow", "glowing", "lit", "moonlit",
    "neon", "shadow", "sunlit", "under flickering fluorescent lights"
  ],
  motion: motionPatterns,
  composition: [
    "background", "centered", "close up", "composition", "foreground", "framed", "isolated",
    "portrait", "symmetrical", "wide angle"
  ],
  style: [
    ...creativeModifiers,
    "anime", "cyberpunk", "fantasy", "stock", "commercial"
  ],
  atmosphere: [
    ...abstractEmotionPatterns,
    "atmosphere", "fog", "haze", "mist", "moody", "rain", "snow"
  ],
  cameraLanguage: [
    "anamorphic", "camera", "close-up", "close up", "dolly", "dolly shot", "frame", "framing",
    "handheld", "lens", "low angle", "overhead", "pan", "perspective", "shallow depth of field",
    "shot", "slow push-in", "static frame", "tracking", "tracking shot", "wide shot"
  ]
}

const cinematicSignals = [
  "animation",
  "camera",
  "cinematic",
  "cinematic memory",
  "drifting",
  "film",
  "frame",
  "handheld",
  "movie",
  "moving scene",
  "moving through",
  "pan",
  "scene",
  "sequence",
  "shot",
  "slow motion",
  "trailer",
  "tracking",
  "video",
  "visual storytelling",
  "walks through",
  "walking through"
]

const descriptorTerms = [
  ...creativeModifiers,
  ...abstractEmotionPatterns,
  ...relationalPatterns,
  "cyberpunk",
  "exhausted",
  "flickering",
  "futuristic",
  "lonely"
]

const normalize = (value: string) => value.toLowerCase()

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const matchesTerm = (prompt: string, term: string) => {
  const escapedTerm = escapeRegExp(normalize(term)).replace(/\s+/g, "\\s+")
  const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])${escapedTerm}(?=$|[^\\p{L}\\p{N}])`, "iu")

  return pattern.test(normalize(prompt))
}

const tokenize = (value: string) => normalize(value).match(/[a-z0-9]+/g) ?? []

const clamp = (value: number) => Math.max(0, Math.min(1, value))

const getDetectedTerms = (prompt: string, terms: string[]) =>
  [...new Set(terms.filter(term => matchesTerm(prompt, term)))]

const getDescriptorCount = (prompt: string) =>
  getDetectedTerms(prompt, descriptorTerms).length

const scoreDimension = (prompt: string, dimension: string): DimensionScore => {
  const detectedTerms = getDetectedTerms(prompt, dimensionTerms[dimension] ?? [])
  const detected = detectedTerms.length > 0
  const descriptorCount = getDescriptorCount(prompt)
  const tokenCount = tokenize(prompt).length
  const specificityBonus = tokenCount >= 8 ? 0.18 : tokenCount >= 5 ? 0.1 : 0
  const confidence = clamp(detectedTerms.length * 0.4 + descriptorCount * 0.1 + specificityBonus)
  const richness = detected
    ? clamp(0.18 + detectedTerms.length * 0.16 + descriptorCount * 0.14 + specificityBonus)
    : 0
  const recommendExpansion = confidence < 0.5 || richness < 0.45

  return {
    detected,
    confidence,
    richness,
    recommendExpansion,
    detectedTerms
  }
}

export function analyzePromptDimensions(prompt: string): PromptDimensionAnalysis {
  const dimensions = Object.keys(dimensionTerms).filter(dimension =>
    dimension !== "cameraLanguage" || getDetectedTerms(prompt, cinematicSignals).length > 0
  )

  return Object.fromEntries(dimensions.map(dimension => [dimension, scoreDimension(prompt, dimension)]))
}
