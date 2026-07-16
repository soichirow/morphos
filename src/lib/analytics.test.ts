// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest"

import {
  ANALYTICS_CONSENT_KEY,
  loadGoogleAnalytics,
  parseAnalyticsConsent,
  trackPageView,
} from "./analytics"

describe("analytics consent boundary", () => {
  beforeEach(() => {
    document.head.innerHTML = ""
    window.localStorage.clear()
    delete window.dataLayer
  })

  it("treats missing or unknown consent as undecided", () => {
    expect(parseAnalyticsConsent(null)).toBe("undecided")
    expect(parseAnalyticsConsent("anything-else")).toBe("undecided")
    expect(parseAnalyticsConsent("granted")).toBe("granted")
    expect(parseAnalyticsConsent("denied")).toBe("denied")
  })

  it("does not load Google Analytics merely by storing denied consent", () => {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, "denied")

    expect(
      document.querySelector('script[src*="googletagmanager.com"]')
    ).toBeNull()
    expect(document.cookie).toBe("")
  })

  it("loads GA4 once only after an explicit grant", () => {
    expect(loadGoogleAnalytics(document, "G-ABC123XYZ")).toBe(true)
    expect(loadGoogleAnalytics(document, "G-ABC123XYZ")).toBe(false)

    const script = document.querySelector<HTMLScriptElement>(
      'script[src*="googletagmanager.com"]'
    )
    expect(script?.src).toContain("id=G-ABC123XYZ")
    expect(window.dataLayer).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ 0: "consent", 1: "default" }),
        expect.objectContaining({ 0: "consent", 1: "update" }),
      ])
    )
  })

  it("queues explicit SPA page views without enabling advertising storage", () => {
    loadGoogleAnalytics(document, "G-ABC123XYZ")
    trackPageView("G-ABC123XYZ", "https://example.com/gallery/", "Gallery")

    expect(window.dataLayer?.at(-1)).toEqual(
      expect.objectContaining({ 0: "event", 1: "page_view" })
    )
  })
})
