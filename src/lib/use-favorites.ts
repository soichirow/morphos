import { useCallback, useEffect, useState } from "react"

import { readStorageItem, writeStorageItem } from "@/lib/browser-storage"
import {
  FAVORITES_STORAGE_KEY,
  parseFavoriteSlugs,
  toggleFavoriteSlug,
} from "@/lib/share-favorites"

export function useFavorites(): {
  slugs: Array<string>
  toggle: (slug: string) => void
} {
  const [slugs, setSlugs] = useState<Array<string>>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setSlugs(
      parseFavoriteSlugs(readStorageItem(window.localStorage, FAVORITES_STORAGE_KEY))
    )
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    writeStorageItem(
      window.localStorage,
      FAVORITES_STORAGE_KEY,
      JSON.stringify(slugs)
    )
  }, [loaded, slugs])

  const toggle = useCallback((slug: string) => {
    setSlugs((current) => toggleFavoriteSlug(current, slug))
  }, [])

  return { slugs, toggle }
}
