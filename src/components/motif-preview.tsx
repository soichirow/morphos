import { useState } from "react"
import { Bug, Eye, Grid3X3, Sparkles, Waves } from "lucide-react"

import { PreviewImage } from "./preview-image"
import type { MorphousSystem } from "@/domain/morphous-system"
import {
  hasGentleMotifIllustration,
  shouldUseGentleMotif,
} from "@/domain/motif-presentation"
import { useGentleImages } from "@/lib/gentle-images-context"
import { useLanguage } from "@/lib/i18n-context"

type Props = {
  system: MorphousSystem
  label: string
  className?: string
  loading?: "eager" | "lazy"
  fetchPriority?: "high" | "low" | "auto"
  sizes?: string
  allowReveal?: boolean
  onOpen?: () => void
  openLabel?: string
}

export function MotifPreview({
  system,
  label,
  className,
  loading,
  fetchPriority,
  sizes,
  allowReveal = false,
  onOpen,
  openLabel,
}: Props) {
  const { t } = useLanguage()
  const { displayMode } = useGentleImages()
  const [revealedSlug, setRevealedSlug] = useState<string | null>(null)
  const gentle = shouldUseGentleMotif(
    displayMode,
    revealedSlug === system.slug
  )

  if (gentle) {
    const presentation =
      displayMode === "fluffy" && hasGentleMotifIllustration(system)
        ? "scribble"
        : "mosaic"

    if (presentation === "mosaic") {
      return (
        <span
          className={`relative inline-block overflow-hidden bg-muted ${className ?? ""}`}
        >
          <PreviewImage
            src={system.assets.motif}
            alt={`${label}${t("gallery.mosaicPreviewSuffix")}`}
            kind="motif"
            className="absolute -inset-[8%] size-[116%] object-cover blur-[16px] saturate-75 contrast-75"
            {...(loading ? { loading } : {})}
            {...(fetchPriority ? { fetchPriority } : {})}
            {...(sizes ? { sizes } : {})}
          />
          <span
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "linear-gradient(90deg, currentColor 1px, transparent 1px), linear-gradient(currentColor 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
            aria-hidden
          />
          <span className="pointer-events-none absolute top-2 left-2 inline-flex items-center gap-1 rounded-full border border-white/50 bg-background/80 px-2 py-1 text-[10px] font-semibold tracking-wide text-primary shadow-sm backdrop-blur">
            <Grid3X3 className="size-3 stroke-[1.5]" aria-hidden />
            <span>{t("gallery.mosaicBadge")}</span>
          </span>
          {allowReveal ? (
            <button
              type="button"
              onClick={() => setRevealedSlug(system.slug)}
              className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-full border border-border bg-background/90 px-2.5 py-1 text-[10px] font-medium text-foreground shadow-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Eye className="size-3" aria-hidden />
              {t("gallery.showOriginalMotif")}
            </button>
          ) : null}
        </span>
      )
    }

    const Icon =
      system.motifCategory === "insect"
        ? Bug
        : system.motifCategory === "marine" ||
            system.motifCategory === "mollusk" ||
            system.motifCategory === "crustacean"
          ? Waves
          : Sparkles
    return (
      <span
        className={`relative inline-block overflow-hidden bg-muted ${className ?? ""}`}
      >
        <img
          src={`/gentle-motifs/${system.slug}.webp`}
          alt={`${label}${t("gallery.gentlePreviewSuffix")}`}
          width={1254}
          height={1254}
          className="absolute inset-0 size-full object-contain"
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          sizes={sizes}
        />
        <span className="pointer-events-none absolute top-2 left-2 inline-flex items-center gap-1 rounded-full border border-white/50 bg-background/80 px-2 py-1 text-[10px] font-semibold tracking-wide text-primary shadow-sm backdrop-blur">
          <Icon className="size-3 stroke-[1.5]" aria-hidden />
          <span>{t("gallery.gentleBadge")}</span>
        </span>
        {allowReveal ? (
          <button
            type="button"
            onClick={() => setRevealedSlug(system.slug)}
            className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-full border border-border bg-background/90 px-2.5 py-1 text-[10px] font-medium text-foreground shadow-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Eye className="size-3" aria-hidden />
            {t("gallery.showOriginalMotif")}
          </button>
        ) : null}
      </span>
    )
  }

  const image = (
    <PreviewImage
      src={system.assets.motif}
      alt={`${label} motif`}
      kind="motif"
      {...(className ? { className } : {})}
      {...(loading ? { loading } : {})}
      {...(fetchPriority ? { fetchPriority } : {})}
      {...(sizes ? { sizes } : {})}
    />
  )
  return onOpen ? (
    <button
      type="button"
      onClick={onOpen}
      aria-label={openLabel}
      className="cursor-zoom-in"
    >
      {image}
    </button>
  ) : (
    image
  )
}
