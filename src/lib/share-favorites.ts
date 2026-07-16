export const FAVORITES_STORAGE_KEY = "morphos-ja:favorite-slugs"

export function buildSystemShareUrl(currentHref: string, slug: string): string {
  const url = new URL(currentHref)
  url.pathname = "/gallery"
  url.search = new URLSearchParams({ system: slug }).toString()
  url.hash = ""
  return url.toString()
}

export type SocialShareTarget =
  "x" | "facebook" | "linkedin" | "bluesky" | "reddit" | "whatsapp" | "telegram"

export type SocialSharePayload = {
  url: string
  title: string
  text: string
}

export function buildSocialShareUrl(
  target: SocialShareTarget,
  payload: SocialSharePayload
): string {
  const shareText = `${payload.title}\n${payload.text}`

  switch (target) {
    case "x":
      return shareUrl("https://twitter.com/intent/tweet", {
        url: payload.url,
        text: shareText,
      })
    case "facebook":
      return shareUrl("https://www.facebook.com/sharer/sharer.php", {
        u: payload.url,
      })
    case "linkedin":
      return shareUrl("https://www.linkedin.com/sharing/share-offsite/", {
        url: payload.url,
      })
    case "bluesky":
      return shareUrl("https://bsky.app/intent/compose", {
        text: `${shareText}\n${payload.url}`,
      })
    case "reddit":
      return shareUrl("https://www.reddit.com/submit", {
        url: payload.url,
        title: payload.title,
      })
    case "whatsapp":
      return shareUrl("https://wa.me/", {
        text: `${shareText}\n${payload.url}`,
      })
    case "telegram":
      return shareUrl("https://t.me/share/url", {
        url: payload.url,
        text: shareText,
      })
  }
}

function shareUrl(endpoint: string, params: Record<string, string>): string {
  const url = new URL(endpoint)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return url.toString()
}

export function parseFavoriteSlugs(raw: string | null): Array<string> {
  if (!raw) return []

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return Array.from(
      new Set(
        parsed.filter(
          (value): value is string =>
            typeof value === "string" && value.trim().length > 0
        )
      )
    )
  } catch {
    return []
  }
}

export function toggleFavoriteSlug(
  favoriteSlugs: ReadonlyArray<string>,
  slug: string
): Array<string> {
  return favoriteSlugs.includes(slug)
    ? favoriteSlugs.filter((favoriteSlug) => favoriteSlug !== slug)
    : [...favoriteSlugs, slug]
}
