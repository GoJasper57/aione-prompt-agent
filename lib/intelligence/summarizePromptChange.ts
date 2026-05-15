const changeSignals = [
  {
    terms: ["environment", "scene", "world", "forest", "city", "room", "landscape", "ocean", "sky"],
    summary: "Added atmospheric environment details"
  },
  {
    terms: ["move", "motion", "drifting", "floating", "falling", "flowing", "swirling"],
    summary: "Introduced motion and ambient effects"
  },
  {
    terms: ["haze", "fog", "mist", "glow", "lighting", "atmosphere", "ambient"],
    summary: "Refined atmosphere"
  },
  {
    terms: ["lonely", "nostalgic", "intimate", "melancholy", "joyful", "emotion", "emotional"],
    summary: "Increased emotional tone"
  },
  {
    terms: ["dreamlike", "surreal", "memory", "nostalgia"],
    summary: "Shifted toward dreamlike nostalgia"
  }
]

const tokenize = (value: string) =>
  new Set(value.toLowerCase().match(/[a-z]+/g) ?? [])

export function summarizePromptChange(previousPrompt: string, nextPrompt: string) {
  if (!previousPrompt.trim()) return "Captured initial creative direction"

  const previousTerms = tokenize(previousPrompt)
  const nextTerms = tokenize(nextPrompt)

  for (const signal of changeSignals) {
    if (signal.terms.some(term => nextTerms.has(term) && !previousTerms.has(term))) {
      return signal.summary
    }
  }

  return "Refined creative direction"
}
