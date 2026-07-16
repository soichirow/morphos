function blockToCss(selector, tokens) {
  const lines = Object.entries(tokens).map(
    ([key, value]) => `  --${key}: ${value};`
  )
  return `${selector} {\n${lines.join("\n")}\n}`
}

export function buildThemeCssArtifact(system) {
  return `/* ${system.name}
   System definition: /systems/${system.slug}/system.json
   Prompt records: ${system.assets.promptsJson}
   Design-system references:
   light: ${system.assets.board}
   dark: ${system.assets.darkBoard}
 */

${blockToCss(":root", system.tokens)}

${blockToCss(".dark", system.darkTokens)}
`
}

export function buildThemePayload(system) {
  return {
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
}

export function buildThemeJsonArtifact(system) {
  return `${JSON.stringify(buildThemePayload(system), null, 2)}\n`
}
