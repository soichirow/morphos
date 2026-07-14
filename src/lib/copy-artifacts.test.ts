import { describe, expect, it } from "vitest"

import {
  buildPromptsJson,
  buildThemeCss,
  buildThemeJson,
} from "./copy-artifacts"
import { systems } from "@/data/systems"

describe("copy artifacts", () => {
  it("copies a complete light and dark shadcn theme as CSS", () => {
    const system = systems[0]
    const css = buildThemeCss(system)

    expect(css).toContain(":root {")
    expect(css).toContain(".dark {")
  })

  it("copies the complete structured theme as JSON", () => {
    const system = systems[0]
    const theme = JSON.parse(buildThemeJson(system))

    expect(theme).toMatchObject({
      schema: "morphous.theme.v1",
      identity: { slug: system.slug },
      light: system.tokens,
      dark: system.darkTokens,
      prompts: JSON.parse(JSON.stringify(system.prompts)),
    })
  })

  it("copies all prompt records as JSON", () => {
    const system = systems[0]

    expect(JSON.parse(buildPromptsJson(system))).toEqual(
      JSON.parse(JSON.stringify(system.prompts))
    )
  })
})
