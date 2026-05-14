import { VibeInterpretation } from "@/types/ai-workspace"

// Vibe Interpretations - 8 atmospheric possibilities with organic layout
export const vibeInterpretations: VibeInterpretation[] = [
  {
    id: "v1",
    label: "Neo-noir melancholy",
    atmosphere: "Heavy shadows, isolated neon pools",
    gradient: "from-cyan-600/50 via-blue-900/40 to-slate-950/60",
    accentPosition: "top-right",
    promptTemplate: "A lone figure walks through a [rain-soaked] Tokyo alley at 2am, illuminated by [cold neon reflections] and drifting steam. The atmosphere feels [emotionally distant] but strangely intimate, framed like a [quiet cinematic memory] with soft film grain and muted contrast. Neo-noir aesthetic with [deep shadows] and isolated pools of neon light."
  },
  {
    id: "v2",
    label: "Soft nostalgic realism",
    atmosphere: "Warm grain, faded memory",
    gradient: "from-amber-500/40 via-orange-800/30 to-stone-900/50",
    accentPosition: "top-left",
    promptTemplate: "A lone figure walks through a [rain-soaked] Tokyo alley at 2am, illuminated by [warm tungsten glow] filtering through steam. The atmosphere feels [tenderly melancholic] and strangely intimate, framed like a [fading photograph] with heavy film grain and nostalgic warmth. Soft realism with [gentle light diffusion]."
  },
  {
    id: "v3",
    label: "Dreamlike atmospheric ambiguity",
    atmosphere: "Hazy boundaries, uncertain forms",
    gradient: "from-violet-600/30 via-indigo-800/40 to-slate-900/50",
    accentPosition: "center",
    promptTemplate: "A lone figure walks through a [rain-soaked] Tokyo alley at 2am, forms [dissolving into mist] and drifting steam. The atmosphere feels [surreally detached] and strangely intimate, framed like a [half-remembered dream] with soft focus and ambiguous boundaries. Dreamlike quality with [ethereal light bleeding]."
  },
  {
    id: "v4",
    label: "Minimal brutalist isolation",
    atmosphere: "Stark geometry, emotional void",
    gradient: "from-zinc-700/50 via-neutral-800/40 to-black/70",
    accentPosition: "bottom",
    promptTemplate: "A lone figure walks through a [rain-soaked] Tokyo alley at 2am, reduced to [geometric silhouette] against stark concrete. The atmosphere feels [coldly isolated] and strangely intimate, framed with [brutal minimalism] and high contrast. Clean lines, [deep blacks], architectural emptiness."
  },
  {
    id: "v5",
    label: "Analog film intimacy",
    atmosphere: "Textured warmth, human imperfection",
    gradient: "from-rose-500/30 via-pink-900/30 to-stone-900/50",
    accentPosition: "top-left",
    promptTemplate: "A lone figure walks through a [rain-soaked] Tokyo alley at 2am, captured with [visible film grain] and color shifts. The atmosphere feels [intimately human] and strangely intimate, framed like a [candid street photograph] with natural imperfections. Analog texture with [subtle color cast]."
  },
  {
    id: "v6",
    label: "Surreal ambient haze",
    atmosphere: "Otherworldly glow, liminal space",
    gradient: "from-teal-500/40 via-emerald-900/30 to-slate-950/50",
    accentPosition: "center",
    promptTemplate: "A lone figure walks through a [rain-soaked] Tokyo alley at 2am, surrounded by [otherworldly ambient glow]. The atmosphere feels [liminal and strange] but strangely intimate, framed like a [scene between realities] with surreal color and soft edges. Ethereal quality with [impossible lighting]."
  },
  {
    id: "v7",
    label: "Documentary rawness",
    atmosphere: "Unfiltered truth, street grit",
    gradient: "from-stone-600/40 via-neutral-700/30 to-zinc-900/50",
    accentPosition: "bottom-left",
    promptTemplate: "A lone figure walks through a [rain-soaked] Tokyo alley at 2am, captured with [unflinching documentary eye]. The atmosphere feels [authentically raw] and strangely intimate, framed like a [stolen moment] with natural lighting and urban grit. Street photography with [honest imperfection]."
  },
  {
    id: "v8",
    label: "Cinematic grandeur",
    atmosphere: "Epic scale, emotional weight",
    gradient: "from-sky-600/40 via-blue-800/40 to-indigo-950/60",
    accentPosition: "top-right",
    promptTemplate: "A lone figure walks through a [rain-soaked] Tokyo alley at 2am, [dwarfed by towering architecture]. The atmosphere feels [epically lonely] but strangely intimate, framed like a [widescreen cinema moment] with dramatic composition. Cinematic scope with [architectural grandeur]."
  },
]