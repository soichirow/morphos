import { describe, expect, it } from "vitest"

import { assertMorphousCatalog } from "./morphous-system-contract"
import catalogJson from "@/data/systems.json"
import { systems } from "@/data/systems"


describe("Morphous catalog contract", () => {
  it("accepts the complete generated catalog used by the application", () => {
    expect(() => assertMorphousCatalog(catalogJson)).not.toThrow()
    expect(catalogJson).toHaveLength(611)
  })

  it("rejects a real system when a required token is removed", () => {
    const first = catalogJson[0]
    if (!first) throw new Error("The generated catalog must not be empty")
    const broken = [
      {
        ...first,
        tokens: Object.fromEntries(
          Object.entries(first.tokens).filter(([key]) => key !== "primary")
        ),
      },
    ]

    expect(() => assertMorphousCatalog(broken)).toThrow(
      /missing light token primary/
    )
  })

  it("rejects a real system when a core palette role is missing", () => {
    const first = catalogJson[0]
    if (!first) throw new Error("The generated catalog must not be empty")
    const broken = [
      {
        ...first,
        palette: first.palette.filter((color) => color.role !== "Primary"),
      },
    ]

    expect(() => assertMorphousCatalog(broken)).toThrow(
      /exactly one Primary palette role/
    )
  })

  it("rejects non-string tags before promoting JSON to the domain type", () => {
    const first = catalogJson[0]
    if (!first) throw new Error("The generated catalog must not be empty")
    const broken = [{ ...first, tags: [1] }]

    expect(() => assertMorphousCatalog(broken)).toThrow(
      /tags\[0\] must be a non-empty string/
    )
  })

  it("rejects malformed example assets before promoting JSON to the domain type", () => {
    const first = catalogJson[0]
    if (!first) throw new Error("The generated catalog must not be empty")
    const broken = [
      {
        ...first,
        assets: { ...first.assets, examples: [null] },
      },
    ]

    expect(() => assertMorphousCatalog(broken)).toThrow(
      /assets\.examples\[0\] must be an object/
    )
  })

  it("rejects out-of-range or non-numeric background lightness", () => {
    const first = catalogJson[0]
    if (!first) throw new Error("The generated catalog must not be empty")

    expect(() =>
      assertMorphousCatalog([{ ...first, bgLightness: "0.5" }])
    ).toThrow(/bgLightness must be a finite number between 0 and 1/)
    expect(() =>
      assertMorphousCatalog([{ ...first, bgLightness: 1.5 }])
    ).toThrow(/bgLightness must be a finite number between 0 and 1/)
  })

  it("rejects malformed optional prompt metadata", () => {
    const first = catalogJson[0]
    const firstPrompt = first?.prompts[0]
    if (!first || !firstPrompt) {
      throw new Error("The generated catalog must include prompts")
    }
    const brokenPrompt = { ...firstPrompt, referenceAssets: [42] }

    expect(() =>
      assertMorphousCatalog([{ ...first, prompts: [brokenPrompt, ...first.prompts.slice(1)] }])
    ).toThrow(/referenceAssets\[0\] must be a non-empty string/)
  })

  it("maps every application asset to the configured upstream origin", () => {
    const origin = "https://morphos.ameyanagi.com/"
    for (const system of systems) {
      const prefix = `https://morphos.ameyanagi.com/systems/${system.slug}/`
      expect(system.assets.motif.startsWith(prefix)).toBe(true)
      expect(system.assets.board.startsWith(prefix)).toBe(true)
      expect(system.assets.darkBoard.startsWith(prefix)).toBe(true)
      expect(system.assets.themeCss.startsWith(prefix)).toBe(true)
      expect(system.assets.themeJson.startsWith(prefix)).toBe(true)
      expect(system.assets.promptsJson.startsWith(prefix)).toBe(true)
      if (system.assets.hero) {
        expect(system.assets.hero.startsWith(prefix)).toBe(true)
      }
      if (system.assets.texture) {
        expect(system.assets.texture.startsWith(prefix)).toBe(true)
      }
      for (const example of system.assets.examples) {
        expect(example.image.startsWith(prefix)).toBe(true)
      }
      for (const prompt of system.prompts) {
        expect(prompt.asset.startsWith(prefix)).toBe(true)
        if (prompt.sourceAsset) {
          expect(prompt.sourceAsset.startsWith(origin)).toBe(true)
        }
        for (const reference of prompt.referenceAssets ?? []) {
          expect(reference.startsWith(origin)).toBe(true)
        }
      }
    }
  })
})
