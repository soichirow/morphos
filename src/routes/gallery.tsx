import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react"
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  Heart,
  Image as ImageIcon,
  Moon,
  Palette,
  Search,
  Share2,
  Shuffle,
  Sparkles,
  Sun,
  X,
} from "lucide-react"

import type { ThemeMode } from "@/lib/morphous-theme"
import type { MorphousSystem } from "@/data/systems"
import { CopyTextButton } from "@/components/copy-text-button"
import { LanguageToggle } from "@/components/language-toggle"
import { Button } from "@/components/ui/button"
import { OfficeDownload } from "@/components/office-download"
import { TypographyPicker } from "@/components/typography-picker"
import { motifCategories, systems } from "@/data/systems"
import {
  translateBiome,
  translateColor,
  translateRole,
  translateSort,
  translateSystemDescription,
  translateTaxonomy,
} from "@/lib/i18n"
import { useLanguage } from "@/lib/i18n-context"
import { paletteGradient, themeStyle } from "@/lib/morphous-theme"
import {
  buildPromptsJson,
  buildThemeCss,
  buildThemeJson,
} from "@/lib/copy-artifacts"
import { PreviewImage } from "@/components/preview-image"
import { colorDistance } from "@/lib/color-distance"
import { useFont } from "@/lib/use-font"
import { usePaletteOverrides } from "@/lib/use-palette-overrides"
import {
  FAVORITES_STORAGE_KEY,
  buildSystemShareUrl,
  parseFavoriteSlugs,
  toggleFavoriteSlug,
} from "@/lib/share-favorites"
import { pickRandomSystemSlug } from "@/lib/random-system"

type GallerySearch = {
  system?: string
  q?: string
  category?: string
  sort?: SortKey
}

type LightboxItem = { src: string; alt: string; downloadName?: string }
const LightboxContext = createContext<((item: LightboxItem) => void) | null>(
  null
)
const FavoritesContext = createContext<{
  slugs: Array<string>
  toggle: (slug: string) => void
}>({ slugs: [], toggle: () => undefined })
const useLightbox = () => use(LightboxContext)

function Lightbox({
  item,
  onClose,
}: {
  item: LightboxItem
  onClose: () => void
}) {
  const { t } = useLanguage()
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
      tabIndex={-1}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose()
      }}
      className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div
        role="presentation"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <img
          src={item.src}
          alt={item.alt}
          className="max-h-[92svh] max-w-[92vw] cursor-default rounded-md object-contain shadow-2xl"
          decoding="async"
        />
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <a
            href={item.src}
            download={item.downloadName}
            className="grid size-9 place-items-center rounded-md bg-background/90 text-foreground shadow hover:bg-background"
            aria-label={t("common.download")}
            title={t("common.download")}
          >
            <Download className="size-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-md bg-background/90 text-foreground shadow hover:bg-background"
            aria-label={t("common.close")}
            title={`${t("common.close")} (Esc)`}
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined
}

export const Route = createFileRoute("/gallery")({
  component: CatalogRoute,
  validateSearch: (search: Record<string, unknown>): GallerySearch => {
    const sortRaw = asString(search.sort)
    const sort = (sortOptions as Array<string>).includes(sortRaw ?? "")
      ? (sortRaw as SortKey)
      : undefined
    return {
      system: asString(search.system),
      q: asString(search.q),
      category: asString(search.category),
      sort,
    }
  },
})

type SortKey = "name" | "motifName" | "color"
type ColorRoleKey = "Primary" | "Accent" | "Background"

const sortOptions: Array<SortKey> = ["name", "motifName", "color"]
const colorRoleOptions: Array<ColorRoleKey> = [
  "Primary",
  "Accent",
  "Background",
]
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const weeklyThroughput = [45, 72, 58, 86, 64, 93, 74].map((height, index) => ({
  day: weekDays[index],
  height,
  colorIndex: (index % 5) + 1,
}))
const dashboardKpis = [
  {
    label: "Revenue",
    value: "¥12.4M",
    delta: "+8.2%",
    trend: [4, 5, 4, 6, 7, 6, 8],
    colorVar: "var(--chart-1)",
  },
  {
    label: "Sessions",
    value: "45.2K",
    delta: "+3.1%",
    trend: [3, 4, 3, 5, 4, 6, 7],
    colorVar: "var(--chart-2)",
  },
  {
    label: "Conv. rate",
    value: "92.6%",
    delta: "−0.4%",
    trend: [8, 7, 7, 6, 7, 6, 6],
    colorVar: "var(--chart-3)",
  },
]
const recentActivity = [
  { who: "AY", what: "Approved monarch palette", when: "2m" },
  { who: "RC", what: "Pushed cicada theme.css", when: "14m" },
  { who: "MK", what: "Drafted koi prompts", when: "1h" },
]
const coverageRows = [
  { name: "Snow Leopard", status: "shipped", roles: 8, coverage: 100 },
  { name: "Cicada", status: "shipped", roles: 8, coverage: 96 },
  { name: "Koi", status: "review", roles: 8, coverage: 88 },
]

type CatalogState = {
  searchColor: string
  colorRole: ColorRoleKey
  mobileResultsOpen: boolean
  mode: ThemeMode
  activeSlug: string
  lightbox: LightboxItem | null
}

type CatalogAction =
  | { type: "setSearchColor"; value: string }
  | { type: "setColorRole"; value: ColorRoleKey }
  | { type: "setMobileResultsOpen"; value: boolean }
  | { type: "setMode"; value: ThemeMode }
  | { type: "setActiveSlug"; value: string }
  | { type: "selectMobileSystem"; value: string }
  | { type: "setLightbox"; value: LightboxItem | null }
  | { type: "clearLocalFilters" }

function catalogReducer(
  state: CatalogState,
  action: CatalogAction
): CatalogState {
  switch (action.type) {
    case "setSearchColor":
      return state.searchColor === action.value
        ? state
        : { ...state, searchColor: action.value }
    case "setColorRole":
      return state.colorRole === action.value
        ? state
        : { ...state, colorRole: action.value }
    case "setMobileResultsOpen":
      return state.mobileResultsOpen === action.value
        ? state
        : { ...state, mobileResultsOpen: action.value }
    case "setMode":
      return state.mode === action.value
        ? state
        : { ...state, mode: action.value }
    case "setActiveSlug":
      return state.activeSlug === action.value
        ? state
        : { ...state, activeSlug: action.value }
    case "selectMobileSystem":
      return {
        ...state,
        activeSlug: action.value,
        mobileResultsOpen: false,
      }
    case "setLightbox":
      return state.lightbox === action.value
        ? state
        : { ...state, lightbox: action.value }
    case "clearLocalFilters":
      return {
        ...state,
        searchColor: "",
        colorRole: "Primary",
        mobileResultsOpen: false,
      }
  }
}

function createCatalogState(activeSlug: string): CatalogState {
  return {
    searchColor: "",
    colorRole: "Primary",
    mobileResultsOpen: false,
    mode: "light",
    activeSlug,
    lightbox: null,
  }
}

