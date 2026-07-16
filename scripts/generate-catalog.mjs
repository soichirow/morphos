import fs from "node:fs/promises"
import path from "node:path"
import {
  buildThemeCssArtifact,
  buildThemePayload,
} from "../src/domain/theme-artifact-serializer.js"
import { REQUIRED_TOKEN_KEYS } from "../src/domain/morphous-system-constants.js"

const ROOT = process.cwd()
const systemsRoot = path.join(ROOT, "public", "systems")
const dataDir = path.join(ROOT, "src", "data")
const snapshotPath = path.join(dataDir, "systems.json")

function hexToRgb(hex) {
  const value = hex.replace("#", "")
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ]
}

function rgbToHex([r, g, b]) {
  return `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`
}

function srgbToLinear(value) {
  const channel = value / 255
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4
}

function rgbToOklch(rgb) {
  const [r, g, b] = rgb.map(srgbToLinear)
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
  const lRoot = Math.cbrt(l)
  const mRoot = Math.cbrt(m)
  const sRoot = Math.cbrt(s)
  const okL = 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot
  const okA = 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot
  const okB = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot
  const chroma = Math.sqrt(okA * okA + okB * okB)
  const hue = ((Math.atan2(okB, okA) * 180) / Math.PI + 360) % 360
  return `oklch(${okL.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(1)})`
}

function hexToOklch(hex) {
  return rgbToOklch(hexToRgb(hex))
}

function blendHex(a, b, t) {
  const from = hexToRgb(a)
  const to = hexToRgb(b)
  return rgbToHex([
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
    from[2] + (to[2] - from[2]) * t,
  ])
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const SEARCH_STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "of",
  "to",
  "in",
  "on",
  "for",
  "with",
  "by",
  "from",
  "at",
  "as",
  "is",
  "are",
  "be",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "into",
  "via",
  "use",
  "case",
  "asset",
  "type",
  "prompt",
  "morphous",
  "transparent",
  "cutout",
  "source",
  "mode",
  "board",
  "light",
  "dark",
  "ui",
  "mockup",
  "natural",
  "photorealistic",
  "design",
  "system",
  "reference",
  "references",
])

function buildSearchBlob(prompts) {
  const seen = new Set()
  const tokens = []
  const text = prompts
    .map((entry) => `${entry.label ?? ""} ${entry.prompt ?? ""}`)
    .join(" ")
    .toLowerCase()
  for (const raw of text.split(/[^a-z0-9]+/)) {
    if (raw.length < 3 || raw.length > 24) continue
    if (SEARCH_STOPWORDS.has(raw)) continue
    if (seen.has(raw)) continue
    seen.add(raw)
    tokens.push(raw)
  }
  let blob = tokens.join(" ")
  if (blob.length > 2048) blob = blob.slice(0, 2048).replace(/\s\S*$/, "")
  return blob
}

function asPublicPath(slug, value) {
  if (!value) return value
  return value.startsWith("/") ? value : `/systems/${slug}/${value}`
}

function normalizeAssets(slug, assets) {
  return {
    motif: asPublicPath(slug, assets.motif),
    board: asPublicPath(slug, assets.board),
    darkBoard: asPublicPath(slug, assets.darkBoard),
    hero: assets.hero ? asPublicPath(slug, assets.hero) : undefined,
    texture: assets.texture ? asPublicPath(slug, assets.texture) : undefined,
    examples: (assets.examples ?? []).map((example) => ({
      ...example,
      image: asPublicPath(slug, example.image),
    })),
    themeCss: asPublicPath(slug, assets.themeCss ?? "theme.css"),
    themeJson: asPublicPath(slug, assets.themeJson ?? "theme.json"),
    promptsJson: asPublicPath(slug, assets.promptsJson ?? "prompts.json"),
  }
}

function makePalette(entries) {
  return entries.map((entry) => {
    const role = entry.role
    const name = entry.name
    const hex = entry.hex
    assert(role && name && hex, "Palette entries need role, name, and hex")
    return {
      role,
      name,
      hex,
      oklch: entry.oklch ?? hexToOklch(hex),
    }
  })
}

function role(palette, names, fallbackIndex) {
  const aliases = Array.isArray(names) ? names : [names]
  const found = palette.find((entry) => aliases.includes(entry.role))
  if (found) return found
  return palette[fallbackIndex] ?? palette[0]
}

function orderedTokens(tokens) {
  const ordered = {}
  for (const key of REQUIRED_TOKEN_KEYS) {
    assert(tokens[key], `Missing token ${key}`)
    ordered[key] = tokens[key]
  }
  return ordered
}

