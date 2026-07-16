import type { HexColor, MorphousSystem  } from "@/domain/morphous-system"


export type PaletteOverrides = Record<string, Record<string, HexColor>>

const HEX_COLOR = /^#[0-9A-F]{6}$/i

function isHexColor(value: unknown): value is HexColor {
  return typeof value === "string" && HEX_COLOR.test(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function validRoles(system: MorphousSystem): ReadonlySet<string> {
  return new Set(system.palette.map((color) => color.role))
}

export function parsePaletteOverrides(
  raw: string | null,
  catalog: ReadonlyArray<MorphousSystem>
): PaletteOverrides {
  if (!raw) return {}

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return {}
  }
  if (!isRecord(parsed)) return {}

  const systemsBySlug = new Map(catalog.map((system) => [system.slug, system]))
  const result: PaletteOverrides = {}

  for (const [slug, persistedOverrides] of Object.entries(parsed)) {
    const system = systemsBySlug.get(slug)
    if (!system || !isRecord(persistedOverrides)) continue

    const roles = validRoles(system)
    const overrides: Record<string, HexColor> = {}
    for (const [role, value] of Object.entries(persistedOverrides)) {
      if (roles.has(role) && isHexColor(value)) {
        overrides[role] = value.toUpperCase() as HexColor
      }
    }
    if (Object.keys(overrides).length > 0) result[slug] = overrides
  }

  return result
}

export function applyPaletteOverrides(
  system: MorphousSystem,
  overrides: Readonly<Record<string, HexColor>>
): MorphousSystem {
  const palette = system.palette.map((color) => {
    const override = overrides[color.role]
    return override ? { ...color, hex: override } : color
  })

  return palette.some((color, index) => color !== system.palette[index])
    ? { ...system, palette }
    : system
}

export function setPaletteOverride(
  current: PaletteOverrides,
  system: MorphousSystem,
  role: string,
  hex: string
): PaletteOverrides {
  if (!validRoles(system).has(role) || !isHexColor(hex)) return current
  const normalizedHex = hex.toUpperCase() as HexColor

  return {
    ...current,
    [system.slug]: {
      ...(current[system.slug] ?? {}),
      [role]: normalizedHex,
    },
  }
}

export function removePaletteOverrides(
  current: PaletteOverrides,
  slug: string
): PaletteOverrides {
  if (!(slug in current)) return current
  const next = { ...current }
  delete next[slug]
  return next
}
