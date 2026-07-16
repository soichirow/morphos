import { describe, expect, it } from "vitest"

import {
  normalizeMeasurementId,
  normalizeSiteUrl,
  normalizeVerificationToken,
} from "./site-config"

describe("site configuration", () => {
  it("normalizes a canonical HTTPS origin", () => {
    expect(normalizeSiteUrl("https://example.com///")).toBe(
      "https://example.com"
    )
  })

  it("falls back when the configured origin is not HTTP(S)", () => {
    expect(normalizeSiteUrl("javascript:alert(1)")).toBe(
      "https://morphos.so1ro.com"
    )
  })

  it("accepts only GA4 measurement IDs", () => {
    expect(normalizeMeasurementId("G-ABC123XYZ")).toBe("G-ABC123XYZ")
    expect(normalizeMeasurementId("UA-123-1")).toBeUndefined()
    expect(normalizeMeasurementId("G-PLACEHOLDER")).toBeUndefined()
  })

  it("does not emit empty webmaster verification meta", () => {
    expect(normalizeVerificationToken("  token-value  ")).toBe("token-value")
    expect(normalizeVerificationToken("  ")).toBeUndefined()
    expect(normalizeVerificationToken(undefined)).toBeUndefined()
  })
})
