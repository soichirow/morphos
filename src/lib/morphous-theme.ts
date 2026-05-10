import type { CSSProperties } from "react"
import type { MorphousSystem } from "@/data/systems"

export type ThemeMode = "light" | "dark"

type PaletteRole =
  | "Background"
  | "Ink"
  | "Primary"
  | "Secondary"
  | "Accent"
  | "Signal"
  | "Surface"
  | "Depth"

function getPaletteColor(system: MorphousSystem, role: PaletteRole): string {
  const found = system.palette.find((c) => c.role === role)
  return found?.hex ?? "#000000"
}

export function themeStyle(
  system: MorphousSystem,
  mode: ThemeMode
): CSSProperties {
  const tokens = mode === "dark" ? system.darkTokens : system.tokens
  const tokenVars = Object.fromEntries(
    Object.entries(tokens).map(([key, value]) => [`--${key}`, value])
  )

  const bg = getPaletteColor(system, "Background")
  const ink = getPaletteColor(system, "Ink")
  const surface = getPaletteColor(system, "Surface")
  const depth = getPaletteColor(system, "Depth")
  const primary = getPaletteColor(system, "Primary")
  const accent = getPaletteColor(system, "Accent")

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
  const bg = getPaletteColor(system, "Background")
  const ink = getPaletteColor(system, "Ink")
  return {
    background: stripHash(
      mode === "dark" ? getPaletteColor(system, "Depth") : bg
    ),
    foreground: stripHash(mode === "dark" ? bg : ink),
    primary: stripHash(getPaletteColor(system, "Primary")),
    secondary: stripHash(getPaletteColor(system, "Secondary")),
    accent: stripHash(getPaletteColor(system, "Accent")),
    signal: stripHash(getPaletteColor(system, "Signal")),
    surface: stripHash(
      mode === "dark"
        ? getPaletteColor(system, "Ink")
        : getPaletteColor(system, "Surface")
    ),
    depth: stripHash(getPaletteColor(system, "Depth")),
  }
}
