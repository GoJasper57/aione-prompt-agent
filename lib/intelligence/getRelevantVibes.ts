import vibeLibrary from "@/data/prompt-intelligence/vibeLibrary.json"

export interface VibeLibraryEntry {
  id: string
  title: string
  image: string
  style: string
  dimensions: string[]
  semanticConcepts: string[]
  tags: string[]
  steeringPhrases: string[]
}

interface RelevantVibeInput {
  prompt: string
  dimensionAnalysis: Record<string, "missing" | "weak" | "strong">
  semanticConcepts: string[]
  selectedSteeringTags?: string[]
  offset?: number
}

const normalize = (value: string) => value.toLowerCase()
const tokenize = (value: string) => normalize(value).match(/[a-z]+/g) ?? []

const hasTextOverlap = (values: string[], selectedTags: string[]) =>
  values.some(value =>
    selectedTags.some(tag => normalize(value).includes(normalize(tag)) || normalize(tag).includes(normalize(value)))
  )

export function getRelevantVibes({
  prompt,
  dimensionAnalysis,
  semanticConcepts,
  selectedSteeringTags = [],
  offset = 0
}: RelevantVibeInput): VibeLibraryEntry[] {
  const promptTokens = new Set(tokenize(prompt))
  const weakDimensions = Object.entries(dimensionAnalysis)
    .filter(([, strength]) => strength === "missing" || strength === "weak")
    .map(([dimension]) => dimension)

  const scored = (vibeLibrary as VibeLibraryEntry[]).map(vibe => {
    const selectedTagScore = hasTextOverlap(
      [...vibe.tags, ...vibe.steeringPhrases],
      selectedSteeringTags
    ) ? 6 : 0
    const dimensionScore = vibe.dimensions.filter(dimension => weakDimensions.includes(dimension)).length * 3
    const conceptScore = vibe.semanticConcepts.filter(concept => semanticConcepts.includes(concept)).length * 4
    const promptScore = [
      vibe.title,
      ...vibe.tags,
      ...vibe.semanticConcepts,
      ...vibe.steeringPhrases
    ].reduce((score, value) => {
      const matchesPrompt = tokenize(value).some(token => promptTokens.has(token))
      return score + (matchesPrompt ? 1 : 0)
    }, 0)

    return { vibe, score: selectedTagScore + dimensionScore + conceptScore + promptScore }
  })

  const semanticNeighborhood = scored
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.vibe.title.localeCompare(b.vibe.title))

  const pool = (semanticNeighborhood.length >= 8 ? semanticNeighborhood : scored)
    .sort((a, b) => b.score - a.score || a.vibe.title.localeCompare(b.vibe.title))
    .slice(0, Math.max(8, Math.min(24, semanticNeighborhood.length || scored.length)))
    .map(entry => entry.vibe)

  const start = pool.length > 0 ? offset % pool.length : 0
  const rotated = [...pool.slice(start), ...pool.slice(0, start)]

  return rotated.slice(0, 8)
}
