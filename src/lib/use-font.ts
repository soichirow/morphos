import { useEffect, useState } from "react"
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
  const [fontId, setFontIdState] = useState<string>(defaultFontId)
  const [jaFontId, setJaFontIdState] = useState<string>(defaultJaFontId)
  const [presetId, setPresetIdState] = useState<string>(defaultPresetId)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    const storedJa = window.localStorage.getItem(JA_STORAGE_KEY)
    const storedPreset = window.localStorage.getItem(PRESET_STORAGE_KEY)
    if (storedPreset && presets.some((p) => p.id === storedPreset)) {
      const p = getPreset(storedPreset)
      setPresetIdState(storedPreset)
      setFontIdState(p.fontId)
      setJaFontIdState(p.jaFontId)
      return
    }
    if (stored && fonts.some((f) => f.id === stored)) setFontIdState(stored)
    if (storedJa && jaFonts.some((f) => f.id === storedJa)) setJaFontIdState(storedJa)
  }, [])

  const font = getFont(fontId)
  const jaFont = getJaFont(jaFontId)

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEY, fontId)
    loadGoogleFont(LINK_ID, font.googleHref)
    const stack = `${font.stack.replace(/, ?system-ui.*/, "")}, ${jaFont.stack}, system-ui, -apple-system, sans-serif`
    document.documentElement.style.setProperty("--font-sans", stack)
    document.body.style.fontFamily = stack
  }, [fontId, font.googleHref, font.stack, jaFont.stack])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(JA_STORAGE_KEY, jaFontId)
    loadGoogleFont(JA_LINK_ID, jaFont.googleHref)
  }, [jaFontId, jaFont.googleHref])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(PRESET_STORAGE_KEY, presetId)
  }, [presetId])

  function setFontId(id: string) {
    setFontIdState(id)
    const matched = matchPreset(id, jaFontId)
    setPresetIdState(matched ? matched.id : "")
  }

  function setJaFontId(id: string) {
    setJaFontIdState(id)
    const matched = matchPreset(fontId, id)
    setPresetIdState(matched ? matched.id : "")
  }

  function setPresetId(id: string) {
    const p = getPreset(id)
    setPresetIdState(id)
    setFontIdState(p.fontId)
    setJaFontIdState(p.jaFontId)
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
