import { useEffect, useMemo, useState } from "react"
import type { MorphousSystem } from "@/data/systems"

const STORAGE_KEY = "morphous.palette-overrides"

type AllOverrides = Record<string, Record<string, string>>

function loadAll(): AllOverrides {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AllOverrides) : {}
  } catch {
    return {}
  }
}

function saveAll(all: AllOverrides) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function usePaletteOverrides(system: MorphousSystem) {
  const [all, setAll] = useState<AllOverrides>({})

  useEffect(() => {
    setAll(loadAll())
  }, [])

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
    setAll((prev) => {
      const next = { ...prev, [system.slug]: { ...(prev[system.slug] ?? {}), [role]: hex } }
      saveAll(next)
      return next
    })
  }

  function resetOverrides() {
    setAll((prev) => {
      const next = { ...prev }
      delete next[system.slug]
      saveAll(next)
      return next
    })
  }

  return {
    tunedSystem,
    overrides,
    hasOverrides: Object.keys(overrides).length > 0,
    setOverride,
    resetOverrides,
  }
}
