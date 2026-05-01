import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import {
  Check,
  Copy,
  Download,
  FileCode2,
  Image as ImageIcon,
  Moon,
  Palette,
  Search,
  Sparkles,
  Sun,
  X,
} from "lucide-react"

import type { ThemeMode } from "@/lib/morphous-theme"
import type { MorphousSystem } from "@/data/systems"
import { Button } from "@/components/ui/button"
import { OfficeDownload } from "@/components/office-download"
import { TypographyPicker } from "@/components/typography-picker"
import { biomes, motifCategories, systems } from "@/data/systems"
import { paletteGradient, themeStyle } from "@/lib/morphous-theme"
import { previewAssetPath } from "@/lib/asset-preview"
import { colorDistance } from "@/lib/color-distance"
import { useFont } from "@/lib/use-font"
import { usePaletteOverrides } from "@/lib/use-palette-overrides"

type GallerySearch = { system?: string }

type LightboxItem = { src: string; alt: string; downloadName?: string }
const LightboxContext = createContext<((item: LightboxItem) => void) | null>(null)
const useLightbox = () => useContext(LightboxContext)

function Lightbox({ item, onClose }: { item: LightboxItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <img
        src={item.src}
        alt={item.alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92svh] max-w-[92vw] cursor-default rounded-md object-contain shadow-2xl"
        decoding="async"
      />
      <div
        className="absolute right-3 top-3 flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <a
          href={item.src}
          download={item.downloadName}
          className="grid size-9 place-items-center rounded-md bg-background/90 text-foreground shadow hover:bg-background"
          aria-label="Download"
          title="Download"
        >
          <Download className="size-4" />
        </a>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 place-items-center rounded-md bg-background/90 text-foreground shadow hover:bg-background"
          aria-label="Close"
          title="Close (Esc)"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/gallery")({
  component: CatalogRoute,
  validateSearch: (search: Record<string, unknown>): GallerySearch => ({
    system: typeof search.system === "string" ? search.system : undefined,
  }),
})

type SortKey = "name" | "biome" | "motifName" | "color"
type ColorRoleKey = "Primary" | "Accent" | "Background"

const sortOptions: Array<SortKey> = ["name", "biome", "motifName", "color"]
const colorRoleOptions: Array<ColorRoleKey> = ["Primary", "Accent", "Background"]