function CatalogRoute() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const paramSlug = search.system
  const initialSlug = systems[0]?.slug ?? ""
  const query = search.q ?? ""
  const category = search.category ?? "all"
  const sort: SortKey = search.sort ?? "name"
  const [catalogState, dispatchCatalog] = useReducer(
    catalogReducer,
    initialSlug,
    createCatalogState
  )
  const {
    searchColor,
    colorRole,
    mobileResultsOpen,
    mode,
    activeSlug,
    lightbox,
  } = catalogState
  const [favoriteSlugs, setFavoriteSlugs] = useState<Array<string>>([])
  const [favoritesLoaded, setFavoritesLoaded] = useState(false)
  const previousMobileFilterSignature = useRef("")
  const suppressNextMobileAutoOpen = useRef(false)
  const detailRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setFavoriteSlugs(
      parseFavoriteSlugs(window.localStorage.getItem(FAVORITES_STORAGE_KEY))
    )
    setFavoritesLoaded(true)
  }, [])

  useEffect(() => {
    if (!favoritesLoaded) return
    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(favoriteSlugs)
    )
  }, [favoriteSlugs, favoritesLoaded])

  const toggleFavorite = useCallback((slug: string) => {
    setFavoriteSlugs((current) => toggleFavoriteSlug(current, slug))
  }, [])

  const updateSearch = useCallback(
    (patch: Partial<GallerySearch>) => {
      navigate({
        search: (prev) => {
          const next: GallerySearch = { ...prev, ...patch }
          for (const key of Object.keys(next) as Array<keyof GallerySearch>) {
            const value = next[key]
            if (value === undefined || value === "" || value === "all")
              delete next[key]
          }
          return next
        },
        replace: true,
      })
    },
    [navigate]
  )
  const setQuery = useCallback(
    (value: string) => updateSearch({ q: value || undefined }),
    [updateSearch]
  )
  const setCategory = useCallback(
    (value: string) => updateSearch({ category: value }),
    [updateSearch]
  )
  const setSort = useCallback(
    (value: SortKey) =>
      updateSearch({ sort: value === "name" ? undefined : value }),
    [updateSearch]
  )
  const setSearchColor = useCallback(
    (value: string) => dispatchCatalog({ type: "setSearchColor", value }),
    []
  )
  const setColorRole = useCallback(
    (value: ColorRoleKey) => dispatchCatalog({ type: "setColorRole", value }),
    []
  )
  const setMobileResultsOpen = useCallback(
    (value: boolean) =>
      dispatchCatalog({ type: "setMobileResultsOpen", value }),
    []
  )
  const setMode = useCallback(
    (value: ThemeMode) => dispatchCatalog({ type: "setMode", value }),
    []
  )
  const setLightbox = useCallback(
    (value: LightboxItem | null) =>
      dispatchCatalog({ type: "setLightbox", value }),
    []
  )
  const clearAll = useCallback(() => {
    suppressNextMobileAutoOpen.current = true
    dispatchCatalog({ type: "clearLocalFilters" })
    navigate({
      search: (prev) => ({ system: prev.system }),
      replace: true,
    })
  }, [navigate])
  const hasActiveFilters =
    Boolean(query) ||
    category !== "all" ||
    sort !== "name" ||
    Boolean(searchColor)

  useEffect(() => {
    const requestedSlug =
      new URLSearchParams(window.location.search).get("system") ?? paramSlug

    if (requestedSlug && systems.some((s) => s.slug === requestedSlug)) {
      dispatchCatalog({ type: "setActiveSlug", value: requestedSlug })
    }
  }, [paramSlug])
  const {
    fontId,
    setFontId,
    font,
    jaFontId,
    setJaFontId,
    presetId,
    setPresetId,
  } = useFont()
  const openLightbox = useCallback(
    (item: LightboxItem) =>
      dispatchCatalog({ type: "setLightbox", value: item }),
    []
  )

  const baseSystem =
    systems.find((system) => system.slug === activeSlug) ?? systems[0]
  const {
    tunedSystem: activeSystem,
    overrides,
    hasOverrides,
    setOverride,
    resetOverrides,
  } = usePaletteOverrides(baseSystem)

  const filteredSystems = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const list = systems.filter((system) => {
      const searchText = [
        system.name,
        system.motifName,
        system.motifCategory,
        system.biome,
        system.motif,
        system.description,
        system.tags.join(" "),
        system.searchBlob,
      ]
        .join(" ")
        .toLowerCase()
      if (
        tokens.length > 0 &&
        !tokens.every((token) => searchText.includes(token))
      )
        return false
      if (category !== "all" && system.motifCategory !== category) return false
      return true
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
    return list.slice().sort((a, b) => a[key].localeCompare(b[key]))
  }, [category, colorRole, query, searchColor, sort])
  const mobileFilterSignature = [
    query,
    category,
    sort,
    searchColor,
    colorRole,
  ].join("\u0000")
  const filtersAreDefault =
    !query &&
    category === "all" &&
    sort === "name" &&
    !searchColor &&
    colorRole === "Primary"

  useEffect(() => {
    if (!previousMobileFilterSignature.current) {
      previousMobileFilterSignature.current = mobileFilterSignature
      return
    }
    if (previousMobileFilterSignature.current === mobileFilterSignature) return

    previousMobileFilterSignature.current = mobileFilterSignature
    if (suppressNextMobileAutoOpen.current) {
      setMobileResultsOpen(false)
      if (filtersAreDefault) suppressNextMobileAutoOpen.current = false
      return
    }
    setMobileResultsOpen(true)
  }, [filtersAreDefault, mobileFilterSignature])

  const selectSystem = useCallback(
    (slug: string) => {
      dispatchCatalog({ type: "setActiveSlug", value: slug })
      updateSearch({ system: slug })
    },
    [updateSearch]
  )

  const showRandomSystem = useCallback(() => {
    const pool = filteredSystems.length > 0 ? filteredSystems : systems
    const slug = pickRandomSystemSlug(
      pool.map((system) => system.slug),
      activeSlug
    )

    if (!slug || slug === activeSlug) return
    dispatchCatalog({ type: "selectMobileSystem", value: slug })
    updateSearch({ system: slug })
    window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({
        block: "start",
        behavior: "smooth",
      })
    })
  }, [activeSlug, filteredSystems, updateSearch])

  const selectMobileSystem = useCallback(
    (slug: string) => {
      dispatchCatalog({ type: "selectMobileSystem", value: slug })
      window.requestAnimationFrame(() => {
        updateSearch({ system: slug })
        detailRef.current?.scrollIntoView({
          block: "start",
          behavior: "smooth",
        })
      })
    },
    [updateSearch]
  )

  return (
    <FavoritesContext.Provider
      value={{ slugs: favoriteSlugs, toggle: toggleFavorite }}
    >
      <LightboxContext.Provider value={openLightbox}>
        <div
          className={mode === "dark" ? "dark" : ""}
          style={{ ...themeStyle(activeSystem, mode), fontFamily: font.stack }}
        >
          {lightbox ? (
            <Lightbox item={lightbox} onClose={() => setLightbox(null)} />
          ) : null}
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
            <GalleryHeader
              activeSystem={activeSystem}
              mode={mode}
              onModeChange={setMode}
              presetId={presetId}
              onPresetChange={setPresetId}
              fontId={fontId}
              onFontChange={setFontId}
              jaFontId={jaFontId}
              onJaFontChange={setJaFontId}
              query={query}
              onQueryChange={setQuery}
              searchColor={searchColor}
              colorRole={colorRole}
              onColorChange={(c) => {
                setSearchColor(c)
                if (c) setSort("color")
              }}
              onColorRoleChange={setColorRole}
              category={category}
              onCategoryChange={setCategory}
              sort={sort}
              onSortChange={setSort}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearAll}
              onRandomSystem={showRandomSystem}
            />

            <CatalogContent
              filteredSystems={filteredSystems}
              activeSystem={activeSystem}
              mobileResultsOpen={mobileResultsOpen}
              onMobileResultsOpenChange={setMobileResultsOpen}
              onMobileSelect={selectMobileSystem}
              onClearFilters={clearAll}
              onDesktopSelect={selectSystem}
              detailRef={detailRef}
              mode={mode}
              onModeChange={setMode}
              fontId={fontId}
              jaFontId={jaFontId}
              overrides={overrides}
              hasOverrides={hasOverrides}
              setOverride={setOverride}
              resetOverrides={resetOverrides}
            />

            <CatalogFooter />
          </main>
        </div>
      </LightboxContext.Provider>
    </FavoritesContext.Provider>
  )
}

