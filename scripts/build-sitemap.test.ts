import { describe, expect, it } from "vitest"

import { buildSitemap } from "./build-sitemap.mjs"

describe("buildSitemap", () => {
  it("lists the landing page, gallery, and every unique shareable system URL", () => {
    const xml = buildSitemap("https://morphos-ja.pages.dev/", [
      "morphous-artichoke",
      "morphous-birch",
      "morphous-artichoke",
    ])

    expect(xml).toContain("<loc>https://morphos-ja.pages.dev/</loc>")
    expect(xml).toContain("<loc>https://morphos-ja.pages.dev/gallery</loc>")
    expect(xml).toContain(
      "<loc>https://morphos-ja.pages.dev/gallery?system=morphous-artichoke</loc>"
    )
    expect(xml).toContain(
      "<loc>https://morphos-ja.pages.dev/gallery?system=morphous-birch</loc>"
    )
    expect(xml.match(/<url>/g)).toHaveLength(4)
  })

  it("escapes XML-sensitive URL characters", () => {
    const xml = buildSitemap("https://example.com/?lang=ja&mode=all", [])

    expect(xml).toContain("https://example.com/?lang=ja&amp;mode=all/")
  })
})
