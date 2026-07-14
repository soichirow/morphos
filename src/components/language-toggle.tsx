import { Languages } from "lucide-react"

import { useLanguage } from "@/lib/i18n-context"

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div
      className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1"
      role="group"
      aria-label={t("common.language")}
    >
      <Languages className="mx-1 size-4 text-primary" aria-hidden />
      <button
        type="button"
        onClick={() => setLanguage("ja")}
        aria-pressed={language === "ja"}
        className={`h-8 rounded-md px-2.5 text-xs font-medium transition ${
          language === "ja"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        日本語
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={`h-8 rounded-md px-2.5 text-xs font-medium transition ${
          language === "en"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        English
      </button>
    </div>
  )
}
