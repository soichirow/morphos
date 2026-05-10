import { useState, useSyncExternalStore } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import {
  ArrowRight,
  FileCode2,
  FileText,
  Globe,
  Palette,
  Presentation,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { systems } from "@/data/systems"
import { PreviewImage } from "@/components/preview-image"
import { paletteGradient, themeStyle } from "@/lib/morphous-theme"

export const Route = createFileRoute("/")({ component: LandingRoute })

const FEATURE_COUNT = 8

// Stable initial set for SSR. The client snapshot is randomized once per visit
// without breaking hydration.
const INITIAL_POOL = systems.slice(0, FEATURE_COUNT)
let featuredSnapshot: Array<(typeof systems)[number]> | null = null

function subscribeFeaturedSystems(_onStoreChange: () => void) {
  return () => {}
}

function getInitialFeaturedSystems() {
  return INITIAL_POOL
}

function getFeaturedSystems() {
  if (!featuredSnapshot)
    featuredSnapshot = shuffle(systems).slice(0, FEATURE_COUNT)
  return featuredSnapshot
}

function shuffle<T>(arr: ReadonlyArray<T>): Array<T> {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function LandingRoute() {
  const featured = useSyncExternalStore(
    subscribeFeaturedSystems,
    getFeaturedSystems,
    getInitialFeaturedSystems
  )
  const [hoverSlug, setHoverSlug] = useState<string | null>(null)

  // Theme follows hover. The first featured system is the resting choice
  // (no auto-rotation, only changes when the user hovers a card).
  const restingSystem = featured[0] ?? systems[0]
  const heroSystem =
    (hoverSlug && featured.find((s) => s.slug === hoverSlug)) || restingSystem

  return (
    <div style={themeStyle(heroSystem, "light")}>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-background" />

      <main className="relative min-h-svh overflow-x-hidden text-foreground">
        <header className="mx-auto flex max-w-[88rem] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span
              className="grid size-9 place-items-center rounded-lg border border-border shadow-inner transition-colors duration-700"
              style={{ background: paletteGradient(heroSystem) }}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                Morphous
              </p>
              <p className="hidden truncate text-sm font-semibold sm:block">
                Nature-coded design systems
              </p>
              <p className="truncate text-sm font-semibold sm:hidden">
                Morphous gallery
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <IconLink
              href="https://github.com/Ameyanagi/morphos"
              label="GitHub repository"
            >
              <GithubIcon className="size-4" />
            </IconLink>
            <IconLink href="https://x.com/DrShimogawa" label="X (@DrShimogawa)">
              <XIcon className="size-4" />
            </IconLink>
            <IconLink href="https://ameyanagi.com" label="ameyanagi.com">
              <Globe className="size-4" />
            </IconLink>
            <span
              className="mx-1 hidden h-5 w-px bg-border sm:block"
              aria-hidden
            />
            <Button asChild size="sm" variant="outline">
              <Link to="/gallery">
                Open gallery
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </header>

        <section className="mx-auto grid max-w-[88rem] items-center gap-10 px-4 pt-6 pb-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:px-8 lg:pt-10 lg:pb-16">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/85 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="size-3.5 text-primary" />
              {systems.length} AI-generated systems · in active development
            </span>
            <h1 className="text-3xl leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Pick an animal, a flower, or a stone,{" "}
              <span className="text-primary transition-colors duration-700">
                ship a design system.
              </span>
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Morphous turns a single nature motif into an 8-role palette, a
              light/dark shadcn theme, and matching PowerPoint + Word templates.
              Every prompt is recorded so the catalog stays reproducible.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to="/gallery">
                  Browse the gallery
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <a
                href="https://github.com/Ameyanagi/morphos"
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
              >
                GitHub →
              </a>
            </div>
          </div>

          <Link
            to="/gallery"
            search={{ system: heroSystem.slug }}
            aria-label={`Open ${heroSystem.name} in the gallery`}
            className="group relative block aspect-square overflow-hidden rounded-3xl border border-border shadow-xl transition hover:border-primary"
            style={{
              background: `radial-gradient(circle at 50% 35%, color-mix(in oklch, var(--palette-accent), transparent 60%), transparent 70%), color-mix(in oklch, var(--palette-background), transparent 20%)`,
            }}
          >
            <PreviewImage
              key={heroSystem.slug}
              src={heroSystem.assets.motif}
              alt={`${heroSystem.motifName} motif`}
              kind="motif"
              className="absolute inset-0 size-full object-contain p-8 transition-all duration-500 group-hover:scale-[1.03]"
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 768px) 90vw, 480px"
            />
            <div className="absolute right-4 bottom-4 left-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card/85 px-3 py-2 text-xs backdrop-blur">
              <span className="truncate font-medium">{heroSystem.name}</span>
              <span className="inline-flex items-center gap-1 text-muted-foreground group-hover:text-primary">
                Open in gallery <ArrowRight className="size-3" />
              </span>
            </div>
          </Link>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
          <p className="text-[11px] font-medium tracking-[0.18em] text-primary uppercase">
            Why this exists
          </p>
          <p className="mt-3 text-base leading-7 text-foreground">
            I started this to curate a private collection of nature-inspired
            palettes for the things I actually ship: my own website, the
            PowerPoint decks I present from, and the Word documents I write. The
            PowerPoint and Word templates are still in development; the themes
            already pick up the palette and fonts, but the layouts will get
            richer over the next few iterations.
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The push came from the quality of{" "}
            <span className="font-medium text-foreground">
              Codex + ChatGPT Images 2.0
            </span>
            , and from a museum trip with my kids where I was honestly shocked
            by how well-resolved the colors and structures of living things
            already are.
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Huge respect to{" "}
            <a
              href="https://ui.shadcn.com"
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-foreground hover:text-primary hover:underline"
            >
              shadcn/ui
            </a>{" "}
            and{" "}
            <a
              href="https://tweakcn.com"
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-foreground hover:text-primary hover:underline"
            >
              tweakcn
            </a>{" "}
            Morphous slots into both, and most of what I know about token-driven
            theming I learned from reading their work.
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Everything's open:{" "}
            <a
              href="https://github.com/Ameyanagi/morphos"
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-primary hover:underline"
            >
              source on GitHub
            </a>
            , catalog data, Codex skills, and the prompt for every system.{" "}
            <a
              href="https://ameyanagi.com"
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-primary hover:underline"
            >
              Ameyanagi
            </a>
          </p>
        </section>

        <section className="mx-auto max-w-[88rem] px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-baseline justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Featured systems
            </h2>
            <Link
              to="/gallery"
              className="text-sm font-medium text-primary hover:underline"
            >
              Browse all {systems.length} →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((system) => (
              <FeatureCard
                key={system.slug}
                system={system}
                onHover={() => setHoverSlug(system.slug)}
                onLeave={() => setHoverSlug(null)}
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Hover a card to preview its theme on this page.
          </p>
        </section>

        <section className="mx-auto max-w-[88rem] px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="mb-5 text-xl font-semibold tracking-tight sm:text-2xl">
            What every system ships with
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ValueCard
              icon={<Palette className="size-4" />}
              title="8-role palette"
              body="Background, Ink, Primary, Secondary, Accent, Signal, Surface, Depth: hex + oklch."
            />
            <ValueCard
              icon={<FileCode2 className="size-4" />}
              title="Light + dark theme"
              body="Drop-in theme.css with all 30 shadcn tokens for both modes."
            />
            <ValueCard
              icon={<Presentation className="size-4" />}
              title="PowerPoint"
              body="Editable deck with the palette baked into the OOXML theme."
            />
            <ValueCard
              icon={<FileText className="size-4" />}
              title="Word"
              body="Cover, palette stripe, palette appendix. Latin + Japanese fonts wired in."
            />
          </div>
        </section>

        <footer className="mx-auto max-w-[88rem] border-t border-border/60 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>
              Morphous · {systems.length} systems · AI-generated motifs · under
              active development
            </span>
            <FooterLinks />
          </div>
        </footer>
      </main>
    </div>
  )
}

function ValueCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <article className="rounded-xl border border-border bg-card/85 p-4 backdrop-blur">
      <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{body}</p>
    </article>
  )
}

function FeatureCard({
  system,
  onHover,
  onLeave,
}: {
  system: (typeof systems)[number]
  onHover?: () => void
  onLeave?: () => void
}) {
  return (
    <Link
      to="/gallery"
      search={{ system: system.slug }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      className="group block overflow-hidden rounded-xl border border-border bg-card/85 backdrop-blur transition hover:border-primary"
    >
      <span
        className="relative block aspect-square w-full overflow-hidden"
        style={{
          background: `radial-gradient(circle at 50% 35%, color-mix(in oklch, ${
            system.palette.find((c) => c.role === "Accent")?.hex ?? "#888"
          }, transparent 50%), transparent 70%), ${
            system.palette.find((c) => c.role === "Background")?.hex ?? "#eee"
          }`,
        }}
      >
        <PreviewImage
          src={system.assets.motif}
          alt={`${system.motifName} motif`}
          kind="motif"
          className="absolute inset-0 size-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
        />
      </span>
      <div className="border-t border-border p-3">
        <p className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          {system.motifCategory} · {system.biome}
        </p>
        <p className="mt-1 truncate text-sm font-semibold">{system.name}</p>
        <span
          className="mt-2 flex h-1.5 overflow-hidden rounded-full"
          aria-hidden
        >
          {system.palette.map((c) => (
            <span
              key={c.role}
              className="flex-1"
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </span>
      </div>
    </Link>
  )
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      title={label}
      className="grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
    >
      {children}
    </a>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      fill="currentColor"
      className={className}
    >
      <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.844l-5.36-6.984L4.6 22H1.342l8.04-9.187L1 2h7.012l4.83 6.39L18.244 2Zm-1.2 18h1.83L7.06 4H5.097l11.947 16Z" />
    </svg>
  )
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      fill="currentColor"
      className={className}
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.27-1.7-1.27-1.7-1.04-.7.08-.69.08-.69 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.52-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18a10.95 10.95 0 0 1 5.75 0c2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  )
}

function FooterLinks() {
  return (
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
      <Link to="/gallery" className="font-medium text-primary hover:underline">
        Open gallery →
      </Link>
    </div>
  )
}
