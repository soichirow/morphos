import {
  CORE_PALETTE_ROLES,
  REQUIRED_TOKEN_KEYS,
} from "./morphous-system-constants.js"

export { CORE_PALETTE_ROLES, REQUIRED_TOKEN_KEYS }

export type CorePaletteRole = (typeof CORE_PALETTE_ROLES)[number]
export type ThemeTokenKey = (typeof REQUIRED_TOKEN_KEYS)[number]
export type HexColor = `#${string}`
export type ThemeTokens = Readonly<Record<ThemeTokenKey, string>>

export type MorphousPrompt = {
  id: string
  label: string
  asset: string
  prompt: string
  sourceAsset?: string | undefined
  referenceAssets?: Array<string> | undefined
  workflow?: string
  postProcess?: string
  postProcessing?: string
  kind?: string
}

export type MorphousAssetExample = { id: string; label: string; image: string }

export type MorphousSystem = {
  slug: string
  name: string
  motifName: string
  motifCategory: string
  biome: string
  motif: string
  description: string
  typography: string
  layout: string
  tags: Array<string>
  palette: Array<{ role: string; name: string; hex: HexColor; oklch: string }>
  tokens: ThemeTokens
  darkTokens: ThemeTokens
  prompts: Array<MorphousPrompt>
  assets: {
    motif: string
    board: string
    darkBoard: string
    hero?: string | undefined
    texture?: string | undefined
    examples: Array<MorphousAssetExample>
    themeCss: string
    themeJson: string
    promptsJson: string
  }
  bgLightness: number
  searchBlob: string
}
