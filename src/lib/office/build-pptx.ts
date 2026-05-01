import { buildOfficeTheme, injectThemeIntoZip } from "./theme-xml"
import type { MorphousSystem } from "@/data/systems"
import type { ThemeMode } from "@/lib/morphous-theme"
import { paletteForOffice } from "@/lib/morphous-theme"

type BuildOptions = {
  mode: ThemeMode
  font: string
  jaFont: string
}

type SlideLike = unknown

type OfficePalette = ReturnType<typeof paletteForOffice>

export async function buildDeck(
  system: MorphousSystem,
  opts: BuildOptions
): Promise<Blob> {
  const PptxGenJS = (await import("pptxgenjs")).default
  const pres = new PptxGenJS()
  pres.layout = "LAYOUT_WIDE" // 13.333 x 7.5 inches

  const palette = paletteForOffice(system, opts.mode)
  const font = opts.font
  const jaFont = opts.jaFont
  const chartColors = [
    palette.primary,
    palette.accent,
    palette.secondary,
    palette.signal,
  ]

  pres.defineSlideMaster({
    title: "MORPHOUS",
    background: { color: palette.background },
    objects: [
      ...stripeObjects(system),
      {
        rect: {
          x: 0,
          y: 0,
          w: 0.12,
          h: 7.5,
          fill: { color: palette.primary },
          line: { color: palette.primary, width: 0 },
        },
      },
      {
        text: {
          text: `Morphous - ${system.name}`,
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

  // 1. Title / cover
  {
    const slide = pres.addSlide({ masterName: "MORPHOUS" })
    addPanel(slide, 7.85, 0.55, 4.95, 5.85, palette.surface, palette.surface)
    addText(
      slide,
      `${system.motifCategory.toUpperCase()} / ${system.biome.toUpperCase()}`,
      {
        x: 0.65,
        y: 0.75,
        w: 6.2,
        h: 0.35,
        fontSize: 10,
        fontFace: font,
        color: palette.primary,
        bold: true,
      }
    )
    addText(slide, system.name, {
      x: 0.62,
      y: 1.25,
      w: 6.8,
      h: 1.45,
      fontSize: 50,
      fontFace: font,
      bold: true,
      color: palette.foreground,
      margin: 0,
      breakLine: false,
      fit: "shrink",
    })
    addText(slide, system.description, {
      x: 0.65,
      y: 3.05,
      w: 6.4,
      h: 1.1,
      fontSize: 14,
      fontFace: font,
      color: palette.foreground,
      breakLine: false,
      fit: "shrink",
    })
    addPill(
      slide,
      0.65,
      4.55,
      2.15,
      "PowerPoint template",
      palette.primary,
      palette.background,
      font
    )
    addPill(
      slide,
      2.95,
      4.55,
      2.05,
      "Theme colors",
      palette.accent,
      palette.background,
      font
    )
    addPill(
      slide,
      5.15,
      4.55,
      1.35,
      opts.mode,
      palette.signal,
      palette.background,
      font
    )

    addText(slide, system.motifName, {
      x: 8.25,
      y: 0.95,
      w: 3.9,
      h: 0.45,
      fontSize: 20,
      fontFace: font,
      bold: true,
      color: palette.foreground,
    })
    addText(
      slide,
      "Template includes title, narrative, component, chart, roadmap, and data/status slide patterns.",
      {
        x: 8.25,
        y: 1.5,
        w: 3.85,
        h: 0.85,
        fontSize: 12,
        fontFace: font,
        color: palette.foreground,
        fit: "shrink",
      }
    )
    const topColors = system.palette.slice(0, 6)
    topColors.forEach((color, i) => {
      const x = 8.25 + (i % 2) * 2.05
      const y = 2.65 + Math.floor(i / 2) * 0.82
      addSwatchCard(
        slide,
        x,
        y,
        1.75,
        0.62,
        color.role,
        cleanHex(color.hex),
        font
      )
    })
    addText(slide, `Latin: ${font}\nJapanese: ${jaFont}`, {
      x: 8.25,
      y: 5.4,
      w: 3.9,
      h: 0.55,
      fontSize: 11,
      fontFace: font,
      color: palette.accent,
      fit: "shrink",
    })
  }

  // 2. Executive snapshot
  {
    const slide = pres.addSlide({ masterName: "MORPHOUS" })
    slideTitle(
      slide,
      "Executive Snapshot",
      "Theme-led story structure with reusable business slides.",
      font,
      palette
    )
    const metrics: Array<[string, string, string]> = [
      ["Brand fit", "92%", palette.primary],
      ["UI coverage", "14", palette.accent],
      ["Color roles", String(system.palette.length), palette.signal],
    ]
    metrics.forEach(([label, value, color], i) =>
      metricCard(
        slide,
        0.65 + i * 4.15,
        1.35,
        3.65,
        1.45,
        label,
        value,
        color,
        font,
        palette
      )
    )
    const notes = [
      [
        "Narrative",
        `Built around ${system.motifName.toLowerCase()} visual cues and theme colors.`,
      ],
      [
        "Governance",
        "Every chart, badge, rule, and status treatment uses the active palette.",
      ],
      [
        "Delivery",
        "Ready-to-edit layouts for reports, updates, roadmap reviews, and dashboards.",
      ],
    ]
    notes.forEach(([label, text], i) => {
      const y = 3.25 + i * 0.95
      addShape(slide, "rect", {
        x: 0.65,
        y,
        w: 0.13,
        h: 0.58,
        fill: { color: chartColors[i % chartColors.length] },
        line: { color: chartColors[i % chartColors.length], width: 0 },
      })
      addText(slide, label, {
        x: 0.95,
        y: y - 0.02,
        w: 2.0,
        h: 0.3,
        fontSize: 12,
        fontFace: font,
        bold: true,
        color: palette.foreground,
      })
      addText(slide, text, {
        x: 2.55,
        y: y - 0.02,
        w: 9.5,
        h: 0.42,
        fontSize: 12,
        fontFace: font,
        color: palette.foreground,
        fit: "shrink",
      })
    })
    addProgress(
      slide,
      0.65,
      6.1,
      11.7,
      0.16,
      0.72,
      palette.primary,
      palette.surface
    )
  }

  // 3. Palette system
  {
    const slide = pres.addSlide({ masterName: "MORPHOUS" })
    slideTitle(
      slide,
      "Palette System",
      `${system.palette.length} theme roles exported to Office Theme Colors.`,
      font,
      palette
    )
    const cols = 4
    const cellW = 2.95
    const cellH = 1.35
    system.palette.slice(0, 12).forEach((color, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = 0.65 + col * 3.12
      const y = 1.35 + row * 1.65
      addPanel(
        slide,
        x,
        y,
        cellW,
        cellH,
        palette.surface,
        mixForPpt(cleanHex(color.hex), palette.background, 0.2)
      )
      addShape(slide, "rect", {
        x,
        y,
        w: cellW,
        h: 0.52,
        fill: { color: cleanHex(color.hex) },
        line: { color: cleanHex(color.hex), width: 0 },
      })
      addText(slide, color.role, {
        x: x + 0.18,
        y: y + 0.64,
        w: cellW - 0.36,
        h: 0.25,
        fontSize: 11,
        fontFace: font,
        bold: true,
        color: palette.foreground,
      })
      addText(slide, `${color.name} / ${color.hex.toUpperCase()}`, {
        x: x + 0.18,
        y: y + 0.95,
        w: cellW - 0.36,
        h: 0.25,
        fontSize: 8.5,
        fontFace: font,
        color: palette.accent,
        fit: "shrink",
      })
    })
    addText(
      slide,
      "Theme mapping: Primary -> Accent 1, Accent -> Accent 2, Secondary -> Accent 3, Signal -> Accent 4.",
      {
        x: 0.65,
        y: 6.45,
        w: 11.7,
        h: 0.35,
        fontSize: 11,
        fontFace: font,
        color: palette.foreground,
        fit: "shrink",
      }
    )
  }

  // 4. Typography
  {
    const slide = pres.addSlide({ masterName: "MORPHOUS" })
    slideTitle(
      slide,
      "Typography",
      "Latin and Japanese theme fonts are written into the Office theme.",
      font,
      palette
    )
    addText(slide, "Aa", {
      x: 0.65,
      y: 1.4,
      w: 3.1,
      h: 1.35,
      fontSize: 80,
      fontFace: font,
      bold: true,
      color: palette.primary,
      margin: 0,
    })
    addText(slide, "日本語", {
      x: 3.55,
      y: 1.55,
      w: 3.4,
      h: 0.95,
      fontSize: 36,
      fontFace: jaFont,
      bold: true,
      color: palette.foreground,
      fit: "shrink",
    })
    addText(slide, `Display / Heading / Body / Caption\n${font} + ${jaFont}`, {
      x: 7.2,
      y: 1.45,
      w: 4.8,
      h: 0.9,
      fontSize: 15,
      fontFace: font,
      color: palette.foreground,
      fit: "shrink",
    })
    const rows: Array<[string, number, string]> = [
      ["Display", 34, "Strategic update"],
      ["Heading", 24, "Quarterly overview"],
      ["Body", 14, system.typography],
      [
        "Caption",
        10,
        "Numbers, labels, annotations, and Japanese UI guidance.",
      ],
    ]
    rows.forEach(([label, size, sample], i) => {
      const y = 3.15 + i * 0.72
      addText(slide, label, {
        x: 0.72,
        y,
        w: 1.6,
        h: 0.3,
        fontSize: 9,
        fontFace: font,
        bold: true,
        color: palette.accent,
      })
      addText(slide, sample, {
        x: 2.45,
        y: y - (size > 24 ? 0.12 : 0),
        w: 9.7,
        h: size > 20 ? 0.56 : 0.38,
        fontSize: size,
        fontFace: font,
        bold: size > 20,
        color: palette.foreground,
        fit: "shrink",
      })
    })
  }

  // 5. Components and forms
  {
    const slide = pres.addSlide({ masterName: "MORPHOUS" })
    slideTitle(
      slide,
      "Components",
      "Editable office-native mocks for product, form, and status layouts.",
      font,
      palette
    )
    addPanel(slide, 0.65, 1.35, 3.65, 4.95, palette.surface, palette.surface)
    addText(slide, "Action stack", {
      x: 0.95,
      y: 1.7,
      w: 2.9,
      h: 0.32,
      fontSize: 14,
      fontFace: font,
      bold: true,
      color: palette.foreground,
    })
    addButton(
      slide,
      0.95,
      2.28,
      2.75,
      "Primary action",
      palette.primary,
      palette.background,
      font
    )
    addButton(
      slide,
      0.95,
      2.92,
      2.75,
      "Secondary",
      palette.secondary,
      palette.foreground,
      font
    )
    addButton(
      slide,
      0.95,
      3.56,
      2.75,
      "Accent state",
      palette.accent,
      palette.background,
      font
    )
    addProgress(
      slide,
      0.95,
      4.55,
      2.75,
      0.14,
      0.84,
      palette.signal,
      palette.background
    )
    addText(slide, "Status: on track", {
      x: 0.95,
      y: 4.84,
      w: 2.75,
      h: 0.25,
      fontSize: 10,
      fontFace: font,
      color: palette.foreground,
    })

    addPanel(slide, 4.65, 1.35, 3.65, 4.95, palette.surface, palette.surface)
    addText(slide, "Form pattern", {
      x: 4.95,
      y: 1.7,
      w: 2.9,
      h: 0.32,
      fontSize: 14,
      fontFace: font,
      bold: true,
      color: palette.foreground,
    })
    formField(
      slide,
      4.95,
      2.25,
      2.95,
      "Project name",
      system.name,
      font,
      palette
    )
    formField(slide, 4.95, 3.3, 2.95, "Owner", system.motifName, font, palette)
    addPill(
      slide,
      4.95,
      4.55,
      1.2,
      "Ready",
      palette.signal,
      palette.background,
      font
    )
    addPill(
      slide,
      6.32,
      4.55,
      1.2,
      "Draft",
      palette.secondary,
      palette.foreground,
      font
    )

    addPanel(slide, 8.65, 1.35, 3.65, 4.95, palette.surface, palette.surface)
    addText(slide, "Card layout", {
      x: 8.95,
      y: 1.7,
      w: 2.9,
      h: 0.32,
      fontSize: 14,
      fontFace: font,
      bold: true,
      color: palette.foreground,
    })
    addText(
      slide,
      "Theme-informed content block with clear visual hierarchy, surface fill, active edge, status pill, and data rail.",
      {
        x: 8.95,
        y: 2.3,
        w: 2.95,
        h: 1.05,
        fontSize: 12,
        fontFace: font,
        color: palette.foreground,
        fit: "shrink",
      }
    )
    addShape(slide, "rect", {
      x: 8.95,
      y: 3.65,
      w: 2.95,
      h: 0.08,
      fill: { color: palette.primary },
      line: { color: palette.primary, width: 0 },
    })
    ;[0.56, 0.72, 0.38].forEach((value, i) =>
      addProgress(
        slide,
        8.95,
        4.18 + i * 0.42,
        2.95,
        0.12,
        value,
        chartColors[i],
        palette.background
      )
    )
  }

  // 6. Dashboard with real Office charts
  {
    const slide = pres.addSlide({ masterName: "MORPHOUS" })
    slideTitle(
      slide,
      "Dashboard Charts",
      "Native PowerPoint charts inherit the theme color set.",
      font,
      palette
    )
    metricCard(
      slide,
      0.65,
      1.25,
      2.2,
      1.05,
      "Revenue",
      "+18%",
      palette.primary,
      font,
      palette
    )
    metricCard(
      slide,
      3.1,
      1.25,
      2.2,
      1.05,
      "Retention",
      "94%",
      palette.accent,
      font,
      palette
    )
    metricCard(
      slide,
      5.55,
      1.25,
      2.2,
      1.05,
      "Cycle",
      "12d",
      palette.signal,
      font,
      palette
    )
    addChart(
      slide,
      pres.ChartType.bar,
      [
        {
          name: "Coverage",
          labels: ["Tokens", "Docs", "Data", "UI"],
          values: [92, 78, 86, 88],
        },
      ],
      {
        x: 0.65,
        y: 2.65,
        w: 5.85,
        h: 3.35,
        chartColors: [palette.primary],
        showLegend: false,
        showValue: true,
        dataLabelColor: palette.foreground,
        dataLabelFontFace: font,
        dataLabelFontSize: 9,
        valAxisMinVal: 0,
        valAxisMaxVal: 100,
        valAxisLabelColor: palette.foreground,
        valAxisLabelFontFace: font,
        valAxisLabelFontSize: 8,
        valGridLine: {
          color: mixForPpt(palette.foreground, palette.background, 0.75),
          transparency: 72,
        },
        catAxisLabelColor: palette.foreground,
        catAxisLabelFontFace: font,
        catAxisLabelFontSize: 9,
        catAxisLineShow: false,
        valAxisLineShow: false,
        chartArea: {
          fill: { color: palette.surface, transparency: 0 },
          border: { color: palette.surface, transparency: 100 },
        },
        plotArea: {
          fill: { color: palette.surface, transparency: 100 },
          border: { color: palette.surface, transparency: 100 },
        },
      }
    )
    addChart(
      slide,
      pres.ChartType.line,
      [
        {
          name: "Adoption",
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          values: [28, 36, 48, 57, 74, 91],
        },
        {
          name: "Quality",
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          values: [52, 58, 63, 70, 79, 87],
        },
      ],
      {
        x: 7.0,
        y: 1.25,
        w: 5.35,
        h: 4.75,
        chartColors: [palette.accent, palette.signal],
        showLegend: true,
        legendColor: palette.foreground,
        legendFontFace: font,
        legendFontSize: 9,
        valAxisMinVal: 0,
        valAxisMaxVal: 100,
        valAxisLabelColor: palette.foreground,
        valAxisLabelFontFace: font,
        valAxisLabelFontSize: 8,
        catAxisLabelColor: palette.foreground,
        catAxisLabelFontFace: font,
        catAxisLabelFontSize: 9,
        catAxisLineColor: palette.surface,
        valAxisLineColor: palette.surface,
        valGridLine: {
          color: mixForPpt(palette.foreground, palette.background, 0.75),
          transparency: 72,
        },
        chartArea: {
          fill: { color: palette.surface, transparency: 0 },
          border: { color: palette.surface, transparency: 100 },
        },
        plotArea: {
          fill: { color: palette.surface, transparency: 100 },
          border: { color: palette.surface, transparency: 100 },
        },
      }
    )
  }

  // 7. Roadmap
  {
    const slide = pres.addSlide({ masterName: "MORPHOUS" })
    slideTitle(
      slide,
      "Roadmap",
      "A themed plan layout with phase cards and progress rails.",
      font,
      palette
    )
    const phases: Array<[string, string, number, string]> = [
      ["01", "Discover", 0.62, palette.primary],
      ["02", "Design", 0.76, palette.accent],
      ["03", "Build", 0.48, palette.secondary],
      ["04", "Launch", 0.32, palette.signal],
    ]
    phases.forEach(([num, label, progress, color], i) => {
      const x = 0.8 + i * 3.08
      addShape(slide, "rect", {
        x,
        y: 2.0,
        w: 2.55,
        h: 3.5,
        fill: { color: palette.surface },
        line: { color: color, width: 1.2 },
      })
      addText(slide, num, {
        x: x + 0.25,
        y: 2.28,
        w: 0.72,
        h: 0.45,
        fontSize: 20,
        fontFace: font,
        bold: true,
        color,
      })
      addText(slide, label, {
        x: x + 0.25,
        y: 2.9,
        w: 1.95,
        h: 0.35,
        fontSize: 16,
        fontFace: font,
        bold: true,
        color: palette.foreground,
      })
      addText(slide, roadmapCopy(i, system), {
        x: x + 0.25,
        y: 3.45,
        w: 1.95,
        h: 0.8,
        fontSize: 10,
        fontFace: font,
        color: palette.foreground,
        fit: "shrink",
      })
      addProgress(
        slide,
        x + 0.25,
        4.72,
        1.95,
        0.12,
        progress,
        color,
        palette.background
      )
    })
  }

  // 8. Data and status table
  {
    const slide = pres.addSlide({ masterName: "MORPHOUS" })
    slideTitle(
      slide,
      "Data Table",
      "Editable rows, badges, and signal bars for recurring updates.",
      font,
      palette
    )
    const rows: Array<[string, string, string, string, number]> = [
      ["Palette", "Ready", "AA", palette.signal, 0.92],
      ["Typography", "Review", "JP", palette.accent, 0.76],
      ["Components", "Ready", "UI", palette.primary, 0.84],
      ["Charts", "Active", "Data", palette.secondary, 0.68],
      ["Exports", "Ready", "Office", palette.signal, 0.88],
    ]
    addShape(slide, "rect", {
      x: 0.65,
      y: 1.35,
      w: 11.9,
      h: 0.48,
      fill: { color: palette.depth },
      line: { color: palette.depth, width: 0 },
    })
    ;["Workstream", "Status", "Scope", "Progress"].forEach((h, i) =>
      addText(slide, h, {
        x: [0.9, 5.8, 7.55, 9.0][i],
        y: 1.47,
        w: [4.2, 1.35, 1.1, 2.9][i],
        h: 0.22,
        fontSize: 9,
        fontFace: font,
        bold: true,
        color: palette.background,
      })
    )
    rows.forEach(([name, status, scope, color, progress], i) => {
      const y = 2.03 + i * 0.78
      addShape(slide, "rect", {
        x: 0.65,
        y,
        w: 11.9,
        h: 0.58,
        fill: {
          color:
            i % 2 === 0
              ? palette.surface
              : mixForPpt(palette.surface, palette.background, 0.35),
        },
        line: { color: palette.background, width: 0.5 },
      })
      addText(slide, name, {
        x: 0.9,
        y: y + 0.14,
        w: 4.2,
        h: 0.24,
        fontSize: 11,
        fontFace: font,
        bold: true,
        color: palette.foreground,
      })
      addPill(
        slide,
        5.75,
        y + 0.12,
        1.25,
        status,
        color,
        palette.background,
        font
      )
      addText(slide, scope, {
        x: 7.55,
        y: y + 0.14,
        w: 1.1,
        h: 0.24,
        fontSize: 10,
        fontFace: font,
        color: palette.foreground,
      })
      addProgress(
        slide,
        9.0,
        y + 0.22,
        2.75,
        0.12,
        progress,
        color,
        palette.background
      )
    })
  }

  // 9. Closing
  {
    const slide = pres.addSlide({ masterName: "MORPHOUS" })
    addText(slide, system.motifName, {
      x: 0.65,
      y: 2.15,
      w: 11.8,
      h: 1.0,
      fontSize: 46,
      fontFace: font,
      bold: true,
      color: palette.foreground,
      fit: "shrink",
    })
    addText(
      slide,
      "Editable theme-first Office templates for reports, decks, charts, and bilingual content.",
      {
        x: 0.7,
        y: 3.35,
        w: 10.8,
        h: 0.55,
        fontSize: 18,
        fontFace: font,
        color: palette.accent,
        fit: "shrink",
      }
    )
    addText(slide, system.tags.slice(0, 8).join(" / "), {
      x: 0.7,
      y: 4.25,
      w: 10.8,
      h: 0.35,
      fontSize: 11,
      fontFace: font,
      color: palette.foreground,
      fit: "shrink",
    })
    system.palette.slice(0, 8).forEach((color, i) => {
      addShape(slide, "rect", {
        x: 0.7 + i * 1.45,
        y: 5.35,
        w: 1.2,
        h: 0.5,
        fill: { color: cleanHex(color.hex) },
        line: { color: cleanHex(color.hex), width: 0 },
      })
    })
  }

  const blob = (await pres.write({ outputType: "blob" })) as Blob

  // Override the default Office theme with one built from this system's palette
  // and the chosen Latin + Japanese fonts. This populates Theme Colors and
  // Theme Fonts in PowerPoint.
  const themeXml = buildOfficeTheme(system, opts.mode, {
    latin: font,
    ea: jaFont,
  })
  return injectThemeIntoZip(blob, "ppt/theme/theme1.xml", themeXml)
}

function slideTitle(
  slide: SlideLike,
  title: string,
  subtitle: string,
  font: string,
  palette: OfficePalette
) {
  addText(slide, title, {
    x: 0.65,
    y: 0.42,
    w: 7.2,
    h: 0.42,
    fontSize: 26,
    fontFace: font,
    bold: true,
    color: palette.foreground,
  })
  addText(slide, subtitle, {
    x: 0.67,
    y: 0.95,
    w: 10.8,
    h: 0.32,
    fontSize: 11,
    fontFace: font,
    color: palette.accent,
    fit: "shrink",
  })
}

function addPanel(
  slide: SlideLike,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  line: string
) {
  addShape(slide, "rect", {
    x,
    y,
    w,
    h,
    fill: { color: fill },
    line: { color: line, width: 0.6, transparency: line === fill ? 100 : 0 },
  })
}

function metricCard(
  slide: SlideLike,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  color: string,
  font: string,
  palette: OfficePalette
) {
  addPanel(slide, x, y, w, h, palette.surface, palette.surface)
  addShape(slide, "rect", {
    x,
    y,
    w: 0.1,
    h,
    fill: { color },
    line: { color, width: 0 },
  })
  addText(slide, label, {
    x: x + 0.28,
    y: y + 0.18,
    w: w - 0.45,
    h: 0.24,
    fontSize: 9,
    fontFace: font,
    bold: true,
    color: palette.foreground,
  })
  addText(slide, value, {
    x: x + 0.28,
    y: y + 0.48,
    w: w - 0.45,
    h: 0.55,
    fontSize: h > 1.2 ? 30 : 24,
    fontFace: font,
    bold: true,
    color,
    fit: "shrink",
  })
}

function addButton(
  slide: SlideLike,
  x: number,
  y: number,
  w: number,
  label: string,
  fill: string,
  color: string,
  font: string
) {
  addShape(slide, "roundRect", {
    x,
    y,
    w,
    h: 0.42,
    rectRadius: 0.08,
    fill: { color: fill },
    line: { color: fill, width: 0 },
  })
  addText(slide, label, {
    x: x + 0.15,
    y: y + 0.1,
    w: w - 0.3,
    h: 0.18,
    fontSize: 10,
    fontFace: font,
    bold: true,
    color,
    align: "center",
    fit: "shrink",
  })
}

function formField(
  slide: SlideLike,
  x: number,
  y: number,
  w: number,
  label: string,
  value: string,
  font: string,
  palette: OfficePalette
) {
  addText(slide, label, {
    x,
    y,
    w,
    h: 0.2,
    fontSize: 8.5,
    fontFace: font,
    bold: true,
    color: palette.accent,
  })
  addShape(slide, "rect", {
    x,
    y: y + 0.28,
    w,
    h: 0.48,
    fill: { color: palette.background },
    line: { color: palette.secondary, width: 0.7 },
  })
  addText(slide, value, {
    x: x + 0.12,
    y: y + 0.4,
    w: w - 0.24,
    h: 0.2,
    fontSize: 10,
    fontFace: font,
    color: palette.foreground,
    fit: "shrink",
  })
}

function addPill(
  slide: SlideLike,
  x: number,
  y: number,
  w: number,
  label: string,
  fill: string,
  color: string,
  font: string
) {
  addShape(slide, "roundRect", {
    x,
    y,
    w,
    h: 0.32,
    rectRadius: 0.12,
    fill: { color: fill },
    line: { color: fill, width: 0 },
  })
  addText(slide, label, {
    x: x + 0.12,
    y: y + 0.08,
    w: w - 0.24,
    h: 0.16,
    fontSize: 8.5,
    fontFace: font,
    bold: true,
    color,
    align: "center",
    fit: "shrink",
  })
}

function addSwatchCard(
  slide: SlideLike,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  color: string,
  font: string
) {
  addShape(slide, "rect", {
    x,
    y,
    w,
    h,
    fill: { color },
    line: { color, width: 0 },
  })
  addText(slide, label, {
    x: x + 0.1,
    y: y + 0.19,
    w: w - 0.2,
    h: 0.16,
    fontSize: 7.5,
    fontFace: font,
    bold: true,
    color: contrastText(color),
    align: "center",
    fit: "shrink",
  })
}

function addProgress(
  slide: SlideLike,
  x: number,
  y: number,
  w: number,
  h: number,
  value: number,
  color: string,
  track: string
) {
  addShape(slide, "rect", {
    x,
    y,
    w,
    h,
    fill: { color: track },
    line: { color: track, width: 0 },
  })
  addShape(slide, "rect", {
    x,
    y,
    w: Math.max(0.05, w * Math.min(1, Math.max(0, value))),
    h,
    fill: { color },
    line: { color, width: 0 },
  })
}

function roadmapCopy(index: number, system: MorphousSystem) {
  const copy = [
    `Audit ${system.motifName.toLowerCase()} cues, tone, and core audience needs.`,
    "Translate palette roles into slides, charts, document sections, and statuses.",
    "Build reusable layouts for updates, reports, dashboards, and bilingual content.",
    "Ship branded Office files with theme colors, fonts, and editable patterns.",
  ]
  return copy[index]
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
      fill: { color: cleanHex(color.hex) },
      line: { color: cleanHex(color.hex), width: 0 },
    },
  }))
}

function addChart(
  slide: SlideLike,
  type: unknown,
  data: Array<unknown>,
  options: Record<string, unknown>
) {
  ;(
    slide as {
      addChart: (
        type: unknown,
        data: Array<unknown>,
        options: Record<string, unknown>
      ) => unknown
    }
  ).addChart(type, data, options)
}

function addShape(
  slide: SlideLike,
  shape: string,
  options: Record<string, unknown>
) {
  ;(
    slide as {
      addShape: (shape: string, options: Record<string, unknown>) => unknown
    }
  ).addShape(shape, options)
}

function addText(
  slide: SlideLike,
  text: string | Array<unknown>,
  options: Record<string, unknown>
) {
  ;(
    slide as {
      addText: (
        text: string | Array<unknown>,
        options: Record<string, unknown>
      ) => unknown
    }
  ).addText(text, options)
}

function cleanHex(hex: string) {
  return hex.replace("#", "").toUpperCase()
}

function mixForPpt(a: string, b: string, t: number) {
  const pa = parseHex(a)
  const pb = parseHex(b)
  const r = Math.round(pa[0] * (1 - t) + pb[0] * t)
  const g = Math.round(pa[1] * (1 - t) + pb[1] * t)
  const bl = Math.round(pa[2] * (1 - t) + pb[2] * t)
  return ((r << 16) | (g << 8) | bl).toString(16).toUpperCase().padStart(6, "0")
}

function contrastText(hex: string) {
  const [r, g, b] = parseHex(hex)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luminance > 0.58 ? "1C1712" : "FFFFFF"
}

function parseHex(hex: string): [number, number, number] {
  const n = parseInt(cleanHex(hex), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