function CatalogContent({
  filteredSystems,
  activeSystem,
  mobileResultsOpen,
  onMobileResultsOpenChange,
  onMobileSelect,
  onClearFilters,
  onDesktopSelect,
  detailRef,
  mode,
  onModeChange,
  fontId,
  jaFontId,
  overrides,
  hasOverrides,
  setOverride,
  resetOverrides,
}: {
  filteredSystems: Array<MorphousSystem>
  activeSystem: MorphousSystem
  mobileResultsOpen: boolean
  onMobileResultsOpenChange: (open: boolean) => void
  onMobileSelect: (slug: string) => void
  onClearFilters: () => void
  onDesktopSelect: (slug: string) => void
  detailRef: React.RefObject<HTMLDivElement | null>
  mode: ThemeMode
  onModeChange: (mode: ThemeMode) => void
  fontId: string
  jaFontId: string
  overrides: Record<string, string>
  hasOverrides: boolean
  setOverride: (role: string, hex: string) => void
  resetOverrides: () => void
}) {
  const { t } = useLanguage()
  return (
    <>
      <section className="mx-auto max-w-[88rem] px-4 pt-6 sm:px-6 lg:px-8">
        <Intro count={systems.length} />
      </section>

      <section className="mx-auto max-w-[88rem] px-4 pt-3 sm:px-6 lg:hidden">
        <MobileResultsPanel
          results={filteredSystems}
          activeSystem={activeSystem}
          open={mobileResultsOpen}
          onOpenChange={onMobileResultsOpenChange}
          onSelect={onMobileSelect}
          onClearFilters={onClearFilters}
        />
      </section>

      <section className="mx-auto grid max-w-[88rem] gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[20rem_1fr] lg:px-8">
        <aside className="hidden max-h-[calc(100svh-9rem)] space-y-2 overflow-auto pr-1 lg:sticky lg:top-32 lg:block lg:self-start">
          <SystemResultsList
            results={filteredSystems}
            activeSlug={activeSystem.slug}
            onSelect={onDesktopSelect}
            onClearFilters={onClearFilters}
          />
          <nav aria-label={t("gallery.detailLinks")} className="sr-only">
            {systems.map((system) => (
              <Link
                key={system.slug}
                to="/systems/$slug"
                params={{ slug: system.slug }}
              >
                {system.name}
              </Link>
            ))}
          </nav>
        </aside>

        <SystemDetail
          detailRef={detailRef}
          activeSystem={activeSystem}
          mode={mode}
          onModeChange={onModeChange}
          fontId={fontId}
          jaFontId={jaFontId}
          overrides={overrides}
          hasOverrides={hasOverrides}
          setOverride={setOverride}
          resetOverrides={resetOverrides}
        />
      </section>
    </>
  )
}

function CatalogFooter() {
  const { t } = useLanguage()
  return (
    <footer className="mx-auto max-w-[88rem] border-t border-border/60 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground hover:underline">
          {t("landing.footer", { count: systems.length })}
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <a
            href="https://github.com/soichirow/morphos"
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
            {t("common.original")}
          </a>
          <span className="text-muted-foreground/70">MIT or Apache-2.0</span>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="font-medium text-primary hover:underline"
          >
            {t("common.pageTop")}
          </button>
        </div>
      </div>
    </footer>
  )
}

function GalleryHeader({
  activeSystem,
  mode,
  onModeChange,
  presetId,
  onPresetChange,
  fontId,
  onFontChange,
  jaFontId,
  onJaFontChange,
  query,
  onQueryChange,
  searchColor,
  colorRole,
  onColorChange,
  onColorRoleChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  hasActiveFilters,
  onClearFilters,
  onRandomSystem,
}: {
  activeSystem: MorphousSystem
  mode: ThemeMode
  onModeChange: (mode: ThemeMode) => void
  presetId: string
  onPresetChange: (id: string) => void
  fontId: string
  onFontChange: (id: string) => void
  jaFontId: string
  onJaFontChange: (id: string) => void
  query: string
  onQueryChange: (value: string) => void
  searchColor: string
  colorRole: ColorRoleKey
  onColorChange: (color: string) => void
  onColorRoleChange: (role: ColorRoleKey) => void
  category: string
  onCategoryChange: (value: string) => void
  sort: SortKey
  onSortChange: (value: SortKey) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
  onRandomSystem: () => void
}) {
  const { language, t } = useLanguage()
  return (
    <header className="relative z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl lg:sticky lg:top-0">
      <div className="mx-auto flex max-w-[88rem] flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Link
            to="/"
            aria-label={t("gallery.home")}
            className="-m-1 flex items-center gap-3 rounded-lg p-1 transition hover:bg-muted/40"
          >
            <span
              className="grid size-9 place-items-center rounded-lg border border-border bg-card"
              style={{ background: paletteGradient(activeSystem) }}
              aria-hidden
            />
            <div>
              <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                Morphous
              </p>
              <h1 className="text-base font-semibold tracking-tight sm:text-lg">
                {t("gallery.title")}
              </h1>
            </div>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <TypographyPicker
              presetId={presetId}
              onPresetChange={onPresetChange}
              value={fontId}
              onChange={onFontChange}
              jaValue={jaFontId}
              onJaChange={onJaFontChange}
            />
            <LanguageToggle />
            <div className="flex rounded-lg border border-border bg-card p-1">
              <Button
                variant={mode === "light" ? "default" : "ghost"}
                size="sm"
                onClick={() => onModeChange("light")}
              >
                <Sun data-icon="inline-start" />
                {t("common.light")}
              </Button>
              <Button
                variant={mode === "dark" ? "default" : "ghost"}
                size="sm"
                onClick={() => onModeChange("dark")}
              >
                <Moon data-icon="inline-start" />
                {t("common.dark")}
              </Button>
            </div>
          </div>
        </div>

        <label className="relative block min-w-0">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t("gallery.search")}
            className="h-10 w-full rounded-lg border border-input bg-card pr-9 pl-9 text-sm transition outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label={t("gallery.clearSearch")}
              className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRandomSystem}>
            <Shuffle data-icon="inline-start" />
            {t("gallery.randomSystem")}
          </Button>
          <ColorSearch
            value={searchColor}
            role={colorRole}
            onColor={onColorChange}
            onRole={onColorRoleChange}
          />
          <LabelSelect
            label={t("gallery.motifFilter")}
            value={category}
            onChange={onCategoryChange}
            options={["all", ...motifCategories]}
            getOptionLabel={(option) =>
              option === "all"
                ? t("common.all")
                : translateTaxonomy(language, option)
            }
          />
          <LabelSelect
            label={t("gallery.sort")}
            value={sort}
            onChange={(value) => onSortChange(value as SortKey)}
            options={sortOptions}
            getOptionLabel={(option) => translateSort(language, option)}
          />
          {hasActiveFilters ? (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X data-icon="inline-start" />
              {t("gallery.clearFilters")}
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  )
}

