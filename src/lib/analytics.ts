export const ANALYTICS_CONSENT_KEY = "morphos-ja:analytics-consent"

export type AnalyticsConsent = "undecided" | "granted" | "denied"
type DataLayerCommand = ReadonlyArray<unknown>

declare global {
  interface Window {
    dataLayer?: Array<DataLayerCommand>
  }
}

export function parseAnalyticsConsent(value: string | null): AnalyticsConsent {
  if (value === "granted" || value === "denied") return value
  return "undecided"
}

function queueCommand(view: Window, ...args: Array<unknown>): void {
  view.dataLayer ??= []
  view.dataLayer.push(args)
}

export function loadGoogleAnalytics(
  documentNode: Document,
  measurementId: string
): boolean {
  const view = documentNode.defaultView
  if (!view) return false
  if (documentNode.querySelector(`script[data-ga4-id="${measurementId}"]`)) {
    return false
  }

  queueCommand(view, "consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  })
  queueCommand(view, "set", "ads_data_redaction", true)
  queueCommand(view, "consent", "update", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  })
  queueCommand(view, "js", new Date())
  queueCommand(view, "config", measurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  })

  const script = documentNode.createElement("script")
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
  script.dataset.ga4Id = measurementId
  documentNode.head.append(script)
  return true
}

export function trackPageView(
  measurementId: string,
  pageLocation: string,
  pageTitle: string
): void {
  if (typeof window === "undefined") return
  const pageUrl = new URL(pageLocation)
  queueCommand(window, "event", "page_view", {
    send_to: measurementId,
    page_location: pageLocation,
    page_path: pageUrl.pathname + pageUrl.search,
    page_title: pageTitle,
  })
}

export function updateAnalyticsConsent(
  consent: Exclude<AnalyticsConsent, "undecided">
): void {
  if (typeof window === "undefined") return
  queueCommand(window, "consent", "update", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: consent,
  })
}