function buildTokensFromPalette(palette) {
  const background = role(palette, "Background", 0)
  const ink = role(palette, ["Ink", "Foreground"], 1)
  const primary = role(palette, "Primary", 2)
  const secondary = role(palette, "Secondary", 3)
  const accent = role(palette, "Accent", 4)
  const signal = role(palette, "Signal", 5)
  const surface = role(palette, ["Surface", "Card"], 6)
  const muted = role(palette, "Muted", 3)
  const depth = role(palette, "Depth", 1)
  const border = hexToOklch(blendHex(surface.hex, muted.hex, 0.36))
  const secondarySurface = hexToOklch(
    blendHex(surface.hex, background.hex, 0.42)
  )
  const mutedSurface = hexToOklch(blendHex(surface.hex, background.hex, 0.28))
  const darkCard = hexToOklch(blendHex(depth.hex, ink.hex, 0.34))
  const darkMuted = hexToOklch(blendHex(depth.hex, muted.hex, 0.22))

  const light = orderedTokens({
    background: background.oklch,
    foreground: ink.oklch,
    card: surface.oklch,
    "card-foreground": ink.oklch,
    popover: surface.oklch,
    "popover-foreground": ink.oklch,
    primary: primary.oklch,
    "primary-foreground": background.oklch,
    secondary: secondarySurface,
    "secondary-foreground": depth.oklch,
    muted: mutedSurface,
    "muted-foreground": depth.oklch,
    accent: accent.oklch,
    "accent-foreground": ink.oklch,
    destructive: primary.oklch,
    border,
    input: border,
    ring: secondary.oklch,
    "chart-1": primary.oklch,
    "chart-2": secondary.oklch,
    "chart-3": accent.oklch,
    "chart-4": signal.oklch,
    "chart-5": depth.oklch,
    sidebar: hexToOklch(blendHex(background.hex, surface.hex, 0.66)),
    "sidebar-foreground": ink.oklch,
    "sidebar-primary": primary.oklch,
    "sidebar-primary-foreground": background.oklch,
    "sidebar-accent": hexToOklch(blendHex(surface.hex, primary.hex, 0.12)),
    "sidebar-accent-foreground": primary.oklch,
    "sidebar-border": border,
    "sidebar-ring": secondary.oklch,
    radius: "0.5rem",
  })

  return {
    light,
    dark: orderedTokens({
      background: ink.oklch,
      foreground: background.oklch,
      card: darkCard,
      "card-foreground": background.oklch,
      popover: darkCard,
      "popover-foreground": background.oklch,
      primary: secondary.oklch,
      "primary-foreground": ink.oklch,
      secondary: darkMuted,
      "secondary-foreground": background.oklch,
      muted: darkMuted,
      "muted-foreground": hexToOklch(blendHex(background.hex, muted.hex, 0.45)),
      accent: accent.oklch,
      "accent-foreground": ink.oklch,
      destructive: primary.oklch,
      border: "oklch(1 0 0 / 12%)",
      input: "oklch(1 0 0 / 16%)",
      ring: secondary.oklch,
      "chart-1": secondary.oklch,
      "chart-2": primary.oklch,
      "chart-3": accent.oklch,
      "chart-4": signal.oklch,
      "chart-5": muted.oklch,
      sidebar: hexToOklch(blendHex(ink.hex, depth.hex, 0.46)),
      "sidebar-foreground": background.oklch,
      "sidebar-primary": secondary.oklch,
      "sidebar-primary-foreground": ink.oklch,
      "sidebar-accent": darkMuted,
      "sidebar-accent-foreground": background.oklch,
      "sidebar-border": "oklch(1 0 0 / 12%)",
      "sidebar-ring": secondary.oklch,
      radius: light.radius,
    }),
  }
}

function normalizeTokens(manifest, palette) {
  if (manifest.tokens || manifest.darkTokens) {
    assert(
      manifest.tokens && manifest.darkTokens,
      `${manifest.slug} must provide both tokens and darkTokens`
    )
    return {
      light: orderedTokens(manifest.tokens),
      dark: orderedTokens(manifest.darkTokens),
    }
  }
  return buildTokensFromPalette(palette)
}

