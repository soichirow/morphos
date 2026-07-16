import { useMemo, useSyncExternalStore } from "react"
import type { MorphousSystem } from "@/domain/morphous-system"
import type { PaletteOverrides } from "@/lib/palette-overrides"
import { systems } from "@/data/systems"
import { readStorageItem, writeStorageItem } from "@/lib/browser-storage"
import {
  applyPaletteOverrides,
  parsePaletteOverrides,
  removePaletteOverrides,
  setPaletteOverride,
} from "@/lib/palette-overrides"

const STORAGE_KEY = "morphous.palette-overrides"
const PALETTE_STORE_EVENT = "morphous-palette-overrides-store"

function loadAll(): PaletteOverrides {
  if (typeof window === "undefined") return {}
  return parsePaletteOverrides(readStorageItem(window.localStorage, STORAGE_KEY), systems)
}

function getOverridesSnapshot(): string {
  if (typeof window === "undefined") return ""
  return readStorageItem(window.localStorage, STORAGE_KEY) ?? ""
}

function getServerOverridesSnapshot(): string {
  return ""
}

function subscribeOverrides(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {}
  const onCustomStoreChange = () => onStoreChange()
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(PALETTE_STORE_EVENT, onCustomStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(PALETTE_STORE_EVENT, onCustomStoreChange)
  }
}

function saveAll(all: PaletteOverrides) {
  if (typeof window === "undefined") return
  if (!writeStorageItem(window.localStorage, STORAGE_KEY, JSON.stringify(all))) {
    return
  }
  window.dispatchEvent(new Event(PALETTE_STORE_EVENT))
}

export function usePaletteOverrides(system: MorphousSystem) {
  const snapshot = useSyncExternalStore(
    subscribeOverrides,
    getOverridesSnapshot,
    getServerOverridesSnapshot
  )
  const all = useMemo(() => parsePaletteOverrides(snapshot, systems), [snapshot])

  const overrides = all[system.slug] ?? {}

  const tunedSystem = useMemo(
    () => applyPaletteOverrides(system, overrides),
    [system, overrides]
  )

  function setOverride(role: string, hex: string) {
    saveAll(setPaletteOverride(loadAll(), system, role, hex))
  }

  function resetOverrides() {
    saveAll(removePaletteOverrides(loadAll(), system.slug))
  }

  return {
    tunedSystem,
    overrides,
    hasOverrides: Object.keys(overrides).length > 0,
    setOverride,
    resetOverrides,
  }
}
