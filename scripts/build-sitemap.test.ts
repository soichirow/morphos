import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { buildRobots, buildSitemap, writeDiscoveryFiles } from "./build-sitemap.mjs"

describe("buildSitemap", () => {
  it("lists only canonical, indexable HTML pages with absolute URLs", () => {
    const xml = buildSitemap("https://morphos.so1ro.com/")

    expect(xml).toContain("<loc>https://morphos.so1ro.com/</loc>")
    expect(xml).toContain("<loc>https://morphos.so1ro.com/gallery/</loc>")
    expect(xml).toContain("<loc>https://morphos.so1ro.com/privacy/</loc>")
    expect(xml).not.toContain("?system=")
    expect(xml.match(/<url>/g)).toHaveLength(3)
  })

  it("writes discovery files for the custom production origin by default", async () => {
    const directory = await mkdtemp(join(tmpdir(), "morphos-sitemap-"))
    const outputPath = join(directory, "sitemap.xml")
    const robotsPath = join(directory, "robots.txt")

    try {
      await writeDiscoveryFiles({ outputPath, robotsPath })

      expect(await readFile(outputPath, "utf8")).toContain(
        "<loc>https://morphos.so1ro.com/</loc>"
      )
      expect(await readFile(robotsPath, "utf8")).toContain(
        "Sitemap: https://morphos.so1ro.com/sitemap.xml"
      )
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
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
