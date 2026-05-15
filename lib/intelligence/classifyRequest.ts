import creativeKeywords from "@/data/intelligence/creativeKeywords.json"
import blockedTerms from "@/data/safety/blockedTerms.json"

export interface RequestClassification {
  isAllowed: boolean
  isRelevant: boolean
  isNewSession: boolean
}

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "from",
  "in",
  "into",
  "is",
  "it",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with"
])

const normalize = (value: string) => value.toLowerCase()

const tokenize = (value: string) =>
  normalize(value)
    .match(/[a-z0-9]+/g)
    ?.filter(token => token.length > 2 && !stopWords.has(token)) ?? []

const getSemanticOverlap = (currentPrompt: string, previousPrompt: string) => {
  const currentTokens = new Set(tokenize(currentPrompt))
  const previousTokens = new Set(tokenize(previousPrompt))

  if (currentTokens.size === 0 || previousTokens.size === 0) return 0

  const sharedTokenCount = [...currentTokens].filter(token => previousTokens.has(token)).length
  const unionSize = new Set([...currentTokens, ...previousTokens]).size

  return unionSize === 0 ? 0 : sharedTokenCount / unionSize
}

export function classifyRequest(prompt: string, previousPrompt?: string): RequestClassification {
  const normalizedPrompt = normalize(prompt)
  const isAllowed = !blockedTerms.some(term => normalizedPrompt.includes(normalize(term)))
  const isRelevant = creativeKeywords.some(keyword => normalizedPrompt.includes(normalize(keyword)))
  const currentTokenCount = tokenize(prompt).length
  const semanticOverlap = previousPrompt ? getSemanticOverlap(prompt, previousPrompt) : 1

  return {
    isAllowed,
    isRelevant,
    isNewSession: Boolean(previousPrompt && isRelevant && currentTokenCount >= 3 && semanticOverlap < 0.18)
  }
}
