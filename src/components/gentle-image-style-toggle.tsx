import { Cloud, Grid3X3, Image } from "lucide-react"

import { Button } from "./ui/button"
import { useGentleImages } from "@/lib/gentle-images-context"
import { useLanguage } from "@/lib/i18n-context"

const modeOptions = [
  {
    value: "fluffy",
    label: "gallery.fluffyMode",
    description: "gallery.fluffyModeHelp",
    Icon: Cloud,
  },
  {
    value: "mosaic",
    label: "gallery.mosaicMode",
    description: "gallery.mosaicModeHelp",
    Icon: Grid3X3,
  },
  {
    value: "normal",
    label: "gallery.normalMode",
    description: "gallery.normalModeHelp",
    Icon: Image,
  },
] as const

export function GentleImageStyleToggle() {
  const { t } = useLanguage()
  const { displayMode, setDisplayMode } = useGentleImages()

  return (
    <div
      className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-card/80 p-1 shadow-sm"
      role="group"
      aria-label={t("gallery.displayMode")}
    >
      {modeOptions.map(({ value, label, description, Icon }) => (
        <Button
          key={value}
          variant={displayMode === value ? "default" : "ghost"}
          onClick={() => setDisplayMode(value)}
          aria-label={t(label)}
          aria-pressed={displayMode === value}
          title={t(description)}
          className="h-auto min-h-12 flex-col gap-0.5 px-2 py-2"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold sm:text-sm">
            <Icon className="size-3.5" aria-hidden />
            {t(label)}
          </span>
          <span className="hidden text-[10px] font-normal opacity-75 md:block">
            {t(description)}
          </span>
        </Button>
      ))}
    </div>
  )
}
