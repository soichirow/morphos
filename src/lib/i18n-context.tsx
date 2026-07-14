import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  LANGUAGE_STORAGE_KEY,
  
  
  
  parseLanguage,
  translate
} from "./i18n"
import type {Language, TranslationKey, TranslationValues} from "./i18n";

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey, values?: TranslationValues) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("ja")
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      setLanguage(
        parseLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY))
      )
    } catch {
      setLanguage("ja")
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    document.title = translate(language, "meta.title")
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", translate(language, "meta.description"))

    if (!loaded) return
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    } catch {
      // The UI still works when storage is unavailable.
    }
  }, [language, loaded])

  const t = useCallback(
    (key: TranslationKey, values?: TranslationValues) =>
      translate(language, key, values),
    [language]
  )

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t])

  return <LanguageContext value={value}>{children}</LanguageContext>
}

export function useLanguage(): LanguageContextValue {
  const value = use(LanguageContext)
  if (!value)
    throw new Error("useLanguage must be used inside LanguageProvider")
  return value
}
