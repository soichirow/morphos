import type { MorphousSystem } from "@/domain/morphous-system"
import {
  buildThemeCssArtifact,
  buildThemeJsonArtifact,
} from "@/domain/theme-artifact-serializer.js"

export function buildThemeCss(system: MorphousSystem): string {
  return buildThemeCssArtifact(system)
}

export function buildThemeJson(system: MorphousSystem): string {
  return buildThemeJsonArtifact(system)
}

export function buildPromptsJson(
  system: Pick<MorphousSystem, "prompts">
): string {
  return `${JSON.stringify(system.prompts, null, 2)}\n`
}
