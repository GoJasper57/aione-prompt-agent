// Get semantic alternatives for editable fragments
export function getAlternativesForFragment(text: string): string[] {
  const alternativesMap: Record<string, string[]> = {
    "rain-soaked": ["mist-shrouded", "neon-drenched", "steam-filled", "shadow-wrapped"],
    "cold neon reflections": ["warm amber pools", "harsh white glare", "soft diffused glow", "flickering color"],
    "emotionally distant": ["tenderly melancholic", "quietly contemplative", "achingly present", "peacefully detached"],
    "quiet cinematic memory": ["fading photograph", "half-forgotten dream", "stolen moment", "eternal pause"],
    "deep shadows": ["gentle darkness", "layered grays", "absolute blacks", "soft penumbra"],
    "warm tungsten glow": ["cold fluorescent wash", "mixed color sources", "single spotlight", "ambient scatter"],
    "tenderly melancholic": ["bittersweet nostalgia", "quiet acceptance", "wistful longing", "peaceful sadness"],
    "fading photograph": ["vivid memory", "impressionist blur", "sharp recollection", "watercolor wash"],
    "gentle light diffusion": ["harsh direct light", "dappled shadows", "even illumination", "dramatic contrast"],
    "dissolving into mist": ["sharply defined", "partially obscured", "fragmenting into light", "merging with shadow"],
    "surreally detached": ["hyperreal present", "floating awareness", "grounded uncertainty", "lucid distance"],
    "half-remembered dream": ["vivid hallucination", "waking vision", "subconscious flash", "memory fragment"],
    "ethereal light bleeding": ["contained illumination", "light leaking", "glowing edges", "soft radiation"],
    "geometric silhouette": ["detailed figure", "soft outline", "fragmented form", "solid presence"],
    "coldly isolated": ["warmly solitary", "peacefully alone", "achingly separate", "contentedly distant"],
    "brutal minimalism": ["rich complexity", "subtle detail", "stark simplicity", "elegant reduction"],
    "visible film grain": ["smooth digital clarity", "heavy texture", "subtle noise", "organic imperfection"],
    "intimately human": ["coolly observed", "warmly embraced", "honestly captured", "tenderly seen"],
    "candid street photograph": ["composed portrait", "spontaneous capture", "observed moment", "witnessed scene"],
    "subtle color cast": ["neutral accuracy", "bold color shift", "monochromatic tint", "cross-processed look"],
    "otherworldly ambient glow": ["natural light source", "artificial illumination", "bioluminescent feel", "radioactive cast"],
    "liminal and strange": ["familiar and grounded", "uncanny and shifted", "dreamlike and floating", "hyperreal and sharp"],
    "scene between realities": ["grounded moment", "parallel existence", "threshold space", "dimensional slip"],
    "impossible lighting": ["motivated light", "practical sources", "available light", "studio precision"],
    "unflinching documentary eye": ["romanticized gaze", "poetic interpretation", "raw observation", "gentle witness"],
    "authentically raw": ["carefully polished", "honestly imperfect", "beautifully flawed", "unfiltered truth"],
    "stolen moment": ["composed scene", "decisive instant", "patient observation", "quick glimpse"],
    "honest imperfection": ["careful precision", "natural accident", "embraced flaw", "authentic error"],
    "dwarfed by towering architecture": ["intimate with surroundings", "balanced in scale", "dominating the frame", "lost in space"],
    "epically lonely": ["quietly solitary", "grandly isolated", "peacefully alone", "dramatically singular"],
    "widescreen cinema moment": ["intimate portrait crop", "square contemplation", "vertical drama", "panoramic sweep"],
    "architectural grandeur": ["human intimacy", "environmental detail", "spatial compression", "volumetric depth"],
  }

  return alternativesMap[text] || ["subtle shift", "dramatic reinterpretation", "softer approach", "bolder direction"]
}