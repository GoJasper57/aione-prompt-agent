import { PromptFragment } from "@/types/ai-workspace"
import { getAlternativesForFragment } from "./semantic-alternatives"

// Parse prompt template into fragments
export function parsePromptToFragments(template: string): PromptFragment[] {
  const fragments: PromptFragment[] = []
  const regex = /\[([^\]]+)\]/g
  let lastIndex = 0
  let match
  let id = 0

  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      fragments.push({
        id: `f${id++}`,
        text: template.slice(lastIndex, match.index),
        isEditable: false
      })
    }

    fragments.push({
      id: `f${id++}`,
      text: match[1],
      isEditable: true,
      alternatives: getAlternativesForFragment(match[1])
    })

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < template.length) {
    fragments.push({
      id: `f${id++}`,
      text: template.slice(lastIndex),
      isEditable: false
    })
  }

  return fragments
}