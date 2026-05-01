import { useState } from "react"
import { FileText, Presentation } from "lucide-react"
import type { MorphousSystem } from "@/data/systems"
import type { ThemeMode } from "@/lib/morphous-theme"
import { Button } from "@/components/ui/button"
import { getFont, getJaFont } from "@/lib/typography"

export function OfficeDownload({
  system,
  mode,
  font,
  jaFont,
}: {
  system: MorphousSystem
  mode: ThemeMode
  font: string
  jaFont: string
}) {
  const [busy, setBusy] = useState<"pptx" | "docx" | null>(null)
  const officeFont = getFont(font).officeFamily
  const officeJaFont = getJaFont(jaFont).officeFamily

  async function downloadPptx() {
    setBusy("pptx")
    try {
      const { buildDeck } = await import("@/lib/office/build-pptx")
      const blob = await buildDeck(system, { mode, font: officeFont, jaFont: officeJaFont })
      saveAs(blob, `${system.slug}.pptx`)
    } finally {
      setBusy(null)
    }
  }

  async function downloadDocx() {
    setBusy("docx")
    try {
      const { buildDoc } = await import("@/lib/office/build-docx")
      const blob = await buildDoc(system, { mode, font: officeFont, jaFont: officeJaFont })
      saveAs(blob, `${system.slug}.docx`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={downloadPptx}
        disabled={busy !== null}
        title="Download PowerPoint"
        aria-label="Download PowerPoint"
      >
        <Presentation data-icon="inline-start" />
        <span className="hidden sm:inline">
          {busy === "pptx" ? "Building…" : "PowerPoint"}
        </span>
        {busy === "pptx" ? <span className="sm:hidden">…</span> : null}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={downloadDocx}
        disabled={busy !== null}
        title="Download Word"
        aria-label="Download Word"
      >
        <FileText data-icon="inline-start" />
        <span className="hidden sm:inline">
          {busy === "docx" ? "Building…" : "Word"}
        </span>
        {busy === "docx" ? <span className="sm:hidden">…</span> : null}
      </Button>
    </>
  )
}

async function saveAs(blob: Blob, filename: string) {
  const { saveAs: fsSaveAs } = await import("file-saver")
  fsSaveAs(blob, filename)
}
