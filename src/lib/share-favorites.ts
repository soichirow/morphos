export const FAVORITES_STORAGE_KEY = "morphos-ja:favorite-slugs"

export function buildSystemShareUrl(currentHref: string, slug: string): string {
  const url = new URL(currentHref)
  url.pathname = "/gallery"
  url.search = new URLSearchParams({ system: slug }).toString()
  url.hash = ""
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
