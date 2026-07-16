import JSZip from "jszip"
import { describe, expect, it } from "vitest"

import { buildDoc } from "./build-docx"
import { buildDeck } from "./build-pptx"
import { resolveSystem } from "@/domain/catalog"
import { systems } from "@/data/systems"
import { paletteForOffice } from "@/lib/morphous-theme"


const system = resolveSystem(systems, undefined)
const options = {
  mode: "light" as const,
  font: "Geist",
  jaFont: "Noto Sans JP",
}

async function unzip(blob: Blob) {
  return JSZip.loadAsync(await blob.arrayBuffer())
}

async function readRequired(zip: JSZip, path: string): Promise<string> {
  const file = zip.file(path)
  if (!file) throw new Error(`Generated Office file is missing ${path}`)
  return file.async("string")
}

describe("Office artifact integration", () => {
  it("builds a real PPTX package with editable slides and the selected theme", async () => {
    const zip = await unzip(await buildDeck(system, options))
    const presentation = await readRequired(zip, "ppt/presentation.xml")
    const theme = await readRequired(zip, "ppt/theme/theme1.xml")
    const slideFiles = Object.keys(zip.files).filter((path) =>
      /^ppt\/slides\/slide\d+\.xml$/.test(path)
    )

    expect(presentation).toContain("<p:presentation")
    expect(slideFiles.length).toBeGreaterThanOrEqual(8)
    expect(theme).toContain(options.font)
    expect(theme).toContain(options.jaFont)
    expect(theme).toContain(paletteForOffice(system).primary)
  }, 30_000)

  it("builds a real DOCX package with document relationships and the selected theme", async () => {
    const zip = await unzip(await buildDoc(system, options))
    const document = await readRequired(zip, "word/document.xml")
    const relationships = await readRequired(
      zip,
      "word/_rels/document.xml.rels"
    )
    const theme = await readRequired(zip, "word/theme/theme1.xml")

    expect(document).toContain("<w:document")
    expect(document).toContain(system.name)
    expect(relationships).toContain(
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme"
    )
    expect(theme).toContain(options.font)
    expect(theme).toContain(options.jaFont)
    expect(theme).toContain(paletteForOffice(system).primary)
  }, 30_000)
})
