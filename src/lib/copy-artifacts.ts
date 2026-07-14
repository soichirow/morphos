import type { MorphousSystem } from "@/data/systems"

type ThemeTokens = Pick<MorphousSystem, "tokens" | "darkTokens">

function blockToCss(selector: string, tokens: Record<string, string>): string {
  const lines = Object.entries(tokens).map(
    ([key, value]) => `  --${key}: ${value};`
  )
  return `${selector} {\n${lines.join("\n")}\n}`
}

export function buildThemeCss(system: ThemeTokens): string {
  return `${blockToCss(":root", system.tokens)}\n\n${blockToCss(".dark", system.darkTokens)}\n`
}

export function buildThemeJson(system: MorphousSystem): string {
  const theme = {
    schema: "morphous.theme.v1",
    source:
      "Generated from a per-system Morphous manifest and prompt records. CSS variables are shadcn/tweakcn-compatible.",
    identity: {
      slug: system.slug,
      name: system.name,
      motifName: system.motifName,
      motifCategory: system.motifCategory,
      biome: system.biome,
      motif: system.motif,
    },
    palette: system.palette,
    light: system.tokens,
    dark: system.darkTokens,
    typography: system.typography,
    layout: system.layout,
    tags: system.tags,
    assets: system.assets,
    prompts: system.prompts,
  }

  return `${JSON.stringify(theme, null, 2)}\n`
}

export function buildPromptsJson(
  system: Pick<MorphousSystem, "prompts">
): string {
  return `${JSON.stringify(system.prompts, null, 2)}\n`
}
