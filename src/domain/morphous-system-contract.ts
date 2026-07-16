import type { MorphousSystem } from "@/domain/morphous-system"
import {
  CORE_PALETTE_ROLES,
  REQUIRED_TOKEN_KEYS,
} from "@/domain/morphous-system"

export { REQUIRED_TOKEN_KEYS } from "@/domain/morphous-system"

const HEX_COLOR = /^#[0-9a-f]{6}$/i
const SYSTEM_SLUG = /^morphous-[a-z0-9]+(?:-[a-z0-9]+)*$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) throw new Error(`${label} must be an object`)
  return value
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`)
  }
  return value
}

function requireOptionalString(value: unknown, label: string): void {
  if (value !== undefined) requireString(value, label)
}

function requireStringArray(value: unknown, label: string): void {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`)
  for (const [index, entry] of value.entries()) {
    requireString(entry, `${label}[${index}]`)
  }
}

function requireOptionalStringArray(value: unknown, label: string): void {
  if (value !== undefined) requireStringArray(value, label)
}

function requireUnitInterval(value: unknown, label: string): void {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1
  ) {
    throw new Error(`${label} must be a finite number between 0 and 1`)
  }
}

function requireAssetPath(value: unknown, slug: string, label: string): void {
  const asset = requireString(value, label)
  if (!asset.startsWith(`/systems/${slug}/`)) {
    throw new Error(`${label} must belong to ${slug}`)
  }
}

function validateTokens(
  value: unknown,
  slug: string,
  mode: "light" | "dark"
): void {
  const tokens = requireRecord(value, `${slug} ${mode} tokens`)
  for (const token of REQUIRED_TOKEN_KEYS) {
    requireString(tokens[token], `${slug} missing ${mode} token ${token}`)
  }
}

function validatePalette(value: unknown, slug: string): void {
  if (!Array.isArray(value) || value.length < 6) {
    throw new Error(`${slug} must have at least 6 palette colors`)
  }
  const roleCounts = new Map<string, number>()
  for (const [index, entry] of value.entries()) {
    const color = requireRecord(entry, `${slug} palette[${index}]`)
    const role = requireString(color.role, `${slug} palette[${index}].role`)
    roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1)
    requireString(color.name, `${slug} palette[${index}].name`)
    const hex = requireString(color.hex, `${slug} palette[${index}].hex`)
    if (!HEX_COLOR.test(hex)) {
      throw new Error(`${slug} palette[${index}].hex must be #RRGGBB`)
    }
    requireString(color.oklch, `${slug} palette[${index}].oklch`)
  }
  for (const role of CORE_PALETTE_ROLES) {
    if ((roleCounts.get(role) ?? 0) !== 1) {
      throw new Error(`${slug} must include exactly one ${role} palette role`)
    }
  }
}

function validatePrompts(value: unknown, slug: string): void {
  if (!Array.isArray(value) || value.length < 3) {
    throw new Error(`${slug} must include at least 3 reusable prompts`)
  }
  for (const [index, entry] of value.entries()) {
    const prompt = requireRecord(entry, `${slug} prompts[${index}]`)
    requireString(prompt.id, `${slug} prompts[${index}].id`)
    requireString(prompt.label, `${slug} prompts[${index}].label`)
    requireString(prompt.prompt, `${slug} prompts[${index}].prompt`)
    requireAssetPath(prompt.asset, slug, `${slug} prompts[${index}].asset`)
    requireOptionalString(
      prompt.sourceAsset,
      `${slug} prompts[${index}].sourceAsset`
    )
    requireOptionalStringArray(
      prompt.referenceAssets,
      `${slug} prompts[${index}].referenceAssets`
    )
    for (const field of ["workflow", "postProcess", "postProcessing", "kind"]) {
      requireOptionalString(prompt[field], `${slug} prompts[${index}].${field}`)
    }
  }
}

function validateSystem(value: unknown): string {
  const system = requireRecord(value, "system")
  const slug = requireString(system.slug, "system.slug")
  if (!SYSTEM_SLUG.test(slug)) throw new Error(`Invalid system slug ${slug}`)

  for (const field of [
    "name",
    "motifName",
    "motifCategory",
    "biome",
    "motif",
    "description",
    "typography",
    "layout",
    "searchBlob",
  ]) {
    requireString(system[field], `${slug}.${field}`)
  }
  requireStringArray(system.tags, `${slug}.tags`)
  requireUnitInterval(system.bgLightness, `${slug}.bgLightness`)
  validatePalette(system.palette, slug)
  validateTokens(system.tokens, slug, "light")
  validateTokens(system.darkTokens, slug, "dark")
  validatePrompts(system.prompts, slug)

  const assets = requireRecord(system.assets, `${slug}.assets`)
  for (const field of [
    "motif",
    "board",
    "darkBoard",
    "themeCss",
    "themeJson",
    "promptsJson",
  ]) {
    requireAssetPath(assets[field], slug, `${slug}.assets.${field}`)
  }
  for (const field of ["hero", "texture"]) {
    if (assets[field] !== undefined) {
      requireAssetPath(assets[field], slug, `${slug}.assets.${field}`)
    }
  }
  if (!Array.isArray(assets.examples)) {
    throw new Error(`${slug}.assets.examples must be an array`)
  }
  for (const [index, entry] of assets.examples.entries()) {
    const example = requireRecord(
      entry,
      `${slug}.assets.examples[${index}]`
    )
    requireString(example.id, `${slug}.assets.examples[${index}].id`)
    requireString(example.label, `${slug}.assets.examples[${index}].label`)
    requireAssetPath(example.image, slug, `${slug}.assets.examples[${index}].image`)
  }
  return slug
}

export function assertMorphousCatalog(
  value: unknown
): asserts value is Array<MorphousSystem> {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("Morphous catalog must be a non-empty array")
  }
  const slugs = new Set<string>()
  for (const system of value) {
    const slug = validateSystem(system)
    if (slugs.has(slug)) throw new Error(`Duplicate system slug ${slug}`)
    slugs.add(slug)
  }
}
