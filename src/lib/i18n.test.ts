import { describe, expect, it } from "vitest"

import {
  LANGUAGE_STORAGE_KEY,
  parseLanguage,
  translate,
  translateBiome,
  translateRole,
  translateSort,
  translateSystemDescription,
  translateTaxonomy,
} from "./i18n"

describe("i18n", () => {
  it("provides Japanese and English labels for the same UI concept", () => {
    expect(translate("ja", "gallery.palette")).toBe("パレット")
    expect(translate("en", "gallery.palette")).toBe("Palette")
  })

  it("accepts only supported persisted languages and defaults to Japanese", () => {
    expect(LANGUAGE_STORAGE_KEY).toBe("morphos-ja:language")
    expect(parseLanguage("en")).toBe("en")
    expect(parseLanguage("ja")).toBe("ja")
    expect(parseLanguage("fr")).toBe("ja")
    expect(parseLanguage(null)).toBe("ja")
  })

  it("translates dynamic counts and catalog-facing labels", () => {
    expect(translate("ja", "gallery.resultCount", { count: 611 })).toBe(
      "611件のシステム"
    )
    expect(translate("ja", "landing.and")).toBe("と")
    expect(translate("en", "landing.and")).toBe("and")
    expect(translateTaxonomy("ja", "marine")).toBe("海洋")
    expect(translateRole("ja", "Background")).toBe("背景")
    expect(translateSort("en", "motifName")).toBe("Motif name")
  })

  it("localizes the Artichoke biome and body without changing English", () => {
    const englishDescription = "An architectural content system."

    expect(translateBiome("ja", "mediterranean field")).toBe("地中海の野原")
    expect(translateBiome("en", "mediterranean field")).toBe(
      "mediterranean field"
    )
    expect(
      translateSystemDescription("ja", "morphous-artichoke", englishDescription)
    ).toContain("アーティチョーク")
    expect(
      translateSystemDescription("en", "morphous-artichoke", englishDescription)
    ).toBe(englishDescription)
  })
})
