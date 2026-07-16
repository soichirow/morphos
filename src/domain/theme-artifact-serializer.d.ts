import type { MorphousSystem } from "./morphous-system"

export function buildThemeCssArtifact(system: MorphousSystem): string
export function buildThemePayload(system: MorphousSystem): {
  schema: "morphous.theme.v1"
  identity: { slug: string; name: string }
  [key: string]: unknown
}
export function buildThemeJsonArtifact(system: MorphousSystem): string
