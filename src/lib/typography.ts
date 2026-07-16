type FontCategory = "sans" | "serif" | "mono"

export type FontDef = {
  id: string
  label: string
  family: string
  stack: string
  category: FontCategory
  /** Typeface name written into the OOXML theme. Should be a name Office can resolve. */
  officeFamily: string
  googleHref?: string
}

export type JaFontDef = {
  id: string
  label: string
  family: string
  stack: string
  /** Typeface name written into <a:ea> + <a:font script="Jpan"> in OOXML. */
  officeFamily: string
  googleHref?: string
}

const sansFallback = `system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
const serifFallback = `ui-serif, Georgia, Cambria, "Times New Roman", serif`
const monoFallback = `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`
const jaSansFallback = `"Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif`
const jaSerifFallback = `"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif`

export const fonts: Array<FontDef> = [
  {
    id: "geist",
    label: "Geist",
    family: "Geist Variable",
    stack: `"Geist Variable", ${sansFallback}`,
    category: "sans",
    officeFamily: "Geist",
  },
  {
    id: "inter",
    label: "Inter",
    family: "Inter",
    stack: `"Inter", ${sansFallback}`,
    category: "sans",
    officeFamily: "Inter",
    googleHref:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },
  {
    id: "ibm-plex-sans",
    label: "IBM Plex Sans",
    family: "IBM Plex Sans",
    stack: `"IBM Plex Sans", ${sansFallback}`,
    category: "sans",
    officeFamily: "IBM Plex Sans",
    googleHref:
      "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap",
  },
  {
    id: "source-serif",
    label: "Source Serif 4",
    family: "Source Serif 4",
    stack: `"Source Serif 4", ${serifFallback}`,
    category: "serif",
    officeFamily: "Source Serif Pro",
    googleHref:
      "https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;500;600;700&display=swap",
  },
  {
    id: "fraunces",
    label: "Fraunces",
    family: "Fraunces",
    stack: `"Fraunces", ${serifFallback}`,
    category: "serif",
    officeFamily: "Fraunces",
    googleHref:
      "https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700&display=swap",
  },
  {
    id: "jetbrains-mono",
    label: "JetBrains Mono",
    family: "JetBrains Mono",
    stack: `"JetBrains Mono", ${monoFallback}`,
    category: "mono",
    officeFamily: "JetBrains Mono",
    googleHref:
      "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap",
  },
  {
    id: "helvetica",
    label: "Helvetica (system)",
    family: "Helvetica Neue",
    stack: `"Helvetica Neue", Helvetica, Arial, sans-serif`,
    category: "sans",
    officeFamily: "Helvetica Neue",
  },
  {
    id: "arial",
    label: "Arial (system)",
    family: "Arial",
    stack: `Arial, "Helvetica Neue", Helvetica, sans-serif`,
    category: "sans",
    officeFamily: "Arial",
  },
  {
    id: "georgia",
    label: "Georgia (system)",
    family: "Georgia",
    stack: `Georgia, ${serifFallback}`,
    category: "serif",
    officeFamily: "Georgia",
  },
  {
    id: "times",
    label: "Times New Roman (system)",
    family: "Times New Roman",
    stack: `"Times New Roman", Times, serif`,
    category: "serif",
    officeFamily: "Times New Roman",
  },
]

