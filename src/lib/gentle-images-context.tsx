import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import { readStorageItem, writeStorageItem } from "./browser-storage"
import type { MotifDisplayMode } from "@/domain/motif-presentation"

const LEGACY_VISIBILITY_STORAGE_KEY = "morphous:gentle-images"
const LEGACY_STYLE_STORAGE_KEY = "morphous:gentle-image-style"
const MODE_STORAGE_KEY = "morphous:motif-display-mode"
const MOTIF_MODES_STORAGE_KEY = "morphous:motif-display-mode-overrides"

type GentleImagesValue = {
  displayMode: MotifDisplayMode
  setDisplayMode: (value: MotifDisplayMode) => void
  displayModeFor: (slug: string) => MotifDisplayMode
  setMotifDisplayMode: (slug: string, value: MotifDisplayMode) => void
}

const GentleImagesContext = createContext<GentleImagesValue>({
  displayMode: "fluffy",
  setDisplayMode: () => undefined,
  displayModeFor: () => "fluffy",
  setMotifDisplayMode: () => undefined,
})

function readInitialMode(): MotifDisplayMode {
  const storedMode = readStorageItem(window.localStorage, MODE_STORAGE_KEY)
  if (
    storedMode === "fluffy" ||
    storedMode === "mosaic" ||
    storedMode === "normal"
  ) {
    return storedMode
  }

  const legacyVisibility = readStorageItem(
    window.localStorage,
    LEGACY_VISIBILITY_STORAGE_KEY
  )
  const legacyStyle = readStorageItem(
    window.localStorage,
    LEGACY_STYLE_STORAGE_KEY
  )
  if (legacyVisibility === "false") return "normal"
  return legacyStyle === "mosaic" ? "mosaic" : "fluffy"
}

export function parseMotifDisplayModeOverrides(
  stored: string | null
): Record<string, MotifDisplayMode> {
  if (!stored) return {}

  try {
    const parsed: unknown = JSON.parse(stored)
    if (
      parsed === null ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return {}
    }

    const result: Record<string, MotifDisplayMode> = {}
    for (const [slug, value] of Object.entries(parsed)) {
      if (value === "fluffy" || value === "mosaic" || value === "normal") {
        result[slug] = value
      }
    }
    return result
  } catch {
    return {}
  }
}

function readInitialMotifDisplayModes(): Record<string, MotifDisplayMode> {
  return parseMotifDisplayModeOverrides(
    readStorageItem(window.localStorage, MOTIF_MODES_STORAGE_KEY)
  )
}

export function GentleImagesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [displayMode, setDisplayModeState] =
    useState<MotifDisplayMode>("fluffy")
  const [motifDisplayModes, setMotifDisplayModes] = useState<
    Record<string, MotifDisplayMode>
  >({})

  useEffect(() => {
    setDisplayModeState(readInitialMode())
    setMotifDisplayModes(readInitialMotifDisplayModes())
  }, [])

  const setDisplayMode = useCallback((value: MotifDisplayMode) => {
    setDisplayModeState(value)
    writeStorageItem(window.localStorage, MODE_STORAGE_KEY, value)
  }, [])

  const displayModeFor = useCallback(
    (slug: string) => motifDisplayModes[slug] ?? displayMode,
    [displayMode, motifDisplayModes]
  )

  const setMotifDisplayMode = useCallback(
    (slug: string, value: MotifDisplayMode) => {
      setMotifDisplayModes((current) => {
        const next = { ...current, [slug]: value }
        writeStorageItem(
          window.localStorage,
          MOTIF_MODES_STORAGE_KEY,
          JSON.stringify(next)
        )
        return next
      })
    },
    []
  )

  const value = useMemo(
    () => ({
      displayMode,
      setDisplayMode,
      displayModeFor,
      setMotifDisplayMode,
    }),
    [displayMode, setDisplayMode, displayModeFor, setMotifDisplayMode]
  )

  return (
    <GentleImagesContext.Provider value={value}>
      {children}
    </GentleImagesContext.Provider>
  )
}

export function useGentleImages(): GentleImagesValue {
  return use(GentleImagesContext)
}
