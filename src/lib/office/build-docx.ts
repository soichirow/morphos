import { buildOfficeTheme, injectDocxTheme } from "./theme-xml"
import type { MorphousSystem } from "@/data/systems"
import type { ThemeMode } from "@/lib/morphous-theme"
import { paletteForOffice } from "@/lib/morphous-theme"

type BuildOptions = {
  mode: ThemeMode
  font: string
  jaFont: string
}

export async function buildDoc(system: MorphousSystem, opts: BuildOptions): Promise<Blob> {
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
  } = docx

  const palette = paletteForOffice(system, opts.mode)
  const font = opts.font
  const jaFont = opts.jaFont
  // Bilingual font config — ascii/hAnsi pick up Latin runs, eastAsia picks
  // up Japanese characters. Word renders each character with the matching
  // typeface based on script.
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

  const stripeRow = new TableRow({
    children: system.palette.map(
      (color) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: " " })] })],
          shading: {
            type: ShadingType.CLEAR,
            color: "auto",
            fill: color.hex.replace("#", ""),
          },
          width: { size: Math.floor(100 / system.palette.length), type: WidthType.PERCENTAGE },
        })
    ),
  })

  const stripeTable = new Table({
    rows: [stripeRow],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
  })

  const paletteAppendix = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: ["Role", "Name", "Hex", "OKLCH"].map(
          (h) =>
            new TableCell({
              shading: { type: ShadingType.CLEAR, color: "auto", fill: palette.surface },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: h,
                      bold: true,
                      color: palette.foreground,
                      font: runFont(),
                    }),
                  ],
                }),
              ],
            })
        ),
      }),
      ...system.palette.map(
        (color) =>
          new TableRow({
            children: [
              new TableCell({
                shading: {
                  type: ShadingType.CLEAR,
                  color: "auto",
                  fill: color.hex.replace("#", ""),
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: color.role,
                        bold: true,
                        color: palette.background,
                        font: runFont(),
                      }),
                    ],
                  }),
                ],
              }),
              cell(color.name, palette.foreground),
              cell(color.hex.toUpperCase(), palette.accent, true),
              cell(color.oklch, palette.foreground, true),
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
          new Paragraph({
            children: [
              new TextRun({
                text: `${system.motifCategory.toUpperCase()} · ${system.biome.toUpperCase()}`,
                color: palette.primary,
                font: runFont(),
                size: 18,
                characterSpacing: 40,
              }),
            ],
            spacing: { after: 120 },
          }),
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
            spacing: { after: 320 },
          }),
          stripeTable,
          new Paragraph({ text: "", spacing: { after: 320 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: system.description,
                color: palette.foreground,
                font: runFont(),
                size: 24,
              }),
            ],
            spacing: { after: 320 },
          }),

          heading2("Typography"),
          new Paragraph({
            children: [
              new TextRun({
                text: `Set in ${font} (Latin) / ${jaFont} (日本語). `,
                bold: true,
                color: palette.primary,
                font: runFont(),
              }),
              new TextRun({
                text: system.typography,
                color: palette.foreground,
                font: runFont(),
              }),
            ],
            spacing: { after: 240 },
          }),

          heading2("Layout"),
          new Paragraph({
            children: [
              new TextRun({ text: system.layout, color: palette.foreground, font: runFont() }),
            ],
            spacing: { after: 240 },
          }),

          new Paragraph({ children: [new PageBreak()] }),

          heading2("Palette"),
          new Paragraph({
            children: [
              new TextRun({
                text: `${system.palette.length} roles derived from ${system.motifName}.`,
                color: palette.accent,
                font: runFont(),
              }),
            ],
            spacing: { after: 240 },
          }),
          paletteAppendix,
        ],
      },
    ],
  })

  function cell(text: string, color: string, mono = false) {
    return new TableCell({
      children: [
        new Paragraph({
          children: [new TextRun({ text, color, font: mono ? monoRunFont : runFont() })],
        }),
      ],
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
      spacing: { before: 240, after: 160 },
    })
  }

  const blob = await Packer.toBlob(doc)
  const themeXml = buildOfficeTheme(system, opts.mode, { latin: font, ea: jaFont })
  return injectDocxTheme(blob, themeXml)
}
