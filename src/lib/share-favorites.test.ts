import { describe, expect, it } from "vitest"

import {
  buildSystemShareUrl,
  parseFavoriteSlugs,
  toggleFavoriteSlug,
} from "./share-favorites"

describe("buildSystemShareUrl", () => {
  it("選択中のデザインシステムだけを共有できるURLを作る", () => {
    expect(
      buildSystemShareUrl(
        "https://morphos-ja.pages.dev/gallery?q=blue&sort=color",
        "morphous-blue-whale"
      )
    ).toBe("https://morphos-ja.pages.dev/gallery?system=morphous-blue-whale")
  })
})

describe("parseFavoriteSlugs", () => {
  it("保存済みのお気に入りを重複なしで復元する", () => {
    expect(
      parseFavoriteSlugs(
        '["morphous-blue-whale","morphous-blue-whale","morphous-zinnia"]'
      )
    ).toEqual(["morphous-blue-whale", "morphous-zinnia"])
  })

  it("壊れた保存値は空のお気に入りとして扱う", () => {
    expect(parseFavoriteSlugs("not-json")).toEqual([])
    expect(parseFavoriteSlugs('{"slug":"morphous-zinnia"}')).toEqual([])
  })
})

describe("toggleFavoriteSlug", () => {
  it("未登録なら追加し、登録済みなら削除する", () => {
    expect(toggleFavoriteSlug([], "morphous-zinnia")).toEqual([
      "morphous-zinnia",
    ])
    expect(
      toggleFavoriteSlug(
        ["morphous-blue-whale", "morphous-zinnia"],
        "morphous-zinnia"
      )
    ).toEqual(["morphous-blue-whale"])
  })
})
