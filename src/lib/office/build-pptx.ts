import { buildOfficeTheme, injectThemeIntoZip } from "./theme-xml"
import type { MorphousSystem } from "@/data/systems"
import type { ThemeMode } from "@/lib/morphous-theme"
import { paletteForOffice } from "@/lib/morphous-theme"

type BuildOptions = {
  mode: ThemeMode
  font: string
  jaFont: string
}

export async function buildDeck(system: MorphousSystem, opts: BuildOptions): Promise<Blob> {
  const PptxGenJS = (await import("pptxgenjs")).default
  const pres = new PptxGenJS()
  pres.layout = "LAYOUT_WIDE" // 13.333 x 7.5 inches

  const palette = paletteForOffice(system, opts.mode)
  const font = opts.font
  const jaFont = opts.jaFont

  pres.defineSlideMaster({
    title: "MORPHOUS",
    background: { color: palette.background },
    objects: [
      // palette stripe at the bottom of every slide
      ...stripeObjects(system),
      {
        text: {
          text: `Morphous · ${system.name}`,
          options: {
            x: 0.4,
            y: 7.05,
            w: 8,
            h: 0.3,
            fontSize: 9,
            fontFace: font,
            color: palette.foreground,
          },
        },
      },
    ],
    slideNumber: {
      x: 12.7,
      y: 7.05,
      w: 0.5,
      h: 0.3,
      fontFace: font,
      fontSize: 9,
      color: palette.foreground,
    },
  })

  // Slide 1: Title
  {
    const slide = pres.addSlide({ masterName: "MORPHOUS" })
    slide.addShape("rect", {
      x: 0.4,
      y: 3.0,
      w: 0.18,
      h: 1.6,
      fill: { color: palette.primary },
      line: { color: palette.primary, width: 0 },
    })
    slide.addText(system.motifCategory.toUpperCase() + "  ·  " + system.biome.toUpperCase(), {
      x: 0.8,
      y: 2.8,
      w: 11,
      h: 0.4,
      fontSize: 11,
      fontFace: font,
      color: palette.primary,
      charSpacing: 4,
    })
    slide.addText(system.name, {
      x: 0.8,
      y: 3.2,
      w: 11,
      h: 1.2,
      fontSize: 54,
      fontFace: font,
      bold: true,
      color: palette.foreground,
    })
    slide.addText(system.motifName, {
      x: 0.8,
      y: 4.3,
      w: 11,
      h: 0.6,
      fontSize: 22,
      fontFace: font,
      color: palette.accent,
    })
    slide.addText(system.description, {
      x: 0.8,
      y: 5.0,
      w: 10,
      h: 1.6,
      fontSize: 14,
      fontFace: font,
      color: palette.foreground,
    })
  }

  // Slide 2: Palette
  {
    const slide = pres.addSlide({ masterName: "MORPHOUS" })
    slide.addText("Palette", {
      x: 0.4,
      y: 0.4,
      w: 10,
      h: 0.6,
      fontSize: 28,
      fontFace: font,
      bold: true,
      color: palette.foreground,
    })
    slide.addText(`${system.palette.length} roles · derived from ${system.motifName}`, {
      x: 0.4,
      y: 1.0,
      w: 10,
      h: 0.4,
      fontSize: 12,
      fontFace: font,
      color: palette.accent,
    })
    const cols = 4
    const cellW = 3.0
    const cellH = 2.4
    const startX = 0.4
    const startY = 1.6
    system.palette.forEach((color, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = startX + col * (cellW + 0.15)
      const y = startY + row * (cellH + 0.2)
      slide.addShape("rect", {
        x,
        y,
        w: cellW,
        h: cellH * 0.55,
        fill: { color: color.hex.replace("#", "") },
        line: { color: palette.background, width: 0 },
      })
      slide.addText(color.role, {
        x,
        y: y + cellH * 0.55 + 0.05,
        w: cellW,
        h: 0.35,
        fontSize: 12,
        fontFace: font,
        bold: true,
        color: palette.foreground,
      })
      slide.addText(color.name, {
        x,
        y: y + cellH * 0.55 + 0.4,
        w: cellW,
        h: 0.3,
        fontSize: 10,
        fontFace: font,
        color: palette.foreground,
      })
      slide.addText(color.hex.toUpperCase(), {
        x,
        y: y + cellH * 0.55 + 0.7,
        w: cellW,
        h: 0.3,
        fontSize: 10,
        fontFace: font,
        color: palette.accent,
      })
    })
  }

  // Slide 3: Typography
  {
    const slide = pres.addSlide({ masterName: "MORPHOUS" })
    slide.addText("Typography", {
      x: 0.4,
      y: 0.4,
      w: 10,
      h: 0.6,
      fontSize: 28,
      fontFace: font,
      bold: true,
      color: palette.foreground,
    })
    slide.addText(font, {
      x: 0.4,
      y: 1.0,
      w: 10,
      h: 0.4,
      fontSize: 12,
      fontFace: font,
      color: palette.accent,
    })
    slide.addText("The quick brown fox", {
      x: 0.4,
      y: 1.8,
      w: 12.5,
      h: 1.6,
      fontSize: 72,
      fontFace: font,
      bold: true,
      color: palette.foreground,
    })
    slide.addText("Display 32 · Heading 24 · Body 14 · Caption 11", {
      x: 0.4,
      y: 3.6,
      w: 12.5,
      h: 0.5,
      fontSize: 16,
      fontFace: font,
      color: palette.primary,
    })
    slide.addText(system.typography, {
      x: 0.4,
      y: 4.4,
      w: 12.5,
      h: 1.5,
      fontSize: 14,
      fontFace: font,
      color: palette.foreground,
    })
  }

  // Slide 4: Content sample
  {
    const slide = pres.addSlide({ masterName: "MORPHOUS" })
    slide.addText("Section Title", {
      x: 0.4,
      y: 0.4,
      w: 10,
      h: 0.6,
      fontSize: 28,
      fontFace: font,
      bold: true,
      color: palette.foreground,
    })
    slide.addShape("rect", {
      x: 0.4,
      y: 1.05,
      w: 1.2,
      h: 0.06,
      fill: { color: palette.accent },
      line: { color: palette.accent, width: 0 },
    })
    const bullets = [
      `Built from the ${system.motifName.toLowerCase()} motif`,
      `${system.palette.length}-role palette covering background, ink, primary, accent, and depth`,
      `Typography set in ${font} for display, body, and caption rhythm`,
    ]
    slide.addText(
      bullets.map((b) => ({ text: b, options: { bullet: true } })),
      {
        x: 0.4,
        y: 1.6,
        w: 12,
        h: 4,
        fontSize: 18,
        fontFace: font,
        color: palette.foreground,
        paraSpaceAfter: 12,
      }
    )
  }

  // Slide 5: KPI
  {
    const slide = pres.addSlide({ masterName: "MORPHOUS" })
    slide.addText("Indicators", {
      x: 0.4,
      y: 0.4,
      w: 10,
      h: 0.6,
      fontSize: 28,
      fontFace: font,
      bold: true,
      color: palette.foreground,
    })
    const kpis: Array<[string, string, string]> = [
      ["Adoption", "92%", palette.primary],
      ["Coverage", "8 / 8", palette.accent],
      ["Contrast", "AA+", palette.signal],
    ]
    kpis.forEach(([label, value, color], i) => {
      const x = 0.4 + i * 4.3
      slide.addShape("rect", {
        x,
        y: 1.6,
        w: 4.0,
        h: 3.4,
        fill: { color: palette.surface },
        line: { color: palette.surface, width: 0 },
      })
      slide.addShape("rect", {
        x,
        y: 1.6,
        w: 0.12,
        h: 3.4,
        fill: { color },
        line: { color, width: 0 },
      })
      slide.addText(label, {
        x: x + 0.3,
        y: 1.85,
        w: 3.6,
        h: 0.5,
        fontSize: 14,
        fontFace: font,
        color: palette.foreground,
        charSpacing: 2,
      })
      slide.addText(value, {
        x: x + 0.3,
        y: 2.4,
        w: 3.6,
        h: 1.8,
        fontSize: 64,
        fontFace: font,
        bold: true,
        color,
      })
    })
  }

  // Slide 6: Closing
  {
    const slide = pres.addSlide({ masterName: "MORPHOUS" })
    slide.addText(system.motifName, {
      x: 0.4,
      y: 2.6,
      w: 12,
      h: 1.2,
      fontSize: 48,
      fontFace: font,
      bold: true,
      color: palette.foreground,
    })
    slide.addText("morphous", {
      x: 0.4,
      y: 3.8,
      w: 12,
      h: 0.6,
      fontSize: 16,
      fontFace: font,
      color: palette.accent,
      charSpacing: 4,
    })
    slide.addText(system.tags.join("  ·  "), {
      x: 0.4,
      y: 4.4,
      w: 12,
      h: 0.5,
      fontSize: 12,
      fontFace: font,
      color: palette.foreground,
    })
  }

  const blob = (await pres.write({ outputType: "blob" })) as Blob

  // Override the default Office theme with one built from this system's palette
  // and the chosen Latin + Japanese fonts. This is what populates the Theme
  // Colors picker and the Theme Fonts (Major/Minor) in PowerPoint.
  const themeXml = buildOfficeTheme(system, opts.mode, { latin: font, ea: jaFont })
  return injectThemeIntoZip(blob, "ppt/theme/theme1.xml", themeXml)
}

function stripeObjects(system: MorphousSystem) {
  const stripeY = 7.4
  const stripeH = 0.1
  const totalW = 13.333
  const cellW = totalW / system.palette.length
  return system.palette.map((color, i) => ({
    rect: {
      x: i * cellW,
      y: stripeY,
      w: cellW,
      h: stripeH,
      fill: { color: color.hex.replace("#", "") },
      line: { color: color.hex.replace("#", ""), width: 0 },
    },
  }))
}
