import { useState } from "react"
import { FileText, Presentation } from "lucide-react"

import type { MorphousSystem } from "@/domain/morphous-system"
import type { ThemeMode } from "@/lib/morphous-theme"
import { useLanguage } from "@/lib/i18n-context"
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
  const { t } = useLanguage()
  const [busy, setBusy] = useState<"pptx" | "docx" | null>(null)
  const officeFont = getFont(font).officeFamily
  const officeJaFont = getJaFont(jaFont).officeFamily

  async function downloadPptx() {
    setBusy("pptx")
    try {
      const { buildDeck } = await import("@/lib/office/build-pptx")
      const blob = await buildDeck(system, {
        mode,
        font: officeFont,
        jaFont: officeJaFont,
      })
      saveAs(blob, `${system.slug}.pptx`)
    } finally {
      setBusy(null)
    }
  }

  async function downloadDocx() {
    setBusy("docx")
    try {
      const { buildDoc } = await import("@/lib/office/build-docx")
      const blob = await buildDoc(system, {
        mode,
        font: officeFont,
        jaFont: officeJaFont,
      })
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
        title={t("office.downloadPowerPoint")}
        aria-label={t("office.downloadPowerPoint")}
      >
        <Presentation data-icon="inline-start" />
        <span className="hidden sm:inline">
          {busy === "pptx" ? t("office.building") : "PowerPoint"}
        </span>
        {busy === "pptx" ? <span className="sm:hidden">…</span> : null}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={downloadDocx}
        disabled={busy !== null}
        title={t("office.downloadWord")}
        aria-label={t("office.downloadWord")}
      >
        <FileText data-icon="inline-start" />
        <span className="hidden sm:inline">
          {busy === "docx" ? t("office.building") : "Word"}
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