function SystemDetail({
  detailRef,
  activeSystem,
  mode,
  onModeChange,
  fontId,
  jaFontId,
  overrides,
  hasOverrides,
  setOverride,
  resetOverrides,
}: {
  detailRef: React.RefObject<HTMLDivElement | null>
  activeSystem: MorphousSystem
  mode: ThemeMode
  onModeChange: (mode: ThemeMode) => void
  fontId: string
  jaFontId: string
  overrides: Record<string, string>
  hasOverrides: boolean
  setOverride: (role: string, hex: string) => void
  resetOverrides: () => void
}) {
  const { t } = useLanguage()
  return (
    <div
      ref={detailRef}
      className="min-w-0 scroll-mt-4 space-y-5 lg:scroll-mt-32"
    >
      <ActionBar
        system={activeSystem}
        mode={mode}
        font={fontId}
        jaFont={jaFontId}
      />
      <Hero system={activeSystem} />

      <BoardSwitcher
        light={activeSystem.assets.board}
        dark={activeSystem.assets.darkBoard}
        mode={mode}
        onModeChange={onModeChange}
      />

      <ComponentPreview />

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-xl border border-border bg-card/85 p-4 backdrop-blur sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Palette className="size-4 text-primary" />
              <h2 className="text-lg font-semibold">{t("gallery.palette")}</h2>
              {hasOverrides ? (
                <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium tracking-wide text-primary uppercase">
                  {t("gallery.tuned")}
                </span>
              ) : null}
            </div>
            {hasOverrides ? (
              <Button variant="ghost" size="sm" onClick={resetOverrides}>
                {t("common.reset")}
              </Button>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("gallery.paletteHelp")}
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

        <div className="rounded-xl border border-border bg-card/85 p-4 backdrop-blur sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="size-4 text-primary" />
              <h2 className="text-lg font-semibold">{t("gallery.assets")}</h2>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {t("gallery.downloadable")}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <AssetThumb
              label={t("gallery.motif")}
              href={activeSystem.assets.motif}
            />
            <AssetThumb
              label={t("gallery.lightBoard")}
              href={activeSystem.assets.board}
            />
            <AssetThumb
              label={t("gallery.darkBoard")}
              href={activeSystem.assets.darkBoard}
            />
            {activeSystem.assets.hero ? (
              <AssetThumb
                label={t("gallery.hero")}
                href={activeSystem.assets.hero}
              />
            ) : null}
            {activeSystem.assets.texture ? (
              <AssetThumb
                label={t("gallery.texture")}
                href={activeSystem.assets.texture}
              />
            ) : null}
            {activeSystem.assets.examples.map((example) => (
              <AssetThumb
                key={example.id}
                label={example.label}
                href={example.image}
              />
            ))}
          </div>
        </div>
      </section>

      <TokensPanel system={activeSystem} />

      <section className="rounded-xl border border-border bg-card/85 p-4 backdrop-blur sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{t("gallery.prompts")}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("gallery.promptsHelp")}
            </p>
          </div>
          <CopyTextButton
            getText={() => buildPromptsJson(activeSystem)}
            title={t("gallery.copyPromptsJson")}
            label="prompts.json"
          />
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {activeSystem.prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </section>
    </div>
  )
}

function Intro({ count }: { count: number }) {
  const { t } = useLanguage()
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-full border border-border bg-card/85 px-4 py-2 text-sm backdrop-blur">
      <div className="flex items-center gap-2 text-primary">
        <Sparkles className="size-4" />
        <span className="font-semibold">
          {t("gallery.introCount", { count })}
        </span>
      </div>
      <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
      <span className="text-muted-foreground">{t("gallery.introBody")}</span>
    </div>
  )
}

function MobileResultsPanel({
  results,
  activeSystem,
  open,
  onOpenChange,
  onSelect,
  onClearFilters,
}: {
  results: Array<MorphousSystem>
  activeSystem: MorphousSystem
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (slug: string) => void
  onClearFilters: () => void
}) {
  const { t } = useLanguage()
  const panelId = "mobile-gallery-results"
  const resultCount = t("gallery.resultCount", { count: results.length })

  return (
    <section className="overflow-hidden rounded-xl border border-border/60 bg-card/85 shadow-sm backdrop-blur">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-16 w-full items-center justify-between gap-3 p-3 text-left transition hover:bg-muted/50"
      >
        <span className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-lg border border-border shadow-inner"
            style={{ background: paletteGradient(activeSystem) }}
            aria-hidden
          />
          <span className="min-w-0">
            <span className="block text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              {resultCount}
            </span>
            <span className="block truncate text-sm font-semibold">
              {open ? t("gallery.chooseSystem") : activeSystem.name}
            </span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 rounded-md border border-border bg-background/70 px-2 py-1 text-xs font-medium text-muted-foreground">
          {open ? t("common.hide") : t("common.open")}
          <ChevronDown
            className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="max-h-[44svh] space-y-2 overflow-auto border-t border-border/60 p-2"
      >
        <SystemResultsList
          results={results}
          activeSlug={activeSystem.slug}
          onSelect={onSelect}
          onClearFilters={onClearFilters}
          showCount={false}
        />
      </div>
    </section>
  )
}

function SystemResultsList({
  results,
  activeSlug,
  onSelect,
  onClearFilters,
  showCount = true,
}: {
  results: Array<MorphousSystem>
  activeSlug: string
  onSelect: (slug: string) => void
  onClearFilters: () => void
  showCount?: boolean
}) {
  const { t } = useLanguage()
  return (
    <>
      {showCount ? (
        <p className="px-1 text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          {t("gallery.resultCount", { count: results.length })}
        </p>
      ) : null}
      {results.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
          <p>{t("gallery.noResults")}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="mt-2 -ml-2"
          >
            {t("gallery.clearFilters")}
          </Button>
        </div>
      ) : null}
      {results.map((system) => (
        <SystemCard
          key={system.slug}
          system={system}
          active={system.slug === activeSlug}
          onClick={() => onSelect(system.slug)}
        />
      ))}
    </>
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
  const { t } = useLanguage()
  const favorites = use(FavoritesContext)
  const [copied, setCopied] = useState(false)
  const isFavorite = favorites.slugs.includes(system.slug)
  const copyShareUrl = useCallback(async () => {
    const shareUrl = buildSystemShareUrl(window.location.href, system.slug)
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }, [system.slug])

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
            <p className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              {t("gallery.systemUse")}
            </p>
            <p className="truncate text-sm font-semibold">{system.name}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            size="sm"
            variant={isFavorite ? "default" : "outline"}
            onClick={() => favorites.toggle(system.slug)}
            aria-pressed={isFavorite}
            title={
              isFavorite
                ? t("gallery.favoriteRemove")
                : t("gallery.favoriteAdd")
            }
          >
            <Heart
              data-icon="inline-start"
              fill={isFavorite ? "currentColor" : "none"}
            />
            <span className="hidden sm:inline">
              {isFavorite ? t("gallery.favoriteSaved") : t("gallery.favorite")}
            </span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={copyShareUrl}
            title={t("gallery.copyUrlTitle")}
          >
            {copied ? (
              <Check data-icon="inline-start" />
            ) : (
              <Share2 data-icon="inline-start" />
            )}
            <span className="hidden sm:inline">
              {copied ? t("common.copied") : t("gallery.copyUrl")}
            </span>
          </Button>
          <span
            className="mx-1 hidden h-5 w-px bg-border sm:block"
            aria-hidden
          />
          <CopyTextButton
            getText={() => buildThemeCss(system)}
            title={t("gallery.copyThemeCss")}
            label="CSS"
            compact
            variant="default"
          />
          <CopyTextButton
            getText={() => buildThemeJson(system)}
            title={t("gallery.copyThemeJson")}
            label="JSON"
            compact
          />
          <CopyTextButton
            getText={() => buildPromptsJson(system)}
            title={t("gallery.copyPromptsJson")}
            label={t("gallery.prompts")}
            compact
          />
          <span
            className="mx-1 hidden h-5 w-px bg-border sm:block"
            aria-hidden
          />
          <OfficeDownload
            system={system}
            mode={mode}
            font={font}
            jaFont={jaFont}
          />
        </div>
      </div>
    </section>
  )
}

function Hero({ system }: { system: MorphousSystem }) {
  const { language, t } = useLanguage()
  const openLightbox = useLightbox()
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card/85 shadow-sm backdrop-blur">
      <div className="grid lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-5 p-5 sm:p-9">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            <span className="rounded-full border border-border bg-background/70 px-2 py-0.5">
              {translateTaxonomy(language, system.motifCategory)}
            </span>
            <span className="size-1 rounded-full bg-border" aria-hidden />
            <span>{translateBiome(language, system.biome)}</span>
            {system.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="ml-1 tracking-normal text-foreground/60 normal-case"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl leading-[1.05] font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {system.name}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7 lg:text-lg">
              {translateSystemDescription(
                language,
                system.slug,
                system.description
              )}
            </p>
          </div>

          <div
            className="h-2 w-full max-w-md overflow-hidden rounded-full border border-border"
            style={{ background: paletteGradient(system) }}
            aria-label={t("gallery.paletteStripe")}
          />

          <div className="mt-auto grid gap-2 sm:grid-cols-2">
            <Info label={t("gallery.typography")} value={system.typography} />
            <Info label={t("gallery.layout")} value={system.layout} />
          </div>
        </div>

        <div
          className="relative grid min-h-[16rem] place-items-center border-t border-border p-5 sm:min-h-[22rem] sm:p-6 lg:min-h-0 lg:border-t-0 lg:border-l"
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
            aria-label={t("gallery.fullMotif", { name: system.motifName })}
            className="cursor-zoom-in"
          >
            <PreviewImage
              src={system.assets.motif}
              alt={`${system.motifName} motif`}
              kind="motif"
              className="max-h-[28rem] w-auto object-contain drop-shadow-xl transition hover:scale-[1.02]"
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 768px) 90vw, 640px"
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
        <PreviewImage
          src={system.assets.motif}
          alt={`${system.motifName} motif`}
          kind="motif"
          className="aspect-square rounded-md border border-border bg-background object-cover"
          loading="lazy"
          sizes="52px"
        />
        <div className="min-w-0">
          <span className="block truncate text-sm font-semibold">
            {system.name}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {system.motifName}
          </span>
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
  mode,
  onModeChange,
}: {
  light: string
  dark: string
  mode: ThemeMode
  onModeChange: (mode: ThemeMode) => void
}) {
  const { t } = useLanguage()
  const openLightbox = useLightbox()
  const fullSrc = mode === "light" ? light : dark
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card/85 backdrop-blur">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div>
          <h2 className="text-lg font-semibold">{t("gallery.board")}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("gallery.boardHelp")}
          </p>
        </div>
        <div className="flex rounded-lg border border-border bg-card p-1">
          <Button
            size="sm"
            variant={mode === "light" ? "default" : "ghost"}
            onClick={() => onModeChange("light")}
          >
            <Sun data-icon="inline-start" /> {t("common.light")}
          </Button>
          <Button
            size="sm"
            variant={mode === "dark" ? "default" : "ghost"}
            onClick={() => onModeChange("dark")}
          >
            <Moon data-icon="inline-start" /> {t("common.dark")}
          </Button>
        </div>
      </div>
      <button
        type="button"
        onClick={() =>
          openLightbox?.({ src: fullSrc, alt: `${mode} system board` })
        }
        className="block w-full cursor-zoom-in"
        aria-label={t("gallery.viewBoard")}
      >
        <PreviewImage
          src={fullSrc}
          alt={`${mode} system board`}
          kind="board"
          className="w-full object-cover"
          loading="lazy"
          sizes="(max-width: 1024px) 100vw, 720px"
        />
      </button>
    </section>
  )
}

