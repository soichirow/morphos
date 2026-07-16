import type { CSSProperties } from "react"
import type { CorePaletteRole, MorphousSystem } from "@/domain/morphous-system"

export type ThemeMode = "light" | "dark"

function getPaletteColor(
  system: MorphousSystem,
  role: string,
  fallbackRole: CorePaletteRole
): string {
  const color = system.palette.find((entry) => entry.role === role)
  if (color) return color.hex
  const fallback = system.palette.find((entry) => entry.role === fallbackRole)
  if (!fallback) {
    throw new Error(`${system.slug} is missing core palette role ${fallbackRole}`)
  }
  return fallback.hex
}

export function themeStyle(
  system: MorphousSystem,
  mode: ThemeMode
): CSSProperties {
  const tokens = mode === "dark" ? system.darkTokens : system.tokens
  const tokenVars = Object.fromEntries(
    Object.entries(tokens).map(([key, value]) => [`--${key}`, value])
  )

  const bg = getPaletteColor(system, "Background", "Background")
  const ink = getPaletteColor(system, "Ink", "Primary")
  const surface = getPaletteColor(system, "Surface", "Background")
  const depth = getPaletteColor(system, "Depth", "Primary")
  const primary = getPaletteColor(system, "Primary", "Primary")
  const accent = getPaletteColor(system, "Accent", "Primary")

  const paletteVars =
    mode === "dark"
      ? {
          "--page-bg-from": depth,
          "--page-bg-to": ink,
          "--page-glow": primary,
        }
      : {
          "--page-bg-from": bg,
          "--page-bg-to": surface,
          "--page-glow": accent,
        }

  return {
    ...tokenVars,
    "--palette-background": bg,
    "--palette-ink": ink,
    "--palette-primary": primary,
    "--palette-accent": accent,
    "--palette-surface": surface,
    "--palette-depth": depth,
    ...paletteVars,
  } as CSSProperties
}

export function paletteGradient(system: MorphousSystem) {
  return `linear-gradient(90deg, ${system.palette.map((color) => color.hex).join(", ")})`
}

export type OfficePalette = {
  background: string
  foreground: string
  primary: string
  secondary: string
  accent: string
  signal: string
  surface: string
  depth: string
}

const stripHash = (hex: string) => hex.replace("#", "").toUpperCase()

export function paletteForOffice(
  system: MorphousSystem,
  mode: ThemeMode = "light"
): OfficePalette {
  const bg = getPaletteColor(system, "Background", "Background")
  const ink = getPaletteColor(system, "Ink", "Primary")
  return {
    background: stripHash(
      mode === "dark" ? getPaletteColor(system, "Depth", "Primary") : bg
    ),
    foreground: stripHash(mode === "dark" ? bg : ink),
    primary: stripHash(getPaletteColor(system, "Primary", "Primary")),
    secondary: stripHash(getPaletteColor(system, "Secondary", "Primary")),
    accent: stripHash(getPaletteColor(system, "Accent", "Primary")),
    signal: stripHash(getPaletteColor(system, "Signal", "Primary")),
    surface: stripHash(
      mode === "dark"
        ? getPaletteColor(system, "Ink", "Primary")
        : getPaletteColor(system, "Surface", "Background")
    ),
    depth: stripHash(getPaletteColor(system, "Depth", "Primary")),
  }
}
