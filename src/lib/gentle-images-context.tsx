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

type GentleImagesValue = {
  displayMode: MotifDisplayMode
  setDisplayMode: (value: MotifDisplayMode) => void
}

const GentleImagesContext = createContext<GentleImagesValue>({
  displayMode: "fluffy",
  setDisplayMode: () => undefined,
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

export function GentleImagesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [displayMode, setDisplayModeState] =
    useState<MotifDisplayMode>("fluffy")

  useEffect(() => {
    setDisplayModeState(readInitialMode())
  }, [])

  const setDisplayMode = useCallback((value: MotifDisplayMode) => {
    setDisplayModeState(value)
    writeStorageItem(window.localStorage, MODE_STORAGE_KEY, value)
  }, [])

  const value = useMemo(
    () => ({ displayMode, setDisplayMode }),
    [displayMode, setDisplayMode]
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
