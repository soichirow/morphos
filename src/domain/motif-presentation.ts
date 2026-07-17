export type MotifDisplayMode = "fluffy" | "mosaic" | "normal"

export type MotifPresentationPolicy =
  "default-stylized" | "safe-optional" | "standard"

type MotifPresentationSource = {
  slug: string
  motifCategory: string
}

const defaultStylizedSlugs = new Set([
  "morphous-alligator",
  "morphous-barnacle",
  "morphous-banana-slug",
  "morphous-birds-nest-fungus",
  "morphous-caecilian",
  "morphous-coral-snake",
  "morphous-green-viper",
  "morphous-lotus-seedpod",
  "morphous-morel",
  "morphous-octopus",
  "morphous-python",
  "morphous-rattlesnake",
  "morphous-sea-cucumber",
  "morphous-stinkhorn",
  "morphous-wood-ear",
])

const standardReptileSlugs = new Set([
  "morphous-box-turtle",
  "morphous-painted-turtle",
  "morphous-sea-turtle",
  "morphous-tortoise",
])

const safeOptionalSlugs = new Set([
  "morphous-bat",
  "morphous-blue-ring-octopus",
  "morphous-brittle-star",
  "morphous-cuttlefish",
  "morphous-dumbo-octopus",
  "morphous-earthstar",
  "morphous-feather-star",
  "morphous-fruit-bat",
  "morphous-giant-clam",
  "morphous-glass-squid",
  "morphous-horseshoe-crab",
  "morphous-indigo-milkcap",
  "morphous-ink-cap",
  "morphous-jellyfish",
  "morphous-king-vulture",
  "morphous-lions-mane",
  "morphous-moon-jelly",
  "morphous-moon-jellyfish",
  "morphous-oarfish",
  "morphous-portuguese-man-o-war",
  "morphous-puffball",
  "morphous-sea-anemone",
  "morphous-sea-urchin",
  "morphous-snow-fungus",
  "morphous-squid",
  "morphous-vampire-squid",
  "morphous-veiled-lady",
  "morphous-witches-butter",
])

export function motifPresentationFor(
  system: MotifPresentationSource
): MotifPresentationPolicy {
  if (
    system.motifCategory === "insect" ||
    defaultStylizedSlugs.has(system.slug)
  ) {
    return "default-stylized"
  }

  if (
    system.motifCategory === "amphibian" ||
    system.motifCategory === "crustacean" ||
    system.motifCategory === "mollusk" ||
    (system.motifCategory === "reptile" &&
      !standardReptileSlugs.has(system.slug)) ||
    safeOptionalSlugs.has(system.slug)
  ) {
    return "safe-optional"
  }

  return "standard"
}

export function hasGentleMotifIllustration(
  _system: MotifPresentationSource
): boolean {
  return true
}

export function shouldUseGentleMotif(
  displayMode: MotifDisplayMode,
  revealed = false
): boolean {
  return displayMode !== "normal" && !revealed
}
