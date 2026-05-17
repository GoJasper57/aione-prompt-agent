import abstractEmotionPatterns from "@/data/intelligence/abstractEmotionPatterns.json"
import creativeModifiers from "@/data/intelligence/creativeModifiers.json"
import imaginativeEntities from "@/data/intelligence/imaginativeEntities.json"
import motionPatterns from "@/data/intelligence/motionPatterns.json"
import overridePatterns from "@/data/intelligence/overridePatterns.json"
import relationalPatterns from "@/data/intelligence/relationalPatterns.json"
import technicalTerms from "@/data/intelligence/technicalTerms.json"
import utilitarianPhrases from "@/data/intelligence/utilitarianPhrases.json"
import visualCreationPatterns from "@/data/intelligence/visualCreationPatterns.json"
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

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const matchesBlockedTerm = (prompt: string, term: string) => {
  const escapedTerm = escapeRegExp(normalize(term)).replace(/\s+/g, "\\s+")
  const termPattern = new RegExp(`(^|[^\\p{L}\\p{N}])${escapedTerm}(?=$|[^\\p{L}\\p{N}])`, "iu")

  return termPattern.test(normalize(prompt))
}

const matchesPattern = (prompt: string, pattern: string) => {
  const escapedPattern = escapeRegExp(normalize(pattern)).replace(/\s+/g, "\\s+")
  const patternBoundary = new RegExp(`(^|[^\\p{L}\\p{N}])${escapedPattern}(?=$|[^\\p{L}\\p{N}])`, "iu")

  return patternBoundary.test(normalize(prompt))
}

const continuationSignals = [
  "abstract",
  "atmosphere",
  "brighter",
  "darker",
  "emotion",
  "futuristic",
  "motion",
  "mood",
  "nostalgic",
  "surreal"
]

const isContinuationRequest = (prompt: string) => {
  const normalizedPrompt = normalize(prompt)
  const rawTokenCount = normalizedPrompt.match(/[a-z0-9]+/g)?.length ?? 0
  const hasContinuationPhrase = /^(make|more|less|change|add|increase|reduce|shift|turn|give)\b/i.test(normalizedPrompt)
  const hasContinuationSignal = continuationSignals.some(signal => normalizedPrompt.includes(signal))

  return rawTokenCount > 0 && rawTokenCount <= 6 && hasContinuationPhrase && hasContinuationSignal
}

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

const countPatternMatches = (prompt: string, patterns: string[]) =>
  patterns.filter(pattern => matchesPattern(prompt, pattern)).length

const hasSceneComposition = (prompt: string) => {
  const normalizedPrompt = normalize(prompt)
  const promptTokens = tokenize(prompt)
  const hasArticleLead = /^(a|an|the)\b/i.test(normalizedPrompt)
  const hasVisualNoun = countPatternMatches(prompt, imaginativeEntities) > 0
  const hasDescriptiveShape = promptTokens.length >= 3

  return hasArticleLead && hasVisualNoun && hasDescriptiveShape
}

const getCreativeIntentScore = (prompt: string, isContinuation: boolean) => {
  const imaginativeEntityScore = countPatternMatches(prompt, imaginativeEntities) * 2
  const creativeModifierScore = countPatternMatches(prompt, creativeModifiers) * 2
  const visualCreationScore = countPatternMatches(prompt, visualCreationPatterns) * 3
  const motionScore = countPatternMatches(prompt, motionPatterns) * 2
  const relationalScore = countPatternMatches(prompt, relationalPatterns) * 2
  const emotionalScore = countPatternMatches(prompt, abstractEmotionPatterns) * 2
  const sceneCompositionScore = hasSceneComposition(prompt) ? 2 : 0
  const continuationScore = isContinuation ? 4 : 0
  const technicalPenalty = countPatternMatches(prompt, technicalTerms) * 3
  const utilitarianPenalty = countPatternMatches(prompt, utilitarianPhrases) * 4
  const overridePenalty = countPatternMatches(prompt, overridePatterns) * 8

  return imaginativeEntityScore
    + creativeModifierScore
    + visualCreationScore
    + motionScore
    + relationalScore
    + emotionalScore
    + sceneCompositionScore
    + continuationScore
    - technicalPenalty
    - utilitarianPenalty
    - overridePenalty
}

export function classifyRequest(prompt: string, previousPrompt?: string): RequestClassification {
  const hasOverrideAttempt = overridePatterns.some(pattern => matchesPattern(prompt, pattern))
  const isAllowed = !blockedTerms.some(term => matchesBlockedTerm(prompt, term)) && !hasOverrideAttempt
  const isContinuation = Boolean(previousPrompt && isContinuationRequest(prompt))
  const creativeIntentScore = getCreativeIntentScore(prompt, isContinuation)
  const isRelevant = isAllowed && creativeIntentScore >= 2
  const currentTokenCount = tokenize(prompt).length
  const semanticOverlap = previousPrompt ? getSemanticOverlap(prompt, previousPrompt) : 1

  return {
    isAllowed,
    isRelevant,
    isNewSession: Boolean(previousPrompt && isRelevant && currentTokenCount >= 3 && semanticOverlap < 0.18)
  }
}