export const jaFonts: Array<JaFontDef> = [
  {
    id: "noto-sans-jp",
    label: "Noto Sans JP",
    family: "Noto Sans JP",
    stack: `"Noto Sans JP", ${jaSansFallback}`,
    officeFamily: "Noto Sans JP",
    googleHref:
      "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap",
  },
  {
    id: "noto-serif-jp",
    label: "Noto Serif JP",
    family: "Noto Serif JP",
    stack: `"Noto Serif JP", ${jaSerifFallback}`,
    officeFamily: "Noto Serif JP",
    googleHref:
      "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;700&display=swap",
  },
  {
    id: "hiragino-sans",
    label: "Hiragino Sans (system)",
    family: "Hiragino Sans",
    stack: `"Hiragino Sans", ${jaSansFallback}`,
    officeFamily: "Hiragino Sans",
  },
  {
    id: "yu-gothic",
    label: "Yu Gothic (system)",
    family: "Yu Gothic",
    stack: `"Yu Gothic", ${jaSansFallback}`,
    officeFamily: "Yu Gothic",
  },
  {
    id: "yu-mincho",
    label: "Yu Mincho (system)",
    family: "Yu Mincho",
    stack: `"Yu Mincho", ${jaSerifFallback}`,
    officeFamily: "Yu Mincho",
  },
  {
    id: "meiryo",
    label: "Meiryo (Windows)",
    family: "Meiryo",
    stack: `"Meiryo", ${jaSansFallback}`,
    officeFamily: "Meiryo",
  },
  {
    id: "ms-pgothic",
    label: "MS PGothic (Windows)",
    family: "MS PGothic",
    stack: `"MS PGothic", "ＭＳ Ｐゴシック", ${jaSansFallback}`,
    officeFamily: "MS PGothic",
  },
  {
    id: "ms-pmincho",
    label: "MS PMincho (Windows)",
    family: "MS PMincho",
    stack: `"MS PMincho", "ＭＳ Ｐ明朝", ${jaSerifFallback}`,
    officeFamily: "MS PMincho",
  },
]

export type Preset = {
  id: string
  label: string
  hint: string
  fontId: string
  jaFontId: string
}

/**
 * Curated Latin + Japanese font pairings. Each preset sets both fonts in
 * one click. Pairings are chosen so the office templates render with
 * typefaces typically pre-installed on the target platform.
 */
export const presets: Array<Preset> = [
  {
    id: "morphous",
    label: "Morphous default",
    hint: "Geist + Noto Sans JP",
    fontId: "geist",
    jaFontId: "noto-sans-jp",
  },
  {
    id: "business-mac",
    label: "Business · macOS",
    hint: "Helvetica Neue + Hiragino Sans",
    fontId: "helvetica",
    jaFontId: "hiragino-sans",
  },
  {
    id: "business-windows",
    label: "Business · Windows",
    hint: "Arial + Meiryo",
    fontId: "arial",
    jaFontId: "meiryo",
  },
  {
    id: "office-classic",
    label: "Office classic",
    hint: "Arial + MS PGothic",
    fontId: "arial",
    jaFontId: "ms-pgothic",
  },
  {
    id: "editorial-mac",
    label: "Editorial · macOS",
    hint: "Georgia + Yu Mincho",
    fontId: "georgia",
    jaFontId: "yu-mincho",
  },
  {
    id: "editorial-windows",
    label: "Editorial · Windows",
    hint: "Times New Roman + MS PMincho",
    fontId: "times",
    jaFontId: "ms-pmincho",
  },
  {
    id: "modern",
    label: "Modern product",
    hint: "Inter + Noto Sans JP",
    fontId: "inter",
    jaFontId: "noto-sans-jp",
  },
  {
    id: "research",
    label: "Research report",
    hint: "Source Serif 4 + Noto Serif JP",
    fontId: "source-serif",
    jaFontId: "noto-serif-jp",
  },
  {
    id: "tech",
    label: "Tech docs",
    hint: "IBM Plex Sans + Noto Sans JP",
    fontId: "ibm-plex-sans",
    jaFontId: "noto-sans-jp",
  },
]

export const defaultPresetId = "morphous"

export function getPreset(id: string): Preset {
  const preset = presets.find((candidate) => candidate.id === id) ?? presets[0]
  if (!preset) throw new Error("At least one typography preset is required")
  return preset
}

/** Find the preset whose font IDs match the current selection, if any. */
export function matchPreset(
  fontId: string,
  jaFontId: string
): Preset | undefined {
  return presets.find((p) => p.fontId === fontId && p.jaFontId === jaFontId)
}

export const defaultFontId = "geist"
export const defaultJaFontId = "noto-sans-jp"

export function getFont(id: string): FontDef {
  const font = fonts.find((candidate) => candidate.id === id) ?? fonts[0]
  if (!font) throw new Error("At least one Latin font is required")
  return font
}

export function getJaFont(id: string): JaFontDef {
  const font = jaFonts.find((candidate) => candidate.id === id) ?? jaFonts[0]
  if (!font) throw new Error("At least one Japanese font is required")
  return font
}
