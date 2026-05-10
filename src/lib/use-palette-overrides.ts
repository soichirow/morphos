import { useMemo, useSyncExternalStore } from "react"
import type { MorphousSystem } from "@/data/systems"

const STORAGE_KEY = "morphous.palette-overrides"
const PALETTE_STORE_EVENT = "morphous-palette-overrides-store"

type AllOverrides = Record<string, Record<string, string>>

function parseAll(raw: string | null): AllOverrides {
  try {
    return raw ? (JSON.parse(raw) as AllOverrides) : {}
  } catch {
    return {}
  }
}

function loadAll(): AllOverrides {
  if (typeof window === "undefined") return {}
  return parseAll(window.localStorage.getItem(STORAGE_KEY))
}

function getOverridesSnapshot(): string {
  if (typeof window === "undefined") return ""
  return window.localStorage.getItem(STORAGE_KEY) ?? ""
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

function saveAll(all: AllOverrides) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  window.dispatchEvent(new Event(PALETTE_STORE_EVENT))
}

export function usePaletteOverrides(system: MorphousSystem) {
  const snapshot = useSyncExternalStore(
    subscribeOverrides,
    getOverridesSnapshot,
    getServerOverridesSnapshot
  )
  const all = useMemo(() => parseAll(snapshot), [snapshot])

  const overrides = all[system.slug] ?? {}

  const tunedSystem = useMemo<MorphousSystem>(() => {
    const keys = Object.keys(overrides)
    if (keys.length === 0) return system
    return {
      ...system,
      palette: system.palette.map((color) =>
        overrides[color.role] ? { ...color, hex: overrides[color.role] } : color
      ),
    }
  }, [system, overrides])

  function setOverride(role: string, hex: string) {
    const prev = loadAll()
    saveAll({
      ...prev,
      [system.slug]: { ...(prev[system.slug] ?? {}), [role]: hex },
    })
  }

  function resetOverrides() {
    const next = { ...loadAll() }
    delete next[system.slug]
    saveAll(next)
  }

  return {
    tunedSystem,
    overrides,
    hasOverrides: Object.keys(overrides).length > 0,
    setOverride,
    resetOverrides,
  }
}