function publicFile(publicPath) {
  return path.join(ROOT, "public", publicPath.replace(/^\//, ""))
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"))
}

async function existsPath(file) {
  try {
    await fs.access(file)
    return true
  } catch {
    return false
  }
}

async function writeJson(file, value) {
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`)
}

async function getSystemManifests() {
  let entries
  try {
    entries = await fs.readdir(systemsRoot, { withFileTypes: true })
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return []
    }
    throw error
  }
  const manifests = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const manifestPath = path.join(systemsRoot, entry.name, "system.json")
    try {
      await fs.access(manifestPath)
      manifests.push(manifestPath)
    } catch {
      // System folders without a manifest are ignored.
    }
  }
  return manifests.sort()
}

function shouldCatalog(manifest) {
  return !["draft", "queued", "incomplete"].includes(
    String(manifest.status ?? "ready")
  )
}

async function hasCatalogInputs(manifest) {
  const slug = manifest.slug
  if (!slug || !manifest.assets) return false
  const assets = normalizeAssets(slug, manifest.assets)
  const requiredPublicPaths = [
    assets.motif,
    assets.board,
    assets.darkBoard,
    assets.promptsJson,
  ]
  for (const publicPath of requiredPublicPaths) {
    if (!publicPath || !(await existsPath(publicFile(publicPath)))) return false
  }
  return true
}

async function buildSystem(manifestPath) {
  const manifest = await readJson(manifestPath)
  const slug = manifest.slug
  assert(slug, `${manifestPath} is missing slug`)
  const systemDir = path.join(systemsRoot, slug)
  const promptsPath = path.join(systemDir, "prompts.json")
  const prompts = await readJson(promptsPath)
  const palette = makePalette(manifest.palette)
  const tokenSet = normalizeTokens(manifest, palette)
  const assets = normalizeAssets(slug, manifest.assets)
  const background = role(palette, "Background", 0)
  const bgLightness = Number(relativeLuminance(background.hex).toFixed(3))
  const searchBlob = buildSearchBlob(prompts)
  const motifLabel = manifest.motifName ?? manifest.name ?? slug

  return {
    slug,
    name: manifest.name,
    motifName: manifest.motifName,
    motifCategory: manifest.motifCategory,
    biome: manifest.biome,
    motif: manifest.motif,
    description: manifest.description,
    typography:
      manifest.typography ??
      `Readable product UI typography with Japanese guidance for labels, metrics, and ${motifLabel} themed content.`,
    layout:
      manifest.layout ??
      `Responsive 8px-grid layouts with ${motifLabel} inspired surfaces, navigation, cards, forms, tables, and dashboard states.`,
    tags: manifest.tags ?? [],
    palette,
    tokens: tokenSet.light,
    darkTokens: tokenSet.dark,
    prompts,
    assets,
    bgLightness,
    searchBlob,
  }
}

function renderSystemsModule(systems) {
  return `import type { MorphousSystem } from "@/domain/morphous-system"

export type { MorphousSystem } from "@/domain/morphous-system"

const UPSTREAM_ASSET_ORIGIN = "https://morphos.ameyanagi.com"

function upstreamAsset(assetPath: string): string {
  return new URL(assetPath, UPSTREAM_ASSET_ORIGIN).toString()
}

const upstreamSystems = ${JSON.stringify(systems, null, 2)} satisfies Array<MorphousSystem>

export const systems: Array<MorphousSystem> = upstreamSystems.map(
  (system) => {
    const typedSystem: MorphousSystem = system
    return {
      ...typedSystem,
      prompts: typedSystem.prompts.map((prompt) => ({
        ...prompt,
        asset: upstreamAsset(prompt.asset),
        sourceAsset: prompt.sourceAsset
          ? upstreamAsset(prompt.sourceAsset)
          : undefined,
        referenceAssets: prompt.referenceAssets?.map(upstreamAsset),
      })),
      assets: {
        ...typedSystem.assets,
        motif: upstreamAsset(typedSystem.assets.motif),
        board: upstreamAsset(typedSystem.assets.board),
        darkBoard: upstreamAsset(typedSystem.assets.darkBoard),
        hero: typedSystem.assets.hero ? upstreamAsset(typedSystem.assets.hero) : undefined,
        texture: typedSystem.assets.texture ? upstreamAsset(typedSystem.assets.texture) : undefined,
        examples: typedSystem.assets.examples.map((example) => ({
          ...example,
          image: upstreamAsset(example.image),
        })),
        themeCss: upstreamAsset(typedSystem.assets.themeCss),
        themeJson: upstreamAsset(typedSystem.assets.themeJson),
        promptsJson: upstreamAsset(typedSystem.assets.promptsJson),
      },
    }
  }
)

export const motifCategories = Array.from(new Set(systems.map((system) => system.motifCategory))).sort()
`
}

async function main() {
  await fs.mkdir(dataDir, { recursive: true })
  const manifestPaths = await getSystemManifests()
  const systems = []
  if (manifestPaths.length === 0) {
    systems.push(...(await readJson(snapshotPath)))
  } else {
    for (const manifestPath of manifestPaths) {
      const manifest = await readJson(manifestPath)
      if (!shouldCatalog(manifest)) continue
      if (!(await hasCatalogInputs(manifest))) continue
      const system = await buildSystem(manifestPath)
      await fs.writeFile(
        publicFile(system.assets.themeCss),
        buildThemeCssArtifact(system)
      )
      await writeJson(
        publicFile(system.assets.themeJson),
        buildThemePayload(system)
      )
      systems.push(system)
    }
  }

  const modulePath = path.join(dataDir, "systems.ts")
  const moduleSource = renderSystemsModule(systems)
  const checkOnly = process.argv.includes("--check")
  if (checkOnly) {
    const current = await fs.readFile(modulePath, "utf8")
    assert(current === moduleSource, "Generated systems.ts is out of date")
  } else {
    if (manifestPaths.length > 0) await writeJson(snapshotPath, systems)
    await fs.writeFile(modulePath, moduleSource)
  }

  process.stdout.write(
    `${checkOnly ? "Verified" : "Generated"} ${systems.length} Morphous systems.\n`
  )
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
