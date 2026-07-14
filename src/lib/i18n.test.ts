import { describe, expect, it } from "vitest"

import {
  LANGUAGE_STORAGE_KEY,
  parseLanguage,
  translate,
  translateRole,
  translateSort,
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
})
