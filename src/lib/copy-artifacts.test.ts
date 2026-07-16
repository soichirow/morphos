import { describe, expect, it } from "vitest"

import {
  buildPromptsJson,
  buildThemeCss,
  buildThemeJson,
} from "./copy-artifacts"
import { resolveSystem } from "@/domain/catalog"
import { systems } from "@/data/systems"

describe("copy artifacts", () => {
  it("copies a complete light and dark shadcn theme as CSS", () => {
    const system = resolveSystem(systems, undefined)
    const css = buildThemeCss(system)

    expect(css).toContain(`/* ${system.name}`)
    expect(css).toContain(`System definition: /systems/${system.slug}/system.json`)
    expect(css).toContain(`Prompt records: ${system.assets.promptsJson}`)
    for (const [key, value] of Object.entries(system.tokens)) {
      expect(css).toContain(`  --${key}: ${value};`)
    }
    for (const [key, value] of Object.entries(system.darkTokens)) {
      expect(css).toContain(`  --${key}: ${value};`)
    }
    expect(css).toMatch(/\n\.dark \{[\s\S]+\}\n$/)
  })

  it("copies the complete structured theme as JSON", () => {
    const system = resolveSystem(systems, undefined)
    const theme = JSON.parse(buildThemeJson(system))

    expect(theme).toEqual({
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
    })
  })

  it("copies all prompt records as JSON", () => {
    const system = resolveSystem(systems, undefined)

    expect(JSON.parse(buildPromptsJson(system))).toEqual(
      JSON.parse(JSON.stringify(system.prompts))
    )
  })
})