function ComponentPreview() {
  const [tab, setTab] = useState<"components" | "dashboard" | "settings">(
    "components"
  )
  const { t } = useLanguage()
  const [navItem, setNavItem] = useState("Overview")
  const [notify, setNotify] = useState(true)
  const [density, setDensity] = useState(60)

  return (
    <section className="rounded-xl border border-border bg-card/85 backdrop-blur">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h2 className="text-lg font-semibold">
            {t("gallery.componentPreview")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("gallery.componentHelp")}
          </p>
        </div>
        <div className="flex shrink-0 self-start rounded-lg border-2 border-border bg-background p-1 shadow-sm">
          {(
            [
              ["components", t("gallery.components")],
              ["dashboard", t("gallery.dashboard")],
              ["settings", t("gallery.settings")],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-pressed={tab === id}
              className={`h-9 cursor-pointer rounded-md px-2.5 text-sm font-medium transition active:scale-[0.98] sm:px-4 ${
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
        <nav className="border-b border-border bg-sidebar p-3 text-sidebar-foreground lg:border-r lg:border-b-0">
          {["Overview", "Analytics", "Reports", "Boards", "Settings"].map(
            (item) => {
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
                  <span>
                    {t(`gallery.${item.toLowerCase()}` as "gallery.overview")}
                  </span>
                  {item === "Reports" ? (
                    <span className="rounded-full bg-primary/15 px-1.5 text-[10px] font-medium text-primary">
                      3
                    </span>
                  ) : null}
                </button>
              )
            }
          )}
          <div className="mt-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3">
            <p className="text-xs font-medium">{t("gallery.themeTokens")}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {tab === "dashboard"
                ? "primary · accent · chart-1..5"
                : "input · ring · muted"}
            </p>
          </div>
        </nav>

        <div className="min-w-0 space-y-4 p-4 sm:p-5">
          {tab === "components" ? (
            <ComponentsMatrix />
          ) : tab === "dashboard" ? (
            <DashboardPreview />
          ) : (
            <SettingsPreview
              notify={notify}
              onNotifyChange={setNotify}
              density={density}
              onDensityChange={setDensity}
            />
          )}
        </div>
      </div>
    </section>
  )
}

function DashboardPreview() {
  const { t } = useLanguage()
  const days = [
    t("gallery.mon"),
    t("gallery.tue"),
    t("gallery.wed"),
    t("gallery.thu"),
    t("gallery.fri"),
    t("gallery.sat"),
    t("gallery.sun"),
  ]
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        {dashboardKpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-lg border border-border bg-background p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {kpi.label === "Revenue"
                  ? t("gallery.revenue")
                  : kpi.label === "Sessions"
                    ? t("gallery.sessions")
                    : t("gallery.conversion")}
              </span>
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
            <div className="mt-2 text-2xl font-semibold tracking-tight">
              {kpi.value}
            </div>
            <Sparkline values={kpi.trend} colorVar={kpi.colorVar} />
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-sm font-semibold">
              {t("gallery.weeklyThroughput")}
            </h3>
            <div className="hidden gap-1.5 text-[11px] text-muted-foreground sm:flex">
              {days.map((d) => (
                <span key={d} className="w-7 text-center">
                  {d}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-3 flex h-32 items-end gap-2">
            {weeklyThroughput.map((bar) => (
              <span
                key={bar.day}
                className="flex-1 rounded-t-md transition"
                style={{
                  height: `${bar.height}%`,
                  backgroundColor: `var(--chart-${bar.colorIndex})`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-3">
          <h3 className="text-sm font-semibold">
            {t("gallery.recentActivity")}
          </h3>
          <ul className="mt-3 space-y-2.5">
            {recentActivity.map((row) => (
              <li key={row.who} className="flex items-center gap-3 text-sm">
                <span className="grid size-7 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {row.who}
                </span>
                <span className="flex-1 truncate">
                  {row.what === "Approved monarch palette"
                    ? t("gallery.activityApproved")
                    : row.what === "Pushed cicada theme.css"
                      ? t("gallery.activityPushed")
                      : t("gallery.activityDrafted")}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {row.when}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-background">
        <table className="w-full min-w-[28rem] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              <th className="px-3 py-2">{t("gallery.system")}</th>
              <th className="px-3 py-2">{t("gallery.status")}</th>
              <th className="px-3 py-2">{t("gallery.roles")}</th>
              <th className="px-3 py-2 text-right">{t("gallery.coverage")}</th>
            </tr>
          </thead>
          <tbody>
            {coverageRows.map((row) => (
              <tr
                key={row.name}
                className="border-b border-border last:border-0"
              >
                <td className="px-3 py-2 font-medium">
                  {row.name === "Snow Leopard"
                    ? t("gallery.snowLeopard")
                    : row.name === "Cicada"
                      ? t("gallery.cicada")
                      : t("gallery.koi")}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex h-5 items-center rounded-full px-2 text-[10px] font-medium ${
                      row.status === "shipped"
                        ? "bg-primary/15 text-primary"
                        : "bg-accent/20 text-accent-foreground"
                    }`}
                  >
                    {row.status === "shipped"
                      ? t("gallery.shipped")
                      : t("gallery.review")}
                  </span>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{row.roles}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${row.coverage}%` }}
                      />
                    </div>
                    <span className="w-9 text-right text-xs text-muted-foreground">
                      {row.coverage}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function SettingsPreview({
  notify,
  onNotifyChange,
  density,
  onDensityChange,
}: {
  notify: boolean
  onNotifyChange: (value: boolean) => void
  density: number
  onDensityChange: (value: number) => void
}) {
  const { t } = useLanguage()
  return (
    <>
      <div className="rounded-lg border border-border bg-background p-4">
        <h3 className="text-sm font-semibold">{t("gallery.profile")}</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            {t("gallery.workspace")}
            <input
              className="h-9 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
              defaultValue="Morphous"
            />
          </label>
          <label className="grid gap-1 text-sm">
            {t("gallery.plan")}
            <select
              className="h-9 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
              defaultValue="studio"
            >
              <option value="solo">{t("gallery.solo")}</option>
              <option value="studio">{t("gallery.studio")}</option>
              <option value="atelier">{t("gallery.atelier")}</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-md border border-border bg-card px-3 py-2">
          <div>
            <p className="text-sm font-medium">
              {t("gallery.emailNotifications")}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {t("gallery.dailyDigest")}
            </p>
          </div>
          <Switch checked={notify} onChange={onNotifyChange} />
        </div>
        <div className="mt-3 rounded-md border border-border bg-card p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{t("gallery.density")}</span>
            <span className="text-muted-foreground">{density}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={density}
            onChange={(e) => onDensityChange(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--primary)]"
          />
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
          <Check className="size-4" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium">{t("gallery.themeSynced")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("gallery.latestTokens")}
          </p>
        </div>
        <Button size="sm" variant="outline">
          {t("common.view")}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge>{t("gallery.default")}</Badge>
        <Badge tone="accent">{t("gallery.accent")}</Badge>
        <Badge tone="muted">{t("gallery.muted")}</Badge>
        <span className="inline-flex h-7 items-center rounded-md border border-destructive/40 bg-destructive/10 px-2.5 text-xs font-medium text-destructive">
          {t("gallery.destructive")}
        </span>
      </div>
    </>
  )
}

type ComponentsMatrixState = {
  tab: string
  check: boolean
  radio: string
  toggle: string
  sw: boolean
  val: number
}

type ComponentsMatrixAction =
  | { type: "setTab"; value: string }
  | { type: "setCheck"; value: boolean }
  | { type: "setRadio"; value: string }
  | { type: "setToggle"; value: string }
  | { type: "setSwitch"; value: boolean }
  | { type: "setValue"; value: number }

const initialComponentsMatrixState: ComponentsMatrixState = {
  tab: "overview",
  check: true,
  radio: "light",
  toggle: "center",
  sw: true,
  val: 64,
}

function componentsMatrixReducer(
  state: ComponentsMatrixState,
  action: ComponentsMatrixAction
): ComponentsMatrixState {
  switch (action.type) {
    case "setTab":
      return state.tab === action.value
        ? state
        : { ...state, tab: action.value }
    case "setCheck":
      return state.check === action.value
        ? state
        : { ...state, check: action.value }
    case "setRadio":
      return state.radio === action.value
        ? state
        : { ...state, radio: action.value }
    case "setToggle":
      return state.toggle === action.value
        ? state
        : { ...state, toggle: action.value }
    case "setSwitch":
      return state.sw === action.value ? state : { ...state, sw: action.value }
    case "setValue":
      return state.val === action.value
        ? state
        : { ...state, val: action.value }
  }
}

function ComponentsMatrix() {
  const { t } = useLanguage()
  const [{ tab, check, radio, toggle, sw, val }, dispatch] = useReducer(
    componentsMatrixReducer,
    initialComponentsMatrixState
  )

  return (
    <div className="space-y-6">
      <Group
        title={t("gallery.buttons")}
        desc="variant x size: bg-primary, bg-secondary, hover.bg-muted, border, ring"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button>{t("gallery.primaryButton")}</Button>
          <Button variant="secondary">{t("gallery.secondaryButton")}</Button>
          <Button variant="outline">{t("gallery.outlineButton")}</Button>
          <Button variant="ghost">{t("gallery.ghostButton")}</Button>
          <Button variant="link">{t("gallery.linkButton")}</Button>
          <Button variant="destructive">{t("gallery.destructive")}</Button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button size="xs">XS</Button>
          <Button size="sm">SM</Button>
          <Button>MD</Button>
          <Button size="lg">LG</Button>
          <Button size="icon" aria-label={t("gallery.icon")}>
            <Check />
          </Button>
          <Button disabled>{t("gallery.disabled")}</Button>
          <Button>
            <Download data-icon="inline-start" />
            {t("gallery.withIcon")}
          </Button>
        </div>
      </Group>

      <Group
        title={t("gallery.inputs")}
        desc="border-input, focus.ring-ring, bg-card"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-xs">
            <span className="text-muted-foreground">{t("gallery.email")}</span>
            <input
              type="email"
              placeholder="you@morphous.dev"
              className="h-9 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            />
          </label>
          <label className="grid gap-1 text-xs">
            <span className="text-muted-foreground">{t("gallery.plan")}</span>
            <select
              defaultValue="studio"
              className="h-9 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            >
              <option>{t("gallery.solo")}</option>
              <option value="studio">{t("gallery.studio")}</option>
              <option>{t("gallery.atelier")}</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs">
            <span className="text-muted-foreground">
              {t("gallery.disabled")}
            </span>
            <input
              disabled
              defaultValue="-"
              className="h-9 rounded-lg border border-input bg-muted px-3 text-sm text-muted-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs sm:col-span-3">
            <span className="text-muted-foreground">
              {t("gallery.description")}
            </span>
            <textarea
              rows={3}
              defaultValue={t("gallery.sampleDescription")}
              className="rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
            />
          </label>
        </div>
      </Group>

      <Group
        title={t("gallery.selection")}
        desc="checkbox, radio group, toggle group, switch: primary highlights"
      >
        <div className="flex flex-wrap items-center gap-6">
          <Checkbox
            checked={check}
            onChange={(value) => dispatch({ type: "setCheck", value })}
            label={t("gallery.weeklyDigest")}
          />
          <RadioGroup
            value={radio}
            onChange={(value) => dispatch({ type: "setRadio", value })}
            options={[
              ["light", t("common.light")],
              ["dark", t("common.dark")],
              ["auto", t("gallery.auto")],
            ]}
          />
          <ToggleGroup
            value={toggle}
            onChange={(value) => dispatch({ type: "setToggle", value })}
            options={[
              ["left", "L"],
              ["center", "C"],
              ["right", "R"],
              ["justify", "J"],
            ]}
          />
          <div className="flex items-center gap-2 text-sm">
            <Switch
              checked={sw}
              onChange={(value) => dispatch({ type: "setSwitch", value })}
            />
            <span className="text-muted-foreground">{t("gallery.switch")}</span>
          </div>
        </div>
      </Group>

      <Group
        title={t("gallery.sliderProgress")}
        desc="accent-primary, bg-muted track, primary fill"
      >
        <div className="grid gap-4 sm:grid-cols-[2fr_3fr]">
          <div className="rounded-md border border-border bg-background p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {t("gallery.volume")}
              </span>
              <span className="font-medium">{val}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={val}
              onChange={(e) =>
                dispatch({ type: "setValue", value: Number(e.target.value) })
              }
              className="mt-2 w-full accent-[var(--primary)]"
            />
          </div>
          <div className="space-y-2">
            {[
              [t("gallery.indexing"), 92, "var(--primary)"],
              [t("gallery.sync"), 64, "var(--accent)"],
              [t("gallery.cleanup"), 31, "var(--chart-3)"],
            ].map(([label, pct, color]) => (
              <div key={label as string}>
                <div className="flex items-center justify-between text-xs">
                  <span>{label}</span>
                  <span className="text-muted-foreground">{pct}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct as number}%`,
                      backgroundColor: color as string,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Group>

      <Group
        title={t("gallery.badgesAvatars")}
        desc="primary, secondary, accent, muted, destructive · primary fg avatars"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{t("gallery.default")}</Badge>
          <Badge tone="accent">{t("gallery.accent")}</Badge>
          <Badge tone="muted">{t("gallery.muted")}</Badge>
          <span className="inline-flex h-7 items-center rounded-md bg-secondary px-2.5 text-xs font-medium text-secondary-foreground">
            {t("gallery.secondary")}
          </span>
          <span className="inline-flex h-7 items-center rounded-md border border-destructive/40 bg-destructive/10 px-2.5 text-xs font-medium text-destructive">
            {t("gallery.destructive")}
          </span>
          <span className="inline-flex h-7 items-center gap-1 rounded-full border border-border bg-background px-2.5 text-xs font-medium">
            <span className="size-1.5 rounded-full bg-primary" />{" "}
            {t("gallery.online")}
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

      <Group title={t("gallery.tabs")} desc="bg-card, primary highlight">
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          {["overview", "activity", "members", "billing"].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => dispatch({ type: "setTab", value: id })}
              className={`h-7 rounded-md px-3 text-xs font-medium capitalize transition ${
                tab === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {id === "overview"
                ? t("gallery.overview")
                : id === "activity"
                  ? t("gallery.activity")
                  : id === "members"
                    ? t("gallery.members")
                    : t("gallery.billing")}
            </button>
          ))}
        </div>
      </Group>

      <Group
        title={t("gallery.alerts")}
        desc="info → primary, success → primary, warning → accent, destructive"
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Alert
            tone="info"
            title={t("gallery.headsUp")}
            body={t("gallery.republishBody")}
          />
          <Alert
            tone="success"
            title={t("gallery.saved")}
            body={t("gallery.savedBody")}
          />
          <Alert
            tone="warning"
            title={t("gallery.contrastWarning")}
            body={t("gallery.contrastBody")}
          />
          <Alert
            tone="destructive"
            title={t("gallery.deleteSystem")}
            body={t("gallery.deleteBody")}
          />
        </div>
      </Group>

      <SurfacePreviewGroups />
    </div>
  )
}

function SurfacePreviewGroups() {
  const { t } = useLanguage()
  return (
    <>
      <Group
        title={t("gallery.cards")}
        desc="bg-card, border, popover, sidebar surfaces"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              {t("gallery.card")}
            </p>
            <h4 className="mt-1 font-semibold">bg-card</h4>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("gallery.cardBody")}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              {t("gallery.popover")}
            </p>
            <h4 className="mt-1 font-semibold">bg-popover</h4>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("gallery.popoverBody")}
            </p>
          </div>
          <div className="rounded-lg border border-sidebar-border bg-sidebar p-4 text-sidebar-foreground">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              {t("gallery.sidebar")}
            </p>
            <h4 className="mt-1 font-semibold">bg-sidebar</h4>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("gallery.sidebarBody")}
            </p>
          </div>
        </div>
      </Group>

      <Group
        title={t("gallery.tooltipPopover")}
        desc="bg-popover, ring-ring, shadow"
      >
        <div className="flex flex-wrap gap-6">
          <div className="relative">
            <Button variant="outline">{t("gallery.hoverTarget")}</Button>
            <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-md ring-1 ring-border">
              {t("gallery.themeTooltip")}
            </span>
          </div>
          <div className="rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md">
            <p className="text-xs font-medium">{t("gallery.quickAction")}</p>
            <div className="mt-2 flex gap-2">
              <Button size="xs">{t("gallery.confirm")}</Button>
              <Button size="xs" variant="ghost">
                {t("gallery.cancel")}
              </Button>
            </div>
          </div>
        </div>
      </Group>

      <Group title={t("gallery.skeleton")} desc="bg-muted with pulse">
        <div className="space-y-2">
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </Group>
    </>
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
        {desc ? (
          <p className="text-[11px] text-muted-foreground">{desc}</p>
        ) : null}
      </header>
      <div className="mt-2 rounded-lg border border-border bg-background p-4">
        {children}
      </div>
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
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input bg-card"
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
        <label
          key={id}
          className="inline-flex cursor-pointer items-center gap-1.5"
        >
          <span
            className={`grid size-4 place-items-center rounded-full border-2 ${
              value === id ? "border-primary" : "border-input"
            }`}
          >
            {value === id ? (
              <span className="size-1.5 rounded-full bg-primary" />
            ) : null}
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
    <div
      className={`flex items-start gap-3 rounded-lg border p-3 ${styles[tone]}`}
    >
      <span className={`mt-1 size-2 shrink-0 rounded-full ${dot[tone]}`} />
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
      </div>
    </div>
  )
}

function TokensPanel({ system }: { system: MorphousSystem }) {
  const { t } = useLanguage()
  const fullCss = buildThemeCss(system)

  return (
    <section className="rounded-xl border border-border bg-card/85 p-4 backdrop-blur sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{t("gallery.tokens")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("gallery.tokensHelp")}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <CopyTextButton
            getText={() => fullCss}
            title={t("gallery.copyThemeCss")}
            label={t("common.copyAll")}
            variant="default"
          />
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
            {Object.keys(system.tokens).length * 2} {t("gallery.cssVariables")}
          </span>
        </div>
        <pre className="max-h-[28rem] overflow-auto p-3 text-[11px] leading-5 text-foreground">
          <code>{fullCss}</code>
        </pre>
      </div>
    </section>
  )
}
function Switch({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
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

function Sparkline({
  values,
  colorVar,
}: {
  values: Array<number>
  colorVar: string
}) {
  const max = Math.max(...values, 1)
  const w = 100
  const h = 28
  const step = w / (values.length - 1)
  const points = values
    .map((v, i) => `${(i * step).toFixed(2)},${(h - (v / max) * h).toFixed(2)}`)
    .join(" ")
  const area = `0,${h} ${points} ${w},${h}`
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="mt-2 h-7 w-full"
      preserveAspectRatio="none"
    >
      <polygon points={area} fill={colorVar} fillOpacity="0.15" />
      <polyline
        points={points}
        fill="none"
        stroke={colorVar}
        strokeWidth="1.5"
      />
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
  const { language, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const active = Boolean(value)
  const activePreset = COLOR_PRESETS.find(
    (p) => p.hex.toLowerCase() === value.toLowerCase()
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest("[data-color-search]")) setOpen(false)
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
      className={`relative flex h-10 shrink-0 items-center gap-1 rounded-lg border bg-card pr-1 pl-1 transition ${
        active ? "border-primary" : "border-input"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 items-center gap-1.5 rounded-md px-2 text-sm hover:bg-muted"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("gallery.pickColor")}
      >
        <span
          className={`grid size-5 place-items-center rounded border ${
            active ? "border-primary" : "border-dashed border-border"
          }`}
          style={{ backgroundColor: active ? value : "transparent" }}
          aria-hidden
        >
          {!active ? (
            <Palette className="size-3 text-muted-foreground" />
          ) : null}
        </span>
        <span className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
          {t("gallery.color")}
        </span>
        <span className="text-xs text-foreground">
          {active
            ? activePreset
              ? translateColor(language, activePreset.name)
              : value.toUpperCase()
            : t("gallery.anyColor")}
        </span>
      </button>
      <span className="h-5 w-px bg-border" aria-hidden />
      <select
        value={role}
        onChange={(e) => onRole(e.target.value as ColorRoleKey)}
        className="h-9 bg-transparent px-1 text-sm text-foreground outline-none"
        aria-label={t("gallery.colorRole")}
      >
        {colorRoleOptions.map((r) => (
          <option key={r} value={r}>
            {translateRole(language, r)}
          </option>
        ))}
      </select>
      {active ? (
        <button
          type="button"
          onClick={() => onColor("")}
          className="grid size-7 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={t("gallery.clearColor")}
        >
          <X className="size-3.5" />
        </button>
      ) : null}

      {open ? (
        <div
          role="listbox"
          aria-label={t("gallery.colorPresets")}
          className="absolute top-full left-0 z-50 mt-1 w-[min(16rem,calc(100vw-2rem))] rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-lg"
        >
          <p className="mb-2 px-1 text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            {t("gallery.sortClosest", { role: translateRole(language, role) })}
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
                title={`${translateColor(language, p.name)} · ${p.hex.toUpperCase()}`}
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
              <X className="size-3" /> {t("gallery.clearColor")}
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
  getOptionLabel = (option) => (option === "all" ? "All" : option),
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: ReadonlyArray<string>
  getOptionLabel?: (option: string) => string
}) {
  const isDefault = value === "all" || value === "name"
  return (
    <div
      className={`flex h-10 shrink-0 items-center gap-2 rounded-lg border bg-card px-3 transition ${
        isDefault ? "border-input" : "border-primary"
      }`}
    >
      <span className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
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
            {getOptionLabel(option)}
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
  const { language, t } = useLanguage()
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
          aria-label={t("gallery.tuneRole", {
            role: translateRole(language, color.role),
          })}
        />
      </label>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">
            {translateRole(language, color.role)}
          </span>
          {tuned ? (
            <span className="rounded-sm bg-primary/15 px-1 text-[9px] font-medium tracking-wide text-primary uppercase">
              tuned
            </span>
          ) : null}
        </div>
        <span className="block truncate text-xs text-muted-foreground">
          {color.name}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="mt-1 block truncate text-left font-mono text-[11px] text-primary hover:underline"
        >
          {copied ? t("common.copied") : color.hex.toUpperCase()}
        </button>
      </div>
    </div>
  )
}

function normalizeHex(hex: string): string {
  const v = hex.replace("#", "")
  if (v.length === 3)
    return (
      "#" +
      v
        .split("")
        .map((c) => c + c)
        .join("")
    )
  if (v.length === 6) return "#" + v
  return "#000000"
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-sidebar-border bg-background/65 p-3 backdrop-blur">
      <div className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
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
  const { t } = useLanguage()
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
        <Button
          variant="ghost"
          size="xs"
          onClick={onCopy}
          aria-label={t("gallery.copyPrompt")}
        >
          {copied ? (
            <Check className="size-3.5 text-primary" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
      </div>
      <p
        className={`mt-3 text-xs leading-5 whitespace-pre-line text-muted-foreground ${
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
        {expanded ? t("common.showLess") : t("common.showMore")}
      </button>
    </article>
  )
}

function AssetThumb({ label, href }: { label: string; href: string }) {
  const { t } = useLanguage()
  const openLightbox = useLightbox()
  return (
    <div className="group relative block overflow-hidden rounded-lg border border-border bg-background/70 transition hover:border-primary">
      <button
        type="button"
        onClick={() => openLightbox?.({ src: href, alt: label })}
        title={t("gallery.viewAsset", { label })}
        className="block w-full cursor-zoom-in text-left"
      >
        <span
          className="relative block aspect-square w-full"
          style={{
            backgroundImage: `linear-gradient(135deg, color-mix(in oklch, var(--palette-surface), transparent 50%), color-mix(in oklch, var(--palette-depth), transparent 70%))`,
          }}
        >
          <PreviewImage
            src={href}
            alt={label}
            className="absolute inset-0 size-full object-cover"
            loading="lazy"
            sizes="(max-width: 768px) 50vw, 240px"
          />
        </span>
        <span className="block truncate px-2.5 py-1.5 text-xs font-medium">
          {label}
        </span>
      </button>
      <a
        href={href}
        download
        onClick={(e) => e.stopPropagation()}
        title={t("gallery.downloadAsset", { label })}
        aria-label={t("gallery.downloadAsset", { label })}
        className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-md bg-background/80 text-primary opacity-0 backdrop-blur transition group-hover:opacity-100"
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
