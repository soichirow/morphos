import { useEffect, useState } from "react"
import { Check, Copy, Share2, Smartphone } from "lucide-react"

import type { SocialShareTarget } from "@/lib/share-favorites"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n-context"
import { buildSocialShareUrl, buildSystemShareUrl } from "@/lib/share-favorites"
import { absoluteSiteUrl } from "@/lib/site-config"

const socialTargets: Array<{ target: SocialShareTarget; label: string }> = [
  { target: "x", label: "X" },
  { target: "facebook", label: "Facebook" },
  { target: "linkedin", label: "LinkedIn" },
  { target: "bluesky", label: "Bluesky" },
  { target: "reddit", label: "Reddit" },
  { target: "whatsapp", label: "WhatsApp" },
  { target: "telegram", label: "Telegram" },
]

export function ShareMenu({ slug, title }: { slug: string; title: string }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [supportsNativeShare, setSupportsNativeShare] = useState(false)
  const shareUrl = buildSystemShareUrl(absoluteSiteUrl("/gallery/"), slug)
  const payload = { url: shareUrl, title, text: t("gallery.shareText") }
  const menuId = `share-menu-${slug}`

  useEffect(() => {
    setSupportsNativeShare(typeof navigator.share === "function")
  }, [])

  async function copyShareUrl() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  async function shareToDevice() {
    try {
      await navigator.share(payload)
      setOpen(false)
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        await copyShareUrl()
      }
    }
  }

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="dialog"
      >
        <Share2 data-icon="inline-start" />
        {t("gallery.share")}
      </Button>
      {open ? (
        <div
          id={menuId}
          role="dialog"
          aria-label={t("gallery.shareMenuTitle")}
          className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-xl"
        >
          <p className="text-sm font-semibold">{t("gallery.shareMenuTitle")}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {t("gallery.shareMenuDescription")}
          </p>
          {supportsNativeShare ? (
            <Button
              className="mt-3 w-full justify-start"
              size="sm"
              variant="default"
              onClick={shareToDevice}
            >
              <Smartphone data-icon="inline-start" />
              {t("gallery.shareDevice")}
            </Button>
          ) : null}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {socialTargets.map(({ target, label }) => (
              <a
                key={target}
                href={buildSocialShareUrl(target, payload)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {label}
              </a>
            ))}
          </div>
          <Button
            className="mt-2 w-full justify-start"
            size="sm"
            variant="outline"
            onClick={copyShareUrl}
            title={t("gallery.copyUrlTitle")}
          >
            {copied ? (
              <Check data-icon="inline-start" />
            ) : (
              <Copy data-icon="inline-start" />
            )}
            {copied ? t("common.copied") : t("gallery.copyUrl")}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
