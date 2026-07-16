import { describe, expect, it } from "vitest"

import {
  LANGUAGE_STORAGE_KEY,
  pageMetadata,
  parseLanguage,
  systemDisplayIdentity,
  translate,
  translateBiome,
  translateRole,
  translateSort,
  translateSystemDescription,
  translateTaxonomy,
} from "./i18n"
import { systems } from "@/data/systems"

describe("i18n", () => {
  it("provides Japanese and English labels for the same UI concept", () => {
    expect(translate("ja", "common.siteName")).toBe("モーファス")
    expect(translate("en", "common.siteName")).toBe("Morphous")
    expect(translate("ja", "gallery.palette")).toBe("パレット")
    expect(translate("ja", "gallery.copyThemeCss")).toBe("theme.cssをコピー")
    expect(translate("en", "gallery.copyPromptsJson")).toBe("Copy prompts.json")
    expect(translate("en", "gallery.palette")).toBe("Palette")
  })

  it("accepts only supported persisted languages and defaults to Japanese", () => {
    expect(LANGUAGE_STORAGE_KEY).toBe("morphos-ja:language")
    expect(parseLanguage("en")).toBe("en")
    expect(parseLanguage("ja")).toBe("ja")
    expect(parseLanguage("fr")).toBe("ja")
    expect(parseLanguage(null)).toBe("ja")
  })

  it("keeps page-specific metadata when the display language changes", () => {
    expect(pageMetadata("ja", "/").title).toBe(
      "モーファス - 自然から生まれたデザインシステム"
    )
    expect(pageMetadata("en", "/gallery/")).toEqual({
      title: "Design system gallery | Morphous",
      description:
        "Browse, filter, preview, and share nature-driven design systems.",
    })
    expect(pageMetadata("ja", "/privacy/")).toEqual({
      title: "プライバシー方針 | モーファス",
      description:
        "モーファスにおけるアクセス解析、同意、ローカルストレージの取り扱いを説明します。",
    })
    expect(pageMetadata("en", "/unknown")).toEqual(pageMetadata("en", "/"))
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

  it("shows the Japanese common name first while retaining the English catalog name", () => {
    expect(
      systemDisplayIdentity("ja", {
        slug: "morphous-abalone",
        name: "Morphous Abalone",
        motifName: "Abalone Shell",
      })
    ).toEqual({
      name: "アワビ",
      originalName: "Morphous Abalone",
      motifName: "アワビの貝殻",
    })

    expect(
      systemDisplayIdentity("en", {
        slug: "morphous-abalone",
        name: "Morphous Abalone",
        motifName: "Abalone Shell",
      })
    ).toEqual({
      name: "Morphous Abalone",
      originalName: null,
      motifName: "Abalone Shell",
    })
  })

  it("provides a readable Japanese identity for every catalog system", () => {
    const untranslated = systems.flatMap((system) => {
      const identity = systemDisplayIdentity("ja", system)
      const hasJapaneseText = (value: string) =>
        /[\u3040-\u30ff\u3400-\u9fff]/u.test(value)

      return identity.originalName === system.name &&
        identity.name !== system.name &&
        identity.motifName !== system.motifName &&
        hasJapaneseText(identity.name) &&
        hasJapaneseText(identity.motifName)
        ? []
        : [system.slug]
    })

    expect(systems).toHaveLength(611)
    expect(untranslated).toEqual([])
  })
})
