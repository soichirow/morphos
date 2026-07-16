import { useCallback, useEffect, useState } from "react"
import { Link, useRouterState } from "@tanstack/react-router"

import type { AnalyticsConsent } from "@/lib/analytics"
import {
  ANALYTICS_CONSENT_KEY,
  loadGoogleAnalytics,
  parseAnalyticsConsent,
  trackPageView,
  updateAnalyticsConsent,
} from "@/lib/analytics"
import { readStorageItem, writeStorageItem } from "@/lib/browser-storage"
import { useLanguage } from "@/lib/i18n-context"
import { siteConfig } from "@/lib/site-config"

const SETTINGS_EVENT = "morphous:analytics-settings"

const copy = {
  ja: {
    title: "アクセス解析について",
    body: "サイト改善のため、同意いただいた場合だけGoogle Analyticsを使用します。広告用ストレージは使用しません。",
    accept: "分析を許可",
    deny: "許可しない",
    privacy: "プライバシー方針",
    settings: "アクセス解析設定",
  },
  en: {
    title: "Analytics preferences",
    body: "We use Google Analytics only with your consent to improve this site. Advertising storage stays disabled.",
    accept: "Allow analytics",
    deny: "Do not allow",
    privacy: "Privacy policy",
    settings: "Analytics settings",
  },
} as const

export function openAnalyticsSettings(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SETTINGS_EVENT))
  }
}

export function AnalyticsConsentControl() {
  const { language } = useLanguage()
  const locationHref = useRouterState({
    select: (state) => state.location.href,
  })
  const measurementId = siteConfig.ga4MeasurementId
  const [consent, setConsent] = useState<AnalyticsConsent>("undecided")
  const [loaded, setLoaded] = useState(false)
  const [editing, setEditing] = useState(false)
  const text = copy[language]

  useEffect(() => {
    setConsent(
      parseAnalyticsConsent(
        readStorageItem(window.localStorage, ANALYTICS_CONSENT_KEY)
      )
    )
    setLoaded(true)
  }, [])

  useEffect(() => {
    const openSettings = () => setEditing(true)
    window.addEventListener(SETTINGS_EVENT, openSettings)
    return () => window.removeEventListener(SETTINGS_EVENT, openSettings)
  }, [])

  useEffect(() => {
    if (!loaded || consent !== "granted" || !measurementId) return
    loadGoogleAnalytics(document, measurementId)
    trackPageView(
      measurementId,
      new URL(locationHref, window.location.origin).toString(),
      document.title
    )
  }, [consent, loaded, locationHref, measurementId])

  const choose = useCallback((next: Exclude<AnalyticsConsent, "undecided">) => {
    writeStorageItem(window.localStorage, ANALYTICS_CONSENT_KEY, next)
    setConsent(next)
    setEditing(false)
    if (next === "denied") updateAnalyticsConsent("denied")
  }, [])

  if (!measurementId || !loaded) return null

  if (consent !== "undecided" && !editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="fixed right-3 bottom-3 z-50 rounded-full border border-border bg-background/95 px-3 py-2 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur hover:text-foreground"
      >
        {text.settings}
      </button>
    )
  }

  return (
    <section
      aria-labelledby="analytics-consent-title"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-xl border border-border bg-background/98 p-4 text-foreground shadow-2xl backdrop-blur sm:p-5"
    >
      <h2 id="analytics-consent-title" className="text-sm font-semibold">
        {text.title}
      </h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {text.body}{" "}
        <Link
          to="/privacy"
          className="font-medium underline underline-offset-2"
        >
          {text.privacy}
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => choose("denied")}
          className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          {text.deny}
        </button>
        <button
          type="button"
          onClick={() => choose("granted")}
          className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {text.accept}
        </button>
      </div>
    </section>
  )
}
