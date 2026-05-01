import { buildOfficeTheme, injectDocxTheme } from "./theme-xml"
import type { MorphousSystem } from "@/data/systems"
import type { ThemeMode } from "@/lib/morphous-theme"
import { paletteForOffice } from "@/lib/morphous-theme"

type BuildOptions = {
  mode: ThemeMode
  font: string
  jaFont: string
}

export async function buildDoc(
  system: MorphousSystem,
  opts: BuildOptions
): Promise<Blob> {
  const docx = await import("docx")
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    ShadingType,
    BorderStyle,
    PageBreak,
    TableLayoutType,
    VerticalAlign,
  } = docx

  const palette = paletteForOffice(system, opts.mode)
  const font = opts.font
  const jaFont = opts.jaFont
  const runFont = (latin: string = font) => ({
    ascii: latin,
    hAnsi: latin,
    cs: latin,
    eastAsia: jaFont,
  })
  const monoRunFont = runFont("Consolas")

  const noBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  } as const

  const subtleBorders = {
    top: { style: BorderStyle.SINGLE, size: 6, color: palette.background },
    bottom: { style: BorderStyle.SINGLE, size: 6, color: palette.background },
    left: { style: BorderStyle.SINGLE, size: 6, color: palette.background },
    right: { style: BorderStyle.SINGLE, size: 6, color: palette.background },
    insideHorizontal: {
      style: BorderStyle.SINGLE,
      size: 6,
      color: palette.background,
    },
    insideVertical: {
      style: BorderStyle.SINGLE,
      size: 6,
      color: palette.background,
    },
  } as const

  const stripeTable = new Table({
    rows: [
      new TableRow({
        children: system.palette.map(
          (color) =>
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: " " })] }),
              ],
              shading: {
                type: ShadingType.CLEAR,
                color: "auto",
                fill: cleanHex(color.hex),
              },
              width: {
                size: Math.floor(100 / system.palette.length),
                type: WidthType.PERCENTAGE,
              },
            })
        ),
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    layout: TableLayoutType.FIXED,
  })

  const metricTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          metricCell("Brand fit", "92%", palette.primary),
          metricCell("UI coverage", "14 patterns", palette.accent),
          metricCell(
            "Color roles",
            String(system.palette.length),
            palette.signal
          ),
        ],
      }),
    ],
  })

  const themeMappingTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: subtleBorders,
    layout: TableLayoutType.FIXED,
    rows: [
      headerRow(["Office slot", "Morphous role", "Color name", "Hex"]),
      ...[
        ["Accent 1", "Primary"],
        ["Accent 2", "Accent"],
        ["Accent 3", "Secondary"],
        ["Accent 4", "Signal"],
        ["Light 1", "Background"],
        ["Dark 1", "Ink"],
      ].map(([slot, roleName]) => {
        const color =
          system.palette.find((entry) => entry.role === roleName) ??
          system.palette[0]
        return new TableRow({
          children: [
            textCell(slot, palette.foreground, false, palette.surface),
            swatchCell(roleName, cleanHex(color.hex)),
            textCell(color.name, palette.foreground),
            textCell(color.hex.toUpperCase(), palette.accent, true),
          ],
        })
      }),
    ],
  })

  const chartTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: subtleBorders,
    layout: TableLayoutType.FIXED,
    rows: [
      headerRow(["Metric", "Value", "Theme-colored editable bar"]),
      barRow("Adoption", 92, palette.primary),
      barRow("Design coverage", 78, palette.accent),
      barRow("Data readiness", 86, palette.secondary),
      barRow("Localization", 74, palette.signal),
    ],
  })

  const roadmapTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          roadmapCell(
            "01",
            "Discover",
            `Audit ${system.motifName.toLowerCase()} cues, audience, and content needs.`,
            palette.primary
          ),
          roadmapCell(
            "02",
            "Design",
            "Translate palette roles into report, deck, dashboard, and status layouts.",
            palette.accent
          ),
          roadmapCell(
            "03",
            "Build",
            "Create reusable pages, tables, charts, and bilingual content patterns.",
            palette.secondary
          ),
          roadmapCell(
            "04",
            "Launch",
            "Ship Office files with theme colors and editable business examples.",
            palette.signal
          ),
        ],
      }),
    ],
  })

  const componentTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: subtleBorders,
    layout: TableLayoutType.FIXED,
    rows: [
      headerRow(["Pattern", "Usage", "Theme treatment"]),
      new TableRow({
        children: [
          textCell("KPI card", palette.foreground, false, palette.surface),
          textCell(
            "Executive updates and dashboard summaries",
            palette.foreground
          ),
          textCell(
            "Primary/accent edge, surface fill, foreground text",
            palette.foreground
          ),
        ],
      }),
      new TableRow({
        children: [
          textCell("Chart bar", palette.foreground, false, palette.surface),
          textCell(
            "Progress, adoption, readiness, and comparison data",
            palette.foreground
          ),
          textCell(
            "Theme Accent 1-4 colors with background track",
            palette.foreground
          ),
        ],
      }),
      new TableRow({
        children: [
          textCell("Status badge", palette.foreground, false, palette.surface),
          textCell(
            "Ready, review, active, risk, and blocked states",
            palette.foreground
          ),
          textCell(
            "Signal, accent, secondary, and primary role fills",
            palette.foreground
          ),
        ],
      }),
      new TableRow({
        children: [
          textCell(
            "Bilingual note",
            palette.foreground,
            false,
            palette.surface
          ),
          textCell("English and Japanese report copy", palette.foreground),
          textCell(`${font} / ${jaFont} theme fonts`, palette.foreground),
        ],
      }),
    ],
  })

  const paletteAppendix = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: subtleBorders,
    layout: TableLayoutType.FIXED,
    rows: [
      headerRow(["Role", "Name", "Hex", "OKLCH"]),
      ...system.palette.map(
        (color) =>
          new TableRow({
            children: [
              swatchCell(color.role, cleanHex(color.hex)),
              textCell(color.name, palette.foreground),
              textCell(color.hex.toUpperCase(), palette.accent, true),
              textCell(color.oklch, palette.foreground, true),
            ],
          })
      ),
    ],
  })

  const doc = new Document({
    creator: "Morphous",
    title: system.name,
    description: system.description,
    styles: {
      default: {
        document: {
          run: { font: runFont(), size: 22, color: palette.foreground },
        },
      },
    },
    sections: [
      {
        properties: {},
        children: [
          eyebrow(
            `${system.motifCategory.toUpperCase()} / ${system.biome.toUpperCase()}`
          ),
          new Paragraph({
            heading: HeadingLevel.TITLE,
            children: [
              new TextRun({
                text: system.name,
                bold: true,
                color: palette.foreground,
                font: runFont(),
                size: 72,
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: system.motifName,
                italics: true,
                color: palette.accent,
                font: runFont(),
                size: 32,
              }),
            ],
            spacing: { after: 280 },
          }),
          stripeTable,
          gap(280),
          paragraph(system.description, 24, palette.foreground, 300),
          metricTable,
          gap(280),

          heading2("Executive Summary"),
          paragraph(
            `This Word template uses the ${system.name} theme color set for the cover, KPI cards, editable chart bars, roadmap blocks, status tables, and palette appendix. The colors are also injected into the Word Theme Colors picker.`,
            22,
            palette.foreground,
            220
          ),
          callout(system.layout, palette.primary),

          heading2("Theme Color Set"),
          paragraph(
            "The table maps Morphous palette roles to Office theme slots so copied charts, SmartArt, and tables can keep using the same color family.",
            20,
            palette.foreground,
            180
          ),
          themeMappingTable,

          new Paragraph({ children: [new PageBreak()] }),

          heading2("Dashboard Chart"),
          paragraph(
            "The bars below are native Word tables, so teams can edit labels, values, and widths while preserving theme colors.",
            20,
            palette.foreground,
            180
          ),
          chartTable,
          gap(260),
          heading2("Roadmap"),
          roadmapTable,

          new Paragraph({ children: [new PageBreak()] }),

          heading2("Component Patterns"),
          paragraph(
            `Set in ${font} for Latin text and ${jaFont} for Japanese text. ${system.typography}`,
            20,
            palette.foreground,
            180
          ),
          componentTable,
          gap(260),
          heading2("Palette Appendix"),
          paletteAppendix,
        ],
      },
    ],
  })

  function paragraph(
    text: string,
    size = 22,
    color = palette.foreground,
    after = 160
  ) {
    return new Paragraph({
      children: [new TextRun({ text, color, font: runFont(), size })],
      spacing: { after },
    })
  }

  function eyebrow(text: string) {
    return new Paragraph({
      children: [
        new TextRun({
          text,
          color: palette.primary,
          font: runFont(),
          bold: true,
          size: 18,
          characterSpacing: 40,
        }),
      ],
      spacing: { after: 120 },
    })
  }

  function heading2(text: string) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [
        new TextRun({
          text,
          bold: true,
          color: palette.foreground,
          font: runFont(),
          size: 32,
        }),
      ],
      spacing: { before: 280, after: 150 },
    })
  }

  function gap(after: number) {
    return new Paragraph({ text: "", spacing: { after } })
  }

  function callout(text: string, fill: string) {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noBorders,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { type: ShadingType.CLEAR, color: "auto", fill },
              width: { size: 4, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ children: [new TextRun({ text: " " })] }),
              ],
            }),
            new TableCell({
              shading: {
                type: ShadingType.CLEAR,
                color: "auto",
                fill: palette.surface,
              },
              width: { size: 96, type: WidthType.PERCENTAGE },
              margins: { top: 180, bottom: 180, left: 220, right: 220 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text,
                      color: palette.foreground,
                      font: runFont(),
                      size: 20,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    })
  }

  function headerRow(headers: Array<string>) {
    return new TableRow({
      tableHeader: true,
      children: headers.map(
        (h) =>
          new TableCell({
            shading: {
              type: ShadingType.CLEAR,
              color: "auto",
              fill: palette.depth,
            },
            margins: { top: 120, bottom: 120, left: 120, right: 120 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: h,
                    bold: true,
                    color: palette.background,
                    font: runFont(),
                    size: 18,
                  }),
                ],
              }),
            ],
          })
      ),
    })
  }

  function metricCell(label: string, value: string, fill: string) {
    return new TableCell({
      shading: { type: ShadingType.CLEAR, color: "auto", fill },
      margins: { top: 180, bottom: 180, left: 180, right: 180 },
      width: { size: 33, type: WidthType.PERCENTAGE },
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: label,
              color: contrastText(fill),
              font: runFont(),
              bold: true,
              size: 18,
            }),
          ],
          spacing: { after: 80 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: value,
              color: contrastText(fill),
              font: runFont(),
              bold: true,
              size: 34,
            }),
          ],
        }),
      ],
    })
  }

  function swatchCell(text: string, fill: string) {
    return new TableCell({
      shading: { type: ShadingType.CLEAR, color: "auto", fill },
      margins: { top: 110, bottom: 110, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              bold: true,
              color: contrastText(fill),
              font: runFont(),
              size: 18,
            }),
          ],
        }),
      ],
    })
  }

  function textCell(text: string, color: string, mono = false, fill?: string) {
    return new TableCell({
      shading: fill
        ? { type: ShadingType.CLEAR, color: "auto", fill }
        : undefined,
      margins: { top: 110, bottom: 110, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              color,
              font: mono ? monoRunFont : runFont(),
              size: 18,
            }),
          ],
        }),
      ],
    })
  }

  function barRow(label: string, value: number, fill: string) {
    return new TableRow({
      children: [
        textCell(label, palette.foreground, false, palette.surface),
        textCell(`${value}%`, palette.accent, true),
        new TableCell({
          margins: { top: 120, bottom: 120, left: 120, right: 120 },
          verticalAlign: VerticalAlign.CENTER,
          children: [barTable(value, fill)],
        }),
      ],
    })
  }

  function barTable(value: number, fill: string) {
    const filled = Math.max(1, Math.min(99, Math.round(value)))
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noBorders,
      layout: TableLayoutType.FIXED,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: filled, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, color: "auto", fill },
              children: [
                new Paragraph({ children: [new TextRun({ text: " " })] }),
              ],
            }),
            new TableCell({
              width: { size: 100 - filled, type: WidthType.PERCENTAGE },
              shading: {
                type: ShadingType.CLEAR,
                color: "auto",
                fill: palette.background,
              },
              children: [
                new Paragraph({ children: [new TextRun({ text: " " })] }),
              ],
            }),
          ],
        }),
      ],
    })
  }

  function roadmapCell(num: string, title: string, text: string, fill: string) {
    return new TableCell({
      width: { size: 25, type: WidthType.PERCENTAGE },
      shading: {
        type: ShadingType.CLEAR,
        color: "auto",
        fill: palette.surface,
      },
      margins: { top: 180, bottom: 180, left: 180, right: 180 },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: num,
              color: fill,
              bold: true,
              font: runFont(),
              size: 26,
            }),
          ],
          spacing: { after: 80 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: title,
              color: palette.foreground,
              bold: true,
              font: runFont(),
              size: 22,
            }),
          ],
          spacing: { after: 110 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text,
              color: palette.foreground,
              font: runFont(),
              size: 18,
            }),
          ],
        }),
      ],
    })
  }

  const blob = await Packer.toBlob(doc)
  const themeXml = buildOfficeTheme(system, opts.mode, {
    latin: font,
    ea: jaFont,
  })
  return injectDocxTheme(blob, themeXml)
}

function cleanHex(hex: string) {
  return hex.replace("#", "").toUpperCase()
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
