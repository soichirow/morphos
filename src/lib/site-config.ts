export const DEFAULT_SITE_URL = "https://morphos.so1ro.com"

export function normalizeSiteUrl(value: string | undefined): string {
  if (!value) return DEFAULT_SITE_URL
  try {
    const url = new URL(value)
    if (
      (url.protocol !== "https:" && url.protocol !== "http:") ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      return DEFAULT_SITE_URL
    }
    return url.origin
  } catch {
    return DEFAULT_SITE_URL
  }
}

export function normalizeMeasurementId(
  value: string | undefined
): string | undefined {
  const candidate = value?.trim().toUpperCase()
  if (!candidate || candidate === "G-PLACEHOLDER") return undefined
  return /^G-[A-Z0-9]{6,}$/.test(candidate) ? candidate : undefined
}

export function normalizeVerificationToken(
  value: string | undefined
): string | undefined {
  const candidate = value?.trim()
  return candidate ? candidate : undefined
}

export const siteConfig = {
  siteUrl: normalizeSiteUrl(import.meta.env.VITE_SITE_URL),
  ga4MeasurementId: normalizeMeasurementId(
    import.meta.env.VITE_GA4_MEASUREMENT_ID
  ),
  googleSiteVerification: normalizeVerificationToken(
    import.meta.env.VITE_GOOGLE_SITE_VERIFICATION
  ),
  bingSiteVerification: normalizeVerificationToken(
    import.meta.env.VITE_BING_SITE_VERIFICATION
  ),
} as const

export function absoluteSiteUrl(pathname: string): string {
  return new URL(pathname, `${siteConfig.siteUrl}/`).toString()
}
