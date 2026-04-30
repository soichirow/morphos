import { Languages, Sparkles, Type } from "lucide-react"
import { fonts, jaFonts, presets } from "@/lib/typography"

export function TypographyPicker({
  presetId,
  onPresetChange,
  value,
  onChange,
  jaValue,
  onJaChange,
}: {
  presetId: string
  onPresetChange: (id: string) => void
  value: string
  onChange: (id: string) => void
  jaValue: string
  onJaChange: (id: string) => void
}) {
  return (
    <div className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-border bg-card pl-2 pr-1">
      <label className="inline-flex min-w-0 items-center gap-1 text-xs font-medium text-muted-foreground">
        <Sparkles className="size-4 shrink-0 text-primary" />
        <select
          value={presetId}
          onChange={(event) => onPresetChange(event.target.value)}
          className="h-9 max-w-[8.5rem] truncate bg-transparent pr-1 text-sm font-medium text-foreground outline-none sm:max-w-[14rem]"
          aria-label="Typography preset"
        >
          {presetId === "" ? <option value="">Custom</option> : null}
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>
      <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />
      <label className="hidden min-w-0 items-center gap-1 text-xs font-medium text-muted-foreground sm:inline-flex">
        <Type className="size-4 shrink-0 text-primary" />
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 max-w-[10rem] truncate bg-transparent pr-1 text-sm text-foreground outline-none"
          aria-label="Latin font"
        >
          {fonts.map((font) => (
            <option key={font.id} value={font.id}>
              {font.label}
            </option>
          ))}
        </select>
      </label>
      <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />
      <label className="hidden min-w-0 items-center gap-1 text-xs font-medium text-muted-foreground sm:inline-flex">
        <Languages className="size-4 shrink-0 text-primary" />
        <select
          value={jaValue}
          onChange={(event) => onJaChange(event.target.value)}
          className="h-9 max-w-[10rem] truncate bg-transparent pr-1 text-sm text-foreground outline-none"
          aria-label="Japanese font"
        >
          {jaFonts.map((font) => (
            <option key={font.id} value={font.id}>
              {font.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
