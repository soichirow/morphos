import { writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const DEFAULT_BASE_URL = "https://morphos-ja.pages.dev"

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

function canonicalOrigin(baseUrl) {
  const url = new URL(baseUrl)
  if (
    (url.protocol !== "https:" && url.protocol !== "http:") ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new TypeError("Site origin must be an absolute HTTP(S) URL")
  }
  return url.origin
}

export function buildSitemap(baseUrl) {
  const base = canonicalOrigin(baseUrl)
  const urls = [`${base}/`, `${base}/gallery/`, `${base}/privacy/`]

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    "</urlset>",
    "",
  ].join("\n")
}

export function buildRobots(baseUrl) {
  const base = canonicalOrigin(baseUrl)
  return [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${base}/sitemap.xml`,
    "",
  ].join("\n")
}

export async function writeDiscoveryFiles({
  outputPath = resolve(".output/public/sitemap.xml"),
  robotsPath = resolve(".output/public/robots.txt"),
  baseUrl = process.env.VITE_SITE_URL || DEFAULT_BASE_URL,
} = {}) {
  await writeFile(outputPath, buildSitemap(baseUrl), "utf8")
  await writeFile(robotsPath, buildRobots(baseUrl), "utf8")

  return { urlCount: 3, outputPath, robotsPath }
}
