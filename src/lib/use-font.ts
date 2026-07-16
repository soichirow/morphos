import { useEffect, useMemo, useSyncExternalStore } from "react"
import {
  defaultFontId,
  defaultJaFontId,
  defaultPresetId,
  fonts,
  getFont,
  getJaFont,
  getPreset,
  jaFonts,
  matchPreset,
  presets,
} from "./typography"

const STORAGE_KEY = "morphous.font"
const JA_STORAGE_KEY = "morphous.font.ja"
const PRESET_STORAGE_KEY = "morphous.font.preset"
const LINK_ID = "morphous-font-link"
const JA_LINK_ID = "morphous-font-link-ja"
const FONT_STORE_EVENT = "morphous-font-store"

type FontState = {
  fontId: string
  jaFontId: string
  presetId: string
}

const DEFAULT_FONT_STATE: FontState = {
  fontId: defaultFontId,
  jaFontId: defaultJaFontId,
  presetId: defaultPresetId,
}

const encodeFontState = (state: FontState) =>
  [state.fontId, state.jaFontId, state.presetId].join("\u0000")

function normalizeFontState(state: FontState): FontState {
  const preset =
    state.presetId && presets.some((p) => p.id === state.presetId)
      ? getPreset(state.presetId)
      : null
  if (preset) {
    return {
      fontId: preset.fontId,
      jaFontId: preset.jaFontId,
      presetId: preset.id,
    }
  }

  const fontId = fonts.some((f) => f.id === state.fontId)
    ? state.fontId
    : defaultFontId
  const jaFontId = jaFonts.some((f) => f.id === state.jaFontId)
    ? state.jaFontId
    : defaultJaFontId
  return {
    fontId,
    jaFontId,
    presetId: matchPreset(fontId, jaFontId)?.id ?? "",
  }
}

function readFontState(): FontState {
  if (typeof window === "undefined") return DEFAULT_FONT_STATE
  return normalizeFontState({
    fontId: window.localStorage.getItem(STORAGE_KEY) ?? defaultFontId,
    jaFontId: window.localStorage.getItem(JA_STORAGE_KEY) ?? defaultJaFontId,
    presetId:
      window.localStorage.getItem(PRESET_STORAGE_KEY) ?? defaultPresetId,
  })
}

function getFontSnapshot(): string {
  return encodeFontState(readFontState())
}

function getServerFontSnapshot(): string {
  return encodeFontState(DEFAULT_FONT_STATE)
}

function subscribeFontStore(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {}
  const onCustomStoreChange = () => onStoreChange()
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(FONT_STORE_EVENT, onCustomStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(FONT_STORE_EVENT, onCustomStoreChange)
  }
}

function writeFontState(state: FontState) {
  if (typeof window === "undefined") return
  const normalized = normalizeFontState(state)
  window.localStorage.setItem(STORAGE_KEY, normalized.fontId)
  window.localStorage.setItem(JA_STORAGE_KEY, normalized.jaFontId)
  window.localStorage.setItem(PRESET_STORAGE_KEY, normalized.presetId)
  window.dispatchEvent(new Event(FONT_STORE_EVENT))
}

function loadGoogleFont(id: string, href: string | undefined) {
  if (typeof document === "undefined") return
  const existing = document.getElementById(id) as HTMLLinkElement | null
  if (!href) {
    if (existing) existing.remove()
    return
  }
  let link = existing
  if (!link) {
    link = document.createElement("link")
    link.id = id
    link.rel = "stylesheet"
    document.head.appendChild(link)
  }
  if (link.href !== href) link.href = href
}

export function useFont() {
  const snapshot = useSyncExternalStore(
    subscribeFontStore,
    getFontSnapshot,
    getServerFontSnapshot
  )
  const [fontId, jaFontId, presetId] = useMemo(() => {
    const [nextFontId, nextJaFontId, nextPresetId] = snapshot.split("\u0000")
    return [
      nextFontId || defaultFontId,
      nextJaFontId || defaultJaFontId,
      nextPresetId ?? "",
    ] as const
  }, [snapshot])

  const font = getFont(fontId)
  const jaFont = getJaFont(jaFontId)

  useEffect(() => {
    if (typeof window === "undefined") return
    loadGoogleFont(LINK_ID, font.googleHref)
    const stack = `${font.stack.replace(/, ?system-ui.*/, "")}, ${jaFont.stack}, system-ui, -apple-system, sans-serif`
    document.documentElement.style.setProperty("--font-sans", stack)
    document.body.style.fontFamily = stack
  }, [fontId, font.googleHref, font.stack, jaFont.stack])

  useEffect(() => {
    if (typeof window === "undefined") return
    loadGoogleFont(JA_LINK_ID, jaFont.googleHref)
  }, [jaFontId, jaFont.googleHref])

  function setFontId(id: string) {
    const matched = matchPreset(id, jaFontId)
    writeFontState({
      fontId: id,
      jaFontId,
      presetId: matched ? matched.id : "",
    })
  }

  function setJaFontId(id: string) {
    const matched = matchPreset(fontId, id)
    writeFontState({
      fontId,
      jaFontId: id,
      presetId: matched ? matched.id : "",
    })
  }

  function setPresetId(id: string) {
    const p = getPreset(id)
    writeFontState({ fontId: p.fontId, jaFontId: p.jaFontId, presetId: p.id })
  }

  return {
    fontId,
    setFontId,
    font,
    jaFontId,
    setJaFontId,
    jaFont,
    presetId,
    setPresetId,
  }
}