function CatalogRoute() {
  const { system: paramSlug } = Route.useSearch()
  const initialSlug =
    (paramSlug && systems.find((s) => s.slug === paramSlug)?.slug) || systems[0]?.slug || ""
  const [query, setQuery] = useState("")
  const [biome, setBiome] = useState("all")
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState<SortKey>("name")
  const [mode, setMode] = useState<ThemeMode>("light")
  const [activeSlug, setActiveSlug] = useState(initialSlug)

  useEffect(() => {
    if (paramSlug && systems.some((s) => s.slug === paramSlug)) {
      setActiveSlug((prev) => (prev === paramSlug ? prev : paramSlug))
    }
  }, [paramSlug])
  const [searchColor, setSearchColor] = useState<string>("")
  const [colorRole, setColorRole] = useState<ColorRoleKey>("Primary")
  const { fontId, setFontId, font, jaFontId, setJaFontId, presetId, setPresetId } = useFont()
  const [lightbox, setLightbox] = useState<LightboxItem | null>(null)
  const openLightbox = useCallback((item: LightboxItem) => setLightbox(item), [])

  const baseSystem = systems.find((system) => system.slug === activeSlug) ?? systems[0]
  const { tunedSystem: activeSystem, overrides, hasOverrides, setOverride, resetOverrides } =
    usePaletteOverrides(baseSystem)

  const filteredSystems = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const list = systems.filter((system) => {
      const searchText = [
        system.name,
        system.motifName,
        system.motifCategory,
        system.biome,
        system.motif,
        system.description,
        system.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase()
      return (
        (!normalized || searchText.includes(normalized)) &&
        (biome === "all" || system.biome === biome) &&
        (category === "all" || system.motifCategory === category)
      )
    })
    if (sort === "color" && searchColor) {
      return list.slice().sort((a, b) => {
        const ca = a.palette.find((c) => c.role === colorRole)?.hex ?? "#000000"
        const cb = b.palette.find((c) => c.role === colorRole)?.hex ?? "#000000"
        return colorDistance(searchColor, ca) - colorDistance(searchColor, cb)
      })
    }
    if (sort === "color") return list
    const key = sort
    return list
      .slice()
      .sort((a, b) =>
        a[key].localeCompare(
          b[key]
        )
      )
  }, [biome, category, colorRole, query, searchColor, sort])

  return (
    <LightboxContext.Provider value={openLightbox}>
    <div
      className={mode === "dark" ? "dark" : ""}
      style={{ ...themeStyle(activeSystem, mode), fontFamily: font.stack }}
    >
      {lightbox ? <Lightbox item={lightbox} onClose={() => setLightbox(null)} /> : null}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 80% 0%, color-mix(in oklch, var(--page-glow), transparent 70%), transparent 70%), " +
            "radial-gradient(80% 60% at 0% 100%, color-mix(in oklch, var(--palette-primary), transparent 80%), transparent 70%), " +
            "linear-gradient(180deg, var(--page-bg-from), var(--page-bg-to))",
        }}
      />

      <main className="relative min-h-svh overflow-x-hidden text-foreground">
        <header className="z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl lg:sticky lg:top-0">
          <div className="mx-auto flex max-w-[88rem] flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <Link
                to="/"
                aria-label="Morphous home"
                className="-m-1 flex items-center gap-3 rounded-lg p-1 transition hover:bg-muted/40"
              >
                <span
                  className="grid size-9 place-items-center rounded-lg border border-border bg-card"
                  style={{ background: paletteGradient(activeSystem) }}
                  aria-hidden
                />
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Morphous
                  </p>
                  <h1 className="text-base font-semibold tracking-tight sm:text-lg">
                    Nature-coded design systems for shadcn
                  </h1>
                </div>
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <TypographyPicker
                  presetId={presetId}
                  onPresetChange={setPresetId}
                  value={fontId}
                  onChange={setFontId}
                  jaValue={jaFontId}
                  onJaChange={setJaFontId}
                />
                <div className="flex rounded-lg border border-border bg-card p-1">
                  <Button
                    variant={mode === "light" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setMode("light")}
                  >
                    <Sun data-icon="inline-start" />
                    Light
                  </Button>
                  <Button
                    variant={mode === "dark" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setMode("dark")}
                  >
                    <Moon data-icon="inline-start" />
                    Dark
                  </Button>
                </div>
              </div>
            </div>

            <label className="relative block min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search motif, biome, category, prompt"
                className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
              />
            </label>
            <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:-mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
              <ColorSearch
                value={searchColor}
                role={colorRole}
                onColor={(c) => {
                  setSearchColor(c)
                  if (c) setSort("color")
                }}
                onRole={setColorRole}
              />
              <LabelSelect label="Biome" value={biome} onChange={setBiome} options={["all", ...biomes]} />
              <LabelSelect label="Motif" value={category} onChange={setCategory} options={["all", ...motifCategories]} />
              <LabelSelect
                label="Sort"
                value={sort}
                onChange={(v) => setSort(v as SortKey)}
                options={sortOptions}
              />
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[88rem] px-4 pt-6 sm:px-6 lg:px-8">
          <Intro count={systems.length} />
        </section>

        <section className="mx-auto grid max-w-[88rem] gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[20rem_1fr] lg:px-8">
          <aside className="order-2 max-h-[60svh] space-y-2 overflow-auto rounded-xl border border-border/60 bg-card/40 p-2 backdrop-blur lg:order-1 lg:max-h-[calc(100svh-9rem)] lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:pr-1 lg:sticky lg:top-32 lg:self-start lg:backdrop-blur-none">
            <p className="px-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {filteredSystems.length} system{filteredSystems.length === 1 ? "" : "s"}
            </p>
            {filteredSystems.map((system) => (
              <SystemCard
                key={system.slug}
                system={system}
                active={system.slug === activeSystem.slug}
                onClick={() => setActiveSlug(system.slug)}
              />
            ))}
            <nav aria-label="System detail links" className="sr-only">
              {systems.map((system) => (
                <Link key={system.slug} to="/systems/$slug" params={{ slug: system.slug }}>
                  {system.name}
                </Link>
              ))}
            </nav>
          </aside>

          <div className="order-1 space-y-5 lg:order-2">
            <ActionBar system={activeSystem} mode={mode} font={fontId} jaFont={jaFontId} />
            <Hero system={activeSystem} />

            <BoardSwitcher
              light={activeSystem.assets.board}
              dark={activeSystem.assets.darkBoard}
              initial={mode}
            />

            <ComponentPreview />

            <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-xl border border-border bg-card/85 p-5 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Palette className="size-4 text-primary" />
                    <h2 className="text-lg font-semibold">Palette</h2>
                    {hasOverrides ? (
                      <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                        tuned
                      </span>
                    ) : null}
                  </div>
                  {hasOverrides ? (
                    <Button variant="ghost" size="sm" onClick={resetOverrides}>
                      Reset
                    </Button>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Click a swatch to retune. Edits flow into the page backdrop and the PPTX/DOCX
                  exports, and are remembered per system.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {activeSystem.palette.map((color) => (
                    <EditableSwatch
                      key={color.role}
                      color={color}
                      tuned={Boolean(overrides[color.role])}
                      onChange={(hex) => setOverride(color.role, hex)}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card/85 p-5 backdrop-blur">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="size-4 text-primary" />
                    <h2 className="text-lg font-semibold">Assets</h2>
                  </div>
                  <span className="text-[11px] text-muted-foreground">PNG · downloadable</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <AssetThumb label="Motif" href={activeSystem.assets.motif} />
                  <AssetThumb label="Light board" href={activeSystem.assets.board} />
                  <AssetThumb label="Dark board" href={activeSystem.assets.darkBoard} />
                  {activeSystem.assets.hero ? (
                    <AssetThumb label="Hero" href={activeSystem.assets.hero} />
                  ) : null}
                  {activeSystem.assets.texture ? (
                    <AssetThumb label="Texture" href={activeSystem.assets.texture} />
                  ) : null}
                  {activeSystem.assets.examples.map((example) => (
                    <AssetThumb key={example.id} label={example.label} href={example.image} />
                  ))}
                </div>
              </div>
            </section>

            <TokensPanel system={activeSystem} />

            <section className="rounded-xl border border-border bg-card/85 p-5 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Generation Prompts</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Every motif and board on this page is AI-generated. Prompts are recorded so
                    the catalog stays reproducible.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <a href={activeSystem.assets.promptsJson} download>
                    <Download data-icon="inline-start" />
                    prompts.json
                  </a>
                </Button>
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {activeSystem.prompts.map((prompt) => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
              </div>
            </section>
          </div>
        </section>

        <footer className="mx-auto max-w-[88rem] border-t border-border/60 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground hover:underline">
              Morphous · {systems.length} systems · AI-generated motifs
            </Link>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <a
                href="https://github.com/Ameyanagi/morphos"
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-foreground hover:underline"
              >
                GitHub
              </a>
              <a
                href="https://ameyanagi.com"
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-foreground hover:underline"
              >
                Built by Ameyanagi
              </a>
              <span className="text-muted-foreground/70">MIT or Apache-2.0</span>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="font-medium text-primary hover:underline"
              >
                Back to top ↑
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
    </LightboxContext.Provider>
  )
}

function Intro({ count }: { count: number }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-full border border-border bg-card/85 px-4 py-2 text-sm backdrop-blur">
      <div className="flex items-center gap-2 text-primary">
        <Sparkles className="size-4" />
        <span className="font-semibold">{count} nature-coded design systems</span>
      </div>
      <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
      <span className="text-muted-foreground">
        One motif → palette, shadcn theme, board, PPTX & DOCX. AI-generated, prompts attached.
      </span>
    </div>
  )
}

function ActionBar({
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
  return (
    <section className="rounded-xl border border-primary/30 bg-card p-3 shadow-sm ring-1 ring-primary/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-lg border border-border shadow-inner"
            style={{ background: paletteGradient(system) }}
            aria-hidden
          />
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Download this system
            </p>
            <p className="truncate text-sm font-semibold">{system.name}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button asChild size="sm" title="Download theme.css">
            <a href={system.assets.themeCss} download aria-label="Download theme.css">
              <FileCode2 data-icon="inline-start" />
              <span className="hidden sm:inline">CSS</span>
            </a>
          </Button>
          <Button asChild size="sm" variant="outline" title="Download theme.json">
            <a href={system.assets.themeJson} download aria-label="Download theme.json">
              <Download data-icon="inline-start" />
              <span className="hidden sm:inline">JSON</span>
            </a>
          </Button>
          <Button asChild size="sm" variant="outline" title="Download prompts.json">
            <a href={system.assets.promptsJson} download aria-label="Download prompts.json">
              <Copy data-icon="inline-start" />
              <span className="hidden sm:inline">Prompts</span>
            </a>
          </Button>
          <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden />
          <OfficeDownload system={system} mode={mode} font={font} jaFont={jaFont} />
        </div>
      </div>
    </section>
  )
}

function Hero({ system }: { system: MorphousSystem }) {
  const openLightbox = useLightbox()
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card/85 shadow-sm backdrop-blur">
      <div className="grid lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-5 p-5 sm:p-9">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            <span className="rounded-full border border-border bg-background/70 px-2 py-0.5">
              {system.motifCategory}
            </span>
            <span className="size-1 rounded-full bg-border" aria-hidden />
            <span>{system.biome}</span>
            {system.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="ml-1 normal-case tracking-normal text-foreground/60">
                #{tag}
              </span>
            ))}
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
              {system.name}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7 lg:text-lg">
              {system.description}
            </p>
          </div>

          <div
            className="h-2 w-full max-w-md overflow-hidden rounded-full border border-border"
            style={{ background: paletteGradient(system) }}
            aria-label="Palette stripe"
          />

          <div className="mt-auto grid gap-2 sm:grid-cols-2">
            <Info label="Typography" value={system.typography} />
            <Info label="Layout" value={system.layout} />
          </div>
        </div>

        <div
          className="relative grid min-h-[16rem] place-items-center border-t border-border p-5 sm:min-h-[22rem] sm:p-6 lg:min-h-0 lg:border-l lg:border-t-0"
          style={{
            background: `radial-gradient(circle at 50% 35%, color-mix(in oklch, var(--palette-accent), transparent 70%), transparent 70%), color-mix(in oklch, var(--palette-background), transparent 25%)`,
          }}
        >
          <button
            type="button"
            onClick={() =>
              openLightbox?.({
                src: system.assets.motif,
                alt: `${system.motifName} motif`,
              })
            }
            aria-label={`View full-resolution ${system.motifName} motif`}
            className="cursor-zoom-in"
          >
            <img
              src={previewAssetPath(system.assets.motif)}
              alt={`${system.motifName} motif`}
              className="max-h-[28rem] w-auto object-contain drop-shadow-xl transition hover:scale-[1.02]"
              decoding="async"
              fetchPriority="high"
            />
          </button>
        </div>
      </div>
    </section>
  )
}

function SystemCard({
  system,
  active,
  onClick,
}: {
  system: MorphousSystem
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group block w-full rounded-lg border p-2.5 text-left transition ${
        active
          ? "border-primary bg-sidebar-accent/60 shadow-sm"
          : "border-border bg-card/85 backdrop-blur hover:bg-muted/70"
      }`}
    >
      <div className="grid grid-cols-[3.25rem_1fr] gap-3">
        <img
          src={previewAssetPath(system.assets.motif)}
          alt={`${system.motifName} motif`}
          className="aspect-square rounded-md border border-border bg-background object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="min-w-0">
          <span className="block truncate text-sm font-semibold">{system.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{system.motifName}</span>
          <span className="mt-2 flex h-1.5 overflow-hidden rounded-full">
            {system.palette.slice(0, 8).map((color) => (
              <span
                key={color.role}
                className="flex-1"
                style={{ backgroundColor: color.hex }}
                title={`${color.role}: ${color.hex}`}
              />
            ))}
          </span>
        </div>
      </div>
    </button>
  )
}

function BoardSwitcher({
  light,
  dark,
  initial,
}: {
  light: string
  dark: string
  initial: ThemeMode
}) {
  const [tab, setTab] = useState<ThemeMode>(initial)
  const openLightbox = useLightbox()
  const fullSrc = tab === "light" ? light : dark
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card/85 backdrop-blur">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div>
          <h2 className="text-lg font-semibold">Design-system board</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            AI-generated reference board showing tokens, components, and motif treatment.
          </p>
        </div>
        <div className="flex rounded-lg border border-border bg-card p-1">
          <Button
            size="sm"
            variant={tab === "light" ? "default" : "ghost"}
            onClick={() => setTab("light")}
          >
            <Sun data-icon="inline-start" /> Light
          </Button>
          <Button
            size="sm"
            variant={tab === "dark" ? "default" : "ghost"}
            onClick={() => setTab("dark")}
          >
            <Moon data-icon="inline-start" /> Dark
          </Button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => openLightbox?.({ src: fullSrc, alt: `${tab} system board` })}
        className="block w-full cursor-zoom-in"
        aria-label="View full-resolution board"
      >
        <img
          src={previewAssetPath(fullSrc)}
          alt={`${tab} system board`}
          className="w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </button>
    </section>
  )
}

function ComponentPreview() {
  const [tab, setTab] = useState<"components" | "dashboard" | "settings">("components")
  const [navItem, setNavItem] = useState("Overview")
  const [notify, setNotify] = useState(true)
  const [density, setDensity] = useState(60)

  return (
    <section className="rounded-xl border border-border bg-card/85 backdrop-blur">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">shadcn Component Preview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            All components use the active theme tokens — switch the system and watch them retune.
          </p>
        </div>
        <div className="flex rounded-lg border-2 border-border bg-background p-1 shadow-sm">
          {(
            [
              ["components", "Components"],
              ["dashboard", "Dashboard"],
              ["settings", "Settings"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-pressed={tab === id}
              className={`h-9 cursor-pointer rounded-md px-4 text-sm font-medium transition active:scale-[0.98] ${
                tab === id
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[12rem_1fr]">
        <nav className="border-b border-border bg-sidebar p-3 text-sidebar-foreground lg:border-b-0 lg:border-r">
          {["Overview", "Analytics", "Reports", "Boards", "Settings"].map((item) => {
            const active = navItem === item
            return (
              <button
                key={item}
                type="button"
                onClick={() => setNavItem(item)}
                aria-current={active ? "page" : undefined}
                className={`mb-1 flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                <span>{item}</span>
                {item === "Reports" ? (
                  <span className="rounded-full bg-primary/15 px-1.5 text-[10px] font-medium text-primary">
                    3
                  </span>
                ) : null}
              </button>
            )
          })}
          <div className="mt-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3">
            <p className="text-xs font-medium">Theme tokens</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {tab === "dashboard" ? "primary · accent · chart-1..5" : "input · ring · muted"}
            </p>
          </div>
        </nav>

        <div className="space-y-4 p-5">
          {tab === "components" ? (
            <ComponentsMatrix />
          ) : tab === "dashboard" ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Revenue", value: "¥12.4M", delta: "+8.2%", trend: [4, 5, 4, 6, 7, 6, 8] },
                  { label: "Sessions", value: "45.2K", delta: "+3.1%", trend: [3, 4, 3, 5, 4, 6, 7] },
                  { label: "Conv. rate", value: "92.6%", delta: "−0.4%", trend: [8, 7, 7, 6, 7, 6, 6] },
                ].map((kpi, i) => (
                  <div key={kpi.label} className="rounded-lg border border-border bg-background p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{kpi.label}</span>
                      <span
                        className={`rounded-md px-1.5 text-[10px] font-medium ${
                          kpi.delta.startsWith("+")
                            ? "bg-primary/15 text-primary"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {kpi.delta}
                      </span>
                    </div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight">{kpi.value}</div>
                    <Sparkline values={kpi.trend} colorVar={`var(--chart-${(i % 5) + 1})`} />
                  </div>
                ))}
              </div>

              <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Weekly throughput</h3>
                    <div className="flex gap-1.5 text-[11px] text-muted-foreground">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                        <span key={d} className="w-7 text-center">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex h-32 items-end gap-2">
                    {[45, 72, 58, 86, 64, 93, 74].map((h, i) => (
                      <span
                        key={i}
                        className="flex-1 rounded-t-md transition"
                        style={{
                          height: `${h}%`,
                          backgroundColor: `var(--chart-${(i % 5) + 1})`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-background p-3">
                  <h3 className="text-sm font-semibold">Recent activity</h3>
                  <ul className="mt-3 space-y-2.5">
                    {[
                      { who: "AY", what: "Approved monarch palette", when: "2m" },
                      { who: "RC", what: "Pushed cicada theme.css", when: "14m" },
                      { who: "MK", what: "Drafted koi prompts", when: "1h" },
                    ].map((row) => (
                      <li key={row.who} className="flex items-center gap-3 text-sm">
                        <span className="grid size-7 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                          {row.who}
                        </span>
                        <span className="flex-1 truncate">{row.what}</span>
                        <span className="text-[11px] text-muted-foreground">{row.when}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2">System</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Roles</th>
                      <th className="px-3 py-2 text-right">Coverage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Snow Leopard", "shipped", 8, 100],
                      ["Cicada", "shipped", 8, 96],
                      ["Koi", "review", 8, 88],
                    ].map(([name, status, roles, cov]) => (
                      <tr key={name as string} className="border-b border-border last:border-0">
                        <td className="px-3 py-2 font-medium">{name}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex h-5 items-center rounded-full px-2 text-[10px] font-medium ${
                              status === "shipped"
                                ? "bg-primary/15 text-primary"
                                : "bg-accent/20 text-accent-foreground"
                            }`}
                          >
                            {status as string}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{roles}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${cov}%` }}
                              />
                            </div>
                            <span className="w-9 text-right text-xs text-muted-foreground">
                              {cov}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-lg border border-border bg-background p-4">
                <h3 className="text-sm font-semibold">Profile</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm">
                    Workspace
                    <input
                      className="h-9 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
                      defaultValue="Morphous"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    Plan
                    <select
                      className="h-9 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
                      defaultValue="studio"
                    >
                      <option value="solo">Solo</option>
                      <option value="studio">Studio</option>
                      <option value="atelier">Atelier</option>
                    </select>
                  </label>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-md border border-border bg-card px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">Email notifications</p>
                    <p className="text-[11px] text-muted-foreground">
                      Daily digest of catalog changes.
                    </p>
                  </div>
                  <Switch checked={notify} onChange={setNotify} />
                </div>
                <div className="mt-3 rounded-md border border-border bg-card px-3 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Density</span>
                    <span className="text-muted-foreground">{density}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={density}
                    onChange={(e) => setDensity(Number(e.target.value))}
                    className="mt-2 w-full accent-[var(--primary)]"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <Check className="size-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">Theme synced</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Latest tokens published to shadcn registry · {new Date().toLocaleDateString()}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  View
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge tone="accent">Accent</Badge>
                <Badge tone="muted">Muted</Badge>
                <span className="inline-flex h-7 items-center rounded-md border border-destructive/40 bg-destructive/10 px-2.5 text-xs font-medium text-destructive">
                  Destructive
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function ComponentsMatrix() {
  const [tab, setTab] = useState("overview")
  const [check, setCheck] = useState(true)
  const [radio, setRadio] = useState("light")
  const [toggle, setToggle] = useState("center")
  const [sw, setSw] = useState(true)
  const [val, setVal] = useState(64)

  return (
    <div className="space-y-6">
      <Group title="Buttons" desc="variant × size — bg-primary, bg-secondary, hover.bg-muted, border, ring">
        <div className="flex flex-wrap items-center gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button size="xs">XS</Button>
          <Button size="sm">SM</Button>
          <Button>MD</Button>
          <Button size="lg">LG</Button>
          <Button size="icon" aria-label="icon">
            <Check />
          </Button>
          <Button disabled>Disabled</Button>
          <Button>
            <Download data-icon="inline-start" />
            With icon
          </Button>
        </div>
      </Group>

      <Group title="Inputs" desc="border-input, focus.ring-ring, bg-card">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-xs">
            <span className="text-muted-foreground">Email</span>
            <input
              type="email"
              placeholder="you@morphous.dev"
              className="h-9 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            />
          </label>
          <label className="grid gap-1 text-xs">
            <span className="text-muted-foreground">Plan</span>
            <select
              defaultValue="studio"
              className="h-9 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            >
              <option>Solo</option>
              <option value="studio">Studio</option>
              <option>Atelier</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs">
            <span className="text-muted-foreground">Disabled</span>
            <input
              disabled
              defaultValue="—"
              className="h-9 rounded-lg border border-input bg-muted px-3 text-sm text-muted-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs sm:col-span-3">
            <span className="text-muted-foreground">Description</span>
            <textarea
              rows={3}
              defaultValue="A nature-coded design system."
              className="rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            />
          </label>
        </div>
      </Group>

      <Group title="Selection" desc="checkbox, radio group, toggle group, switch — primary highlights">
        <div className="flex flex-wrap items-center gap-6">
          <Checkbox checked={check} onChange={setCheck} label="Send weekly digest" />
          <RadioGroup
            value={radio}
            onChange={setRadio}
            options={[
              ["light", "Light"],
              ["dark", "Dark"],
              ["auto", "Auto"],
            ]}
          />
          <ToggleGroup
            value={toggle}
            onChange={setToggle}
            options={[
              ["left", "L"],
              ["center", "C"],
              ["right", "R"],
              ["justify", "J"],
            ]}
          />
          <div className="flex items-center gap-2 text-sm">
            <Switch checked={sw} onChange={setSw} />
            <span className="text-muted-foreground">Switch</span>
          </div>
        </div>
      </Group>

      <Group title="Slider & Progress" desc="accent-primary, bg-muted track, primary fill">
        <div className="grid gap-4 sm:grid-cols-[2fr_3fr]">
          <div className="rounded-md border border-border bg-background p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Volume</span>
              <span className="font-medium">{val}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={val}
              onChange={(e) => setVal(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--primary)]"
            />
          </div>
          <div className="space-y-2">
            {[
              ["Indexing", 92, "var(--primary)"],
              ["Sync", 64, "var(--accent)"],
              ["Cleanup", 31, "var(--chart-3)"],
            ].map(([label, pct, color]) => (
              <div key={label as string}>
                <div className="flex items-center justify-between text-xs">
                  <span>{label}</span>
                  <span className="text-muted-foreground">{pct}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct as number}%`, backgroundColor: color as string }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Group>

      <Group title="Badges & Avatars" desc="primary, secondary, accent, muted, destructive · primary fg avatars">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge tone="accent">Accent</Badge>
          <Badge tone="muted">Muted</Badge>
          <span className="inline-flex h-7 items-center rounded-md bg-secondary px-2.5 text-xs font-medium text-secondary-foreground">
            Secondary
          </span>
          <span className="inline-flex h-7 items-center rounded-md border border-destructive/40 bg-destructive/10 px-2.5 text-xs font-medium text-destructive">
            Destructive
          </span>
          <span className="inline-flex h-7 items-center gap-1 rounded-full border border-border bg-background px-2.5 text-xs font-medium">
            <span className="size-1.5 rounded-full bg-primary" /> Online
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {["AY", "RC", "MK", "JS"].map((init, i) => (
            <span
              key={init}
              className="grid size-9 place-items-center rounded-full border-2 border-background text-[11px] font-semibold"
              style={{
                marginLeft: i === 0 ? 0 : -10,
                backgroundColor: `var(--chart-${(i % 5) + 1})`,
                color: "var(--primary-foreground)",
              }}
            >
              {init}
            </span>
          ))}
          <span className="ml-2 grid size-9 place-items-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
            +12
          </span>
        </div>
      </Group>

      <Group title="Tabs" desc="bg-card, primary highlight">
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          {["overview", "activity", "members", "billing"].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`h-7 rounded-md px-3 text-xs font-medium capitalize transition ${
                tab === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Alerts" desc="info → primary, success → primary, warning → accent, destructive">
        <div className="grid gap-3 lg:grid-cols-2">
          <Alert tone="info" title="Heads up" body="Theme will be republished in 5 minutes." />
          <Alert tone="success" title="Saved" body="Palette tuning persisted to this browser." />
          <Alert tone="warning" title="Contrast warning" body="Accent vs surface is below AA." />
          <Alert tone="destructive" title="Delete system?" body="This action cannot be undone." />
        </div>
      </Group>

      <Group title="Cards" desc="bg-card, border, popover, sidebar surfaces">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Card</p>
            <h4 className="mt-1 font-semibold">bg-card</h4>
            <p className="mt-2 text-xs text-muted-foreground">Standard surface for content.</p>
          </div>
          <div className="rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Popover</p>
            <h4 className="mt-1 font-semibold">bg-popover</h4>
            <p className="mt-2 text-xs text-muted-foreground">Floating surfaces, menus, tooltips.</p>
          </div>
          <div className="rounded-lg border border-sidebar-border bg-sidebar p-4 text-sidebar-foreground">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Sidebar</p>
            <h4 className="mt-1 font-semibold">bg-sidebar</h4>
            <p className="mt-2 text-xs text-muted-foreground">Persistent nav background.</p>
          </div>
        </div>
      </Group>

      <Group title="Tooltip & Popover" desc="bg-popover, ring-ring, shadow">
        <div className="flex flex-wrap gap-6">
          <div className="relative">
            <Button variant="outline">Hover target</Button>
            <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md ring-1 ring-border">
              Theme tooltip
            </span>
          </div>
          <div className="rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md">
            <p className="text-xs font-medium">Quick action</p>
            <div className="mt-2 flex gap-2">
              <Button size="xs">Confirm</Button>
              <Button size="xs" variant="ghost">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Group>

      <Group title="Skeleton" desc="bg-muted with pulse">
        <div className="space-y-2">
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </Group>
    </div>
  )
}

function Group({
  title,
  desc,
  children,
}: {
  title: string
  desc?: string
  children: React.ReactNode
}) {
  return (
    <section>
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {desc ? <p className="text-[11px] text-muted-foreground">{desc}</p> : null}
      </header>
      <div className="mt-2 rounded-lg border border-border bg-background p-4">{children}</div>
    </section>
  )
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
      <span
        className={`grid size-4 place-items-center rounded border ${
          checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card"
        }`}
      >
        {checked ? <Check className="size-3" /> : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      {label}
    </label>
  )
}

function RadioGroup({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: Array<[string, string]>
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {options.map(([id, label]) => (
        <label key={id} className="inline-flex cursor-pointer items-center gap-1.5">
          <span
            className={`grid size-4 place-items-center rounded-full border-2 ${
              value === id ? "border-primary" : "border-input"
            }`}
          >
            {value === id ? <span className="size-1.5 rounded-full bg-primary" /> : null}
          </span>
          <input
            type="radio"
            checked={value === id}
            onChange={() => onChange(id)}
            className="sr-only"
          />
          {label}
        </label>
      ))}
    </div>
  )
}

function ToggleGroup({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: Array<[string, string]>
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-card p-1">
      {options.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`h-7 min-w-7 rounded-md px-2 text-xs font-medium transition ${
            value === id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function Alert({
  tone,
  title,
  body,
}: {
  tone: "info" | "success" | "warning" | "destructive"
  title: string
  body: string
}) {
  const styles = {
    info: "border-primary/30 bg-primary/5 text-foreground",
    success: "border-primary/30 bg-primary/5 text-foreground",
    warning: "border-accent/40 bg-accent/10 text-foreground",
    destructive: "border-destructive/40 bg-destructive/10 text-foreground",
  } as const
  const dot = {
    info: "bg-primary",
    success: "bg-primary",
    warning: "bg-accent",
    destructive: "bg-destructive",
  } as const
  return (
    <div className={`flex items-start gap-3 rounded-lg border p-3 ${styles[tone]}`}>
      <span className={`mt-1 size-2 shrink-0 rounded-full ${dot[tone]}`} />
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
      </div>
    </div>
  )
}

function TokensPanel({ system }: { system: MorphousSystem }) {
  const [copied, setCopied] = useState(false)
  const lightCss = blockToCss(":root", system.tokens)
  const darkCss = blockToCss(".dark", system.darkTokens)
  const fullCss = `${lightCss}\n\n${darkCss}\n`

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullCss)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // ignore
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card/85 p-5 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">shadcn Tokens</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Light (<code className="rounded bg-muted px-1 font-mono text-[10px]">:root</code>) and
            dark (<code className="rounded bg-muted px-1 font-mono text-[10px]">.dark</code>) in
            one block — paste into any shadcn project.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button asChild size="sm" variant="outline">
            <a href={system.assets.themeCss} download>
              <FileCode2 data-icon="inline-start" />
              theme.css
            </a>
          </Button>
          <Button size="sm" onClick={onCopy}>
            {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
            {copied ? "Copied" : "Copy all"}
          </Button>
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-background">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Sun className="size-3.5" /> :root
            <span className="text-border">·</span>
            <Moon className="size-3.5" /> .dark
          </span>
          <span className="text-[10px] text-muted-foreground">
            {Object.keys(system.tokens).length * 2} CSS variables
          </span>
        </div>
        <pre className="max-h-[28rem] overflow-auto p-3 text-[11px] leading-5 text-foreground">
          <code>{fullCss}</code>
        </pre>
      </div>
    </section>
  )
}

function blockToCss(selector: string, tokens: Record<string, string>): string {
  const lines = Object.entries(tokens).map(([k, v]) => `  --${k}: ${v};`)
  return `${selector} {\n${lines.join("\n")}\n}`
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 rounded-full border border-border transition ${
        checked ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`absolute top-0.5 size-3.5 rounded-full bg-background shadow transition ${
          checked ? "left-[calc(100%-1.125rem)]" : "left-0.5"
        }`}
      />
    </button>
  )
}

function Sparkline({ values, colorVar }: { values: Array<number>; colorVar: string }) {
  const max = Math.max(...values, 1)
  const w = 100
  const h = 28
  const step = w / (values.length - 1)
  const points = values
    .map((v, i) => `${(i * step).toFixed(2)},${(h - (v / max) * h).toFixed(2)}`)
    .join(" ")
  const area = `0,${h} ${points} ${w},${h}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-7 w-full" preserveAspectRatio="none">
      <polygon points={area} fill={colorVar} fillOpacity="0.15" />
      <polyline points={points} fill="none" stroke={colorVar} strokeWidth="1.5" />
    </svg>
  )
}

const COLOR_PRESETS: Array<{ name: string; hex: string }> = [
  { name: "Red", hex: "#dc2626" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Amber", hex: "#d97706" },
  { name: "Yellow", hex: "#ca8a04" },
  { name: "Lime", hex: "#65a30d" },
  { name: "Green", hex: "#16a34a" },
  { name: "Teal", hex: "#0d9488" },
  { name: "Cyan", hex: "#0891b2" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Indigo", hex: "#4f46e5" },
  { name: "Violet", hex: "#7c3aed" },
  { name: "Pink", hex: "#db2777" },
  { name: "Brown", hex: "#78350f" },
  { name: "Stone", hex: "#78716c" },
  { name: "Slate", hex: "#475569" },
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#f5f5f5" },
  { name: "Cream", hex: "#f5e8c7" },
]

function ColorSearch({
  value,
  role,
  onColor,
  onRole,
}: {
  value: string
  role: ColorRoleKey
  onColor: (hex: string) => void
  onRole: (role: ColorRoleKey) => void
}) {
  const [open, setOpen] = useState(false)
  const active = Boolean(value)
  const activePreset = COLOR_PRESETS.find((p) => p.hex.toLowerCase() === value.toLowerCase())

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest("[data-color-search]")) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onClick)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onClick)
    }
  }, [open])

  return (
    <div
      data-color-search
      className={`relative flex h-10 shrink-0 items-center gap-1 rounded-lg border bg-card pl-1 pr-1 transition ${
        active ? "border-primary" : "border-input"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 items-center gap-1.5 rounded-md px-2 text-sm hover:bg-muted"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Pick color"
      >
        <span
          className={`grid size-5 place-items-center rounded border ${
            active ? "border-primary" : "border-border border-dashed"
          }`}
          style={{ backgroundColor: active ? value : "transparent" }}
          aria-hidden
        >
          {!active ? <Palette className="size-3 text-muted-foreground" /> : null}
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          color
        </span>
        <span className="text-xs text-foreground">
          {active ? activePreset?.name ?? value.toUpperCase() : "any"}
        </span>
      </button>
      <span className="h-5 w-px bg-border" aria-hidden />
      <select
        value={role}
        onChange={(e) => onRole(e.target.value as ColorRoleKey)}
        className="h-9 bg-transparent px-1 text-sm text-foreground outline-none"
        aria-label="Color role to match"
      >
        {colorRoleOptions.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {active ? (
        <button
          type="button"
          onClick={() => onColor("")}
          className="grid size-7 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Clear color filter"
        >
          <X className="size-3.5" />
        </button>
      ) : null}

      {open ? (
        <div
          role="listbox"
          aria-label="Color presets"
          className="absolute left-0 top-full z-50 mt-1 w-[min(16rem,calc(100vw-2rem))] rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-lg"
        >
          <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Sort by closest {role.toLowerCase()} color
          </p>
          <div className="grid grid-cols-6 gap-1.5">
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                role="option"
                aria-selected={p.hex.toLowerCase() === value.toLowerCase()}
                onClick={() => {
                  onColor(p.hex)
                  setOpen(false)
                }}
                title={`${p.name} · ${p.hex.toUpperCase()}`}
                className={`grid aspect-square place-items-center rounded-md border transition hover:scale-110 ${
                  p.hex.toLowerCase() === value.toLowerCase()
                    ? "border-primary ring-2 ring-primary/40"
                    : "border-border hover:border-foreground/50"
                }`}
                style={{ backgroundColor: p.hex }}
              >
                {p.hex.toLowerCase() === value.toLowerCase() ? (
                  <Check className="size-3 text-white drop-shadow" />
                ) : null}
              </button>
            ))}
          </div>
          {active ? (
            <button
              type="button"
              onClick={() => {
                onColor("")
                setOpen(false)
              }}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-xs hover:bg-muted"
            >
              <X className="size-3" /> Clear color filter
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function LabelSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: ReadonlyArray<string>
}) {
  const isDefault = value === "all" || value === "name"
  return (
    <div
      className={`flex h-10 shrink-0 items-center gap-2 rounded-lg border bg-card px-3 transition ${
        isDefault ? "border-input" : "border-primary"
      }`}
    >
      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-full min-w-20 bg-transparent text-sm text-foreground outline-none"
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? "All" : option}
          </option>
        ))}
      </select>
    </div>
  )
}

function EditableSwatch({
  color,
  tuned,
  onChange,
}: {
  color: { role: string; name: string; hex: string; oklch: string }
  tuned: boolean
  onChange: (hex: string) => void
}) {
  const [copied, setCopied] = useState(false)
  const onCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      await navigator.clipboard.writeText(color.hex)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // ignore
    }
  }
  return (
    <div className="grid grid-cols-[2.75rem_1fr] items-center gap-3 rounded-lg border border-border bg-background/60 p-2 transition hover:bg-background">
      <label className="relative block h-12 cursor-pointer">
        <span
          className="block h-full rounded-md border border-border"
          style={{ backgroundColor: color.hex }}
          aria-hidden
        />
        <input
          type="color"
          value={normalizeHex(color.hex)}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
          aria-label={`Tune ${color.role}`}
        />
      </label>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">{color.role}</span>
          {tuned ? (
            <span className="rounded-sm bg-primary/15 px-1 text-[9px] font-medium uppercase tracking-wide text-primary">
              tuned
            </span>
          ) : null}
        </div>
        <span className="block truncate text-xs text-muted-foreground">{color.name}</span>
        <button
          type="button"
          onClick={onCopy}
          className="mt-1 block truncate text-left font-mono text-[11px] text-primary hover:underline"
        >
          {copied ? "copied" : color.hex.toUpperCase()}
        </button>
      </div>
    </div>
  )
}

function normalizeHex(hex: string): string {
  const v = hex.replace("#", "")
  if (v.length === 3) return "#" + v.split("").map((c) => c + c).join("")
  if (v.length === 6) return "#" + v
  return "#000000"
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-sidebar-border bg-background/65 p-3 backdrop-blur">
      <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <p className="mt-1.5 line-clamp-3 text-sm leading-5">{value}</p>
    </div>
  )
}

function PromptCard({
  prompt,
}: {
  prompt: { id: string; label: string; asset: string; prompt: string }
}) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // ignore
    }
  }
  return (
    <article className="rounded-lg border border-border bg-background/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{prompt.label}</h3>
          <a
            href={prompt.asset}
            className="mt-1 inline-block max-w-full truncate rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-primary"
          >
            {prompt.asset.replace(/^\/systems\/[^/]+\//, "./")}
          </a>
        </div>
        <Button variant="ghost" size="xs" onClick={onCopy} aria-label="Copy prompt">
          {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
        </Button>
      </div>
      <p
        className={`mt-3 whitespace-pre-line text-xs leading-5 text-muted-foreground ${
          expanded ? "" : "line-clamp-4"
        }`}
      >
        {prompt.prompt}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 text-[11px] font-medium text-primary hover:underline"
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </article>
  )
}

function AssetThumb({ label, href }: { label: string; href: string }) {
  const openLightbox = useLightbox()
  return (
    <div className="group relative block overflow-hidden rounded-lg border border-border bg-background/70 transition hover:border-primary">
      <button
        type="button"
        onClick={() => openLightbox?.({ src: href, alt: label })}
        title={`View ${label}`}
        className="block w-full cursor-zoom-in text-left"
      >
        <span
          className="relative block aspect-square w-full"
          style={{
            backgroundImage: `linear-gradient(135deg, color-mix(in oklch, var(--palette-surface), transparent 50%), color-mix(in oklch, var(--palette-depth), transparent 70%))`,
          }}
        >
          <img
            src={previewAssetPath(href)}
            alt={label}
            className="absolute inset-0 size-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </span>
        <span className="block truncate px-2.5 py-1.5 text-xs font-medium">{label}</span>
      </button>
      <a
        href={href}
        download
        onClick={(e) => e.stopPropagation()}
        title={`Download ${label}`}
        aria-label={`Download ${label}`}
        className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-md bg-background/80 text-primary opacity-0 backdrop-blur transition group-hover:opacity-100"
      >
        <Download className="size-3.5" />
      </a>
    </div>
  )
}

function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode
  tone?: "default" | "accent" | "muted"
}) {
  const className =
    tone === "accent"
      ? "bg-accent text-accent-foreground"
      : tone === "muted"
        ? "bg-muted text-muted-foreground"
        : "bg-primary text-primary-foreground"
  return (
    <span
      className={`inline-flex h-7 items-center rounded-md px-2.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  )
}
