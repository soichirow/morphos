import { describe, expect, it } from "vitest"

import {
  buildSocialShareUrl,
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

describe("buildSocialShareUrl", () => {
  it("Xの投稿画面へ共有URLと日英の紹介文を渡す", () => {
    const result = new URL(
      buildSocialShareUrl("x", {
        url: "https://morphos-ja.pages.dev/gallery?system=morphous-artichoke",
        title: "Morphous Artichoke",
        text: "自然から生まれたデザインシステム / Nature-driven design system",
      })
    )

    expect(result.origin + result.pathname).toBe(
      "https://twitter.com/intent/tweet"
    )
    expect(result.searchParams.get("url")).toBe(
      "https://morphos-ja.pages.dev/gallery?system=morphous-artichoke"
    )
    expect(result.searchParams.get("text")).toContain("Morphous Artichoke")
  })

  it("海外の主要SNSごとに公式の共有画面URLを作る", () => {
    const expectedEndpoints = {
      facebook: "https://www.facebook.com/sharer/sharer.php",
      linkedin: "https://www.linkedin.com/sharing/share-offsite/",
      bluesky: "https://bsky.app/intent/compose",
      reddit: "https://www.reddit.com/submit",
      whatsapp: "https://wa.me/",
      telegram: "https://t.me/share/url",
    } as const
    const payload = {
      url: "https://morphos-ja.pages.dev/gallery?system=morphous-artichoke",
      title: "Morphous Artichoke",
      text: "自然から生まれたデザインシステム / Nature-driven design system",
    }

    for (const [target, endpoint] of Object.entries(expectedEndpoints)) {
      const result = new URL(
        buildSocialShareUrl(
          target as Parameters<typeof buildSocialShareUrl>[0],
          payload
        )
      )
      expect(result.origin + result.pathname).toBe(endpoint)
      expect(decodeURIComponent(result.search)).toContain(payload.url)
    }
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
