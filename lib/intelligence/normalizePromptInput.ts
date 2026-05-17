const commandWrappers = [
  /^please\s+/i,
  /^(draw me|draw)\s+/i,
  /^(create|generate|make me|make)\s+(an?\s+)?(image|artwork)\s+of\s+/i,
  /^(create|generate|make me|make)\s+/i,
  /^(illustrate|render|paint)\s+/i
]

export function normalizePromptInput(prompt: string) {
  let normalizedPrompt = prompt.trim()

  for (const wrapper of commandWrappers) {
    normalizedPrompt = normalizedPrompt.replace(wrapper, "")
  }

  normalizedPrompt = normalizedPrompt.trim()

  return normalizedPrompt || prompt.trim()
}
