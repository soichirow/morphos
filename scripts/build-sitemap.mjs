import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const DEFAULT_BASE_URL = "https://morphos-ja.pages.dev"
const DEFAULT_CATALOG_PATH = resolve("src/data/systems.json")

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

export function buildSitemap(baseUrl, slugs) {
  const base = baseUrl.replace(/\/+$/, "")
  const uniqueSlugs = [...new Set(slugs)]
  const urls = [
    `${base}/`,
    `${base}/gallery`,
    ...uniqueSlugs.map(
      (slug) => `${base}/gallery?system=${encodeURIComponent(slug)}`
    ),
  ]

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    "</urlset>",
    "",
  ].join("\n")
}

export async function writeSitemap({
  catalogPath = DEFAULT_CATALOG_PATH,
  outputPath = resolve(".output/public/sitemap.xml"),
  baseUrl = DEFAULT_BASE_URL,
} = {}) {
  const systems = JSON.parse(await readFile(catalogPath, "utf8"))
  if (!Array.isArray(systems)) {
    throw new TypeError("Catalog must be an array")
  }

  const slugs = systems.map((system) => system.slug)
  const xml = buildSitemap(baseUrl, slugs)
  await writeFile(outputPath, xml, "utf8")

  return { urlCount: new Set(slugs).size + 2, outputPath }
}
