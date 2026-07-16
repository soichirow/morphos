import { describe, expect, it } from "vitest"

import { buildRobots, buildSitemap } from "./build-sitemap.mjs"

describe("buildSitemap", () => {
  it("lists only canonical, indexable HTML pages with absolute URLs", () => {
    const xml = buildSitemap("https://morphos-ja.pages.dev/")

    expect(xml).toContain("<loc>https://morphos-ja.pages.dev/</loc>")
    expect(xml).toContain("<loc>https://morphos-ja.pages.dev/gallery/</loc>")
    expect(xml).toContain("<loc>https://morphos-ja.pages.dev/privacy/</loc>")
    expect(xml).not.toContain("?system=")
    expect(xml.match(/<url>/g)).toHaveLength(3)
  })

  it("rejects non-HTTP production origins", () => {
    expect(() => buildSitemap("javascript:alert(1)")).toThrow(
      /absolute HTTP\(S\) URL/
    )
  })

  it("generates robots.txt from the same canonical origin", () => {
    expect(buildRobots("https://example.com/")).toBe(
      [
        "User-agent: *",
        "Allow: /",
        "",
        "Sitemap: https://example.com/sitemap.xml",
        "",
      ].join("\n")
    )
  })
})
