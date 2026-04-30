import { useState } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { ArrowLeft, Copy, Download, FileCode2, Image, Moon, Palette, Sun } from "lucide-react"

import type { ThemeMode } from "@/lib/morphous-theme"
import { Button } from "@/components/ui/button"
import { OfficeDownload } from "@/components/office-download"
import { TypographyPicker } from "@/components/typography-picker"
import { systems } from "@/data/systems"
import { paletteGradient, themeStyle } from "@/lib/morphous-theme"
import { useFont } from "@/lib/use-font"

export const Route = createFileRoute("/systems/$slug")({
  component: SystemDetailRoute,
})

function SystemDetailRoute() {
  const { slug } = Route.useParams()
  const system = systems.find((item) => item.slug === slug)
  const [mode, setMode] = useState<ThemeMode>("light")
  const { fontId, setFontId, font, jaFontId, setJaFontId, presetId, setPresetId } = useFont()

  if (!system) {
    return (
      <main className="mx-auto grid min-h-svh max-w-3xl place-items-center px-6">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-semibold">System not found</h1>
          <Button asChild>
            <Link to="/">Back to catalog</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <div
      className={mode === "dark" ? "dark" : ""}
      style={{ ...themeStyle(system, mode), fontFamily: font.stack }}
    >
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 80% 0%, color-mix(in oklch, var(--page-glow), transparent 70%), transparent 70%), " +
            "linear-gradient(180deg, var(--page-bg-from), var(--page-bg-to))",
        }}
      />
      <main className="relative min-h-svh text-foreground">
      <section className="border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
              <Link to="/">
                <ArrowLeft data-icon="inline-start" />
                Catalog
              </Link>
            </Button>
            <div className="flex flex-wrap items-center gap-2">
            <TypographyPicker
              presetId={presetId}
              onPresetChange={setPresetId}
              value={fontId}
              onChange={setFontId}
              jaValue={jaFontId}
              onJaChange={setJaFontId}
            />
            <div className="flex w-fit rounded-lg border border-border bg-card p-1">
              <Button variant={mode === "light" ? "default" : "ghost"} size="sm" onClick={() => setMode("light")}>
                <Sun data-icon="inline-start" />
                Light
              </Button>
              <Button variant={mode === "dark" ? "default" : "ghost"} size="sm" onClick={() => setMode("dark")}>
                <Moon data-icon="inline-start" />
                Dark
              </Button>
            </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_25rem]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <span>{system.motifCategory}</span>
                <span className="h-px w-8 bg-border" />
                <span>{system.biome}</span>
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">{system.name}</h1>
                <p className="max-w-3xl text-base leading-7 text-muted-foreground">{system.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <a href={system.assets.themeCss} download>
                    <FileCode2 data-icon="inline-start" />
                    Theme CSS
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={system.assets.themeJson} download>
                    <Download data-icon="inline-start" />
                    Theme JSON
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={system.assets.promptsJson} download>
                    <Copy data-icon="inline-start" />
                    Prompts
                  </a>
                </Button>
                <OfficeDownload system={system} mode={mode} font={fontId} jaFont={jaFontId} />
              </div>
              <p className="text-xs text-muted-foreground">
                Motif art and reference boards on this page are AI-generated. The prompts used to
                produce them are listed in the Prompts section below.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <img src={system.assets.motif} alt={`${system.motifName} motif`} className="mx-auto aspect-square max-h-72 rounded-lg object-contain" />
              <div className="mt-4 h-2 rounded-full" style={{ background: paletteGradient(system) }} />
              <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Motif:</span> {system.motifName}
                </div>
                <div>
                  <span className="font-medium text-foreground">Typography:</span> {system.typography}
                </div>
                <div>
                  <span className="font-medium text-foreground">Layout:</span> {system.layout}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <Palette className="size-4 text-primary" />
              <h2 className="text-lg font-semibold">Palette</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {system.palette.map((color) => (
                <div key={color.role} className="grid grid-cols-[3.25rem_1fr] items-center gap-3">
                  <span className="h-10 rounded-md border border-border" style={{ backgroundColor: color.hex }} />
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-medium">{color.role}</span>
                      <span className="font-mono text-xs text-muted-foreground">{color.hex}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{color.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">shadcn Tokens</h2>
            <pre className="mt-4 max-h-[34rem] overflow-auto rounded-md bg-muted p-4 text-xs leading-6 text-foreground">
              <code>{tokenSnippet(system, mode)}</code>
            </pre>
          </section>
        </div>

        <div className="space-y-6">
          <section className="grid gap-4">
            <figure className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <img src={mode === "dark" ? system.assets.darkBoard : system.assets.board} alt={`${system.name} design system board`} className="aspect-video w-full object-cover" />
              <figcaption className="border-t border-border px-4 py-3 text-sm font-medium">
                {mode === "dark" ? "Dark design-system board" : "Light design-system board"}
              </figcaption>
            </figure>
            <ThemeSurface />
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <Image className="size-4 text-primary" />
              <h2 className="text-lg font-semibold">Generated Assets</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {system.assets.hero ? <AssetFigure label="Hero" image={system.assets.hero} /> : null}
              {system.assets.texture ? <AssetFigure label="Texture" image={system.assets.texture} square /> : null}
              {system.assets.examples.map((example) => (
                <AssetFigure key={example.id} label={example.label} image={example.image} />
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Prompts</h2>
              <Button asChild variant="outline" size="sm">
                <a href={system.assets.promptsJson} download>
                  <Download data-icon="inline-start" />
                  prompts.json
                </a>
              </Button>
            </div>
            <div className="mt-4 grid gap-3">
              {system.prompts.map((prompt) => (
                <article key={prompt.id} className="rounded-lg border border-border bg-background p-4">
                  <h3 className="text-sm font-semibold">{prompt.label}</h3>
                  <a href={prompt.asset} className="mt-1 block truncate font-mono text-xs text-primary">
                    {prompt.asset}
                  </a>
                  <p className="mt-3 whitespace-pre-line text-xs leading-5 text-muted-foreground">{prompt.prompt}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
      </main>
    </div>
  )
}

function ThemeSurface() {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Live Theme Surface</h2>
          <p className="mt-1 text-sm text-muted-foreground">The same CSS variables drive buttons, forms, cards, tables, and chart color.</p>
        </div>
        <div className="flex gap-2">
          <Button>Save</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-4">
          <label className="grid gap-1 text-sm">
            Search
            <input className="h-9 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-3 focus:ring-ring/20" defaultValue="紅葉 tokens" />
          </label>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            {["Primary action", "Muted state", "Accent event"].map((item, index) => (
              <div key={item} className="flex items-center justify-between border-b border-border px-3 py-2 text-sm last:border-b-0">
                <span>{item}</span>
                <span className={`rounded-md px-2 py-1 text-xs ${index === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  Ready
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="grid grid-cols-3 gap-3">
            {["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"].map((token, index) => (
              <span
                key={token}
                className="rounded-md border border-border p-2 text-xs"
                style={{
                  color: index < 3 ? "var(--primary-foreground)" : "var(--foreground)",
                  backgroundColor: `var(--${token})`,
                }}
              >
                {token}
              </span>
            ))}
          </div>
          <div className="mt-4 flex h-28 items-end gap-2 rounded-lg border border-border bg-card p-3">
            {[48, 74, 56, 88, 69].map((height, index) => (
              <span key={height} className="flex-1 rounded-t" style={{ height: `${height}%`, backgroundColor: `var(--chart-${index + 1})` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AssetFigure({ label, image, square = false }: { label: string; image: string; square?: boolean }) {
  return (
    <figure className="overflow-hidden rounded-lg border border-border bg-background">
      <img src={image} alt={label} className={`${square ? "aspect-square" : "aspect-video"} w-full object-cover`} />
      <figcaption className="flex items-center justify-between gap-3 border-t border-border px-3 py-2 text-sm">
        <span>{label}</span>
        <a href={image} download className="text-primary">
          Download
        </a>
      </figcaption>
    </figure>
  )
}

function tokenSnippet(system: (typeof systems)[number], mode: ThemeMode) {
  const tokens = mode === "dark" ? system.darkTokens : system.tokens
  const selector = mode === "dark" ? ".dark" : ":root"
  const tokenLines = Object.entries(tokens).map(([key, value]) => `  --${key}: ${value};`)
  return `${selector} {\n${tokenLines.join("\n")}\n}`
}
