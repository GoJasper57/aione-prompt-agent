const conversationalWrappers = [
  /^please\s+/i,
  /^(can you|could you|would you)\s+/i,
  /^help me\s+/i,
  /^i want you to\s+/i,
  /^i would like\s+(you to\s+)?/i
]

const intentVerbs = [
  /^(create|generate|make|draw|paint|illustrate|render|design)\s+(me\s+)?/i
]

const mediaTypes = [
  "image",
  "artwork",
  "photo",
  "picture",
  "render",
  "illustration",
  "painting",
  "drawing",
  "video",
  "animation"
]

const mediaTypePattern = mediaTypes.join("|")

const mediaTypeWrappers = [
  { pattern: new RegExp(`^(a|an|the)\\s+(${mediaTypePattern})\\s+of\\s+`, "i") },
  { pattern: new RegExp(`^(${mediaTypePattern})\\s+of\\s+`, "i") },
  { pattern: new RegExp(`^(a|an|the)\\s+(.+?)\\s+(${mediaTypePattern})\\s+of\\s+`, "i"), preserveGroup: 2 },
  { pattern: new RegExp(`^(.+?)\\s+(${mediaTypePattern})\\s+of\\s+`, "i"), preserveGroup: 1 }
]

const leadingFillers = [
  /^(a|an|the)\s+/i
]

const stripFirstMatch = (value: string, patterns: RegExp[]) => {
  for (const pattern of patterns) {
    if (pattern.test(value)) {
      return value.replace(pattern, "")
    }
  }

  return value
}

const stripMediaWrapper = (value: string) => {
  for (const { pattern, preserveGroup } of mediaTypeWrappers) {
    const match = value.match(pattern)
    if (!match) continue

    if (preserveGroup) {
      return value.replace(pattern, `${match[preserveGroup]} `)
    }

    return value.replace(pattern, "")
  }

  return value
}

const cleanSpacing = (value: string) =>
  value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.])/g, "$1")
    .trim()

export function normalizePromptInput(prompt: string) {
  let normalizedPrompt = prompt.trim()
  const originalPrompt = normalizedPrompt

  let previousPrompt = ""
  while (previousPrompt !== normalizedPrompt) {
    previousPrompt = normalizedPrompt
    normalizedPrompt = stripFirstMatch(normalizedPrompt, conversationalWrappers)
  }
  normalizedPrompt = stripFirstMatch(normalizedPrompt, intentVerbs)
  normalizedPrompt = stripMediaWrapper(normalizedPrompt)

  if (normalizedPrompt !== originalPrompt) {
    normalizedPrompt = stripFirstMatch(normalizedPrompt, leadingFillers)
  }

  normalizedPrompt = cleanSpacing(normalizedPrompt)

  return normalizedPrompt || originalPrompt
}
