// @vitest-environment jsdom

import { createElement } from "react"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { GentleImageStyleToggle } from "./gentle-image-style-toggle"
import {
  GentleImagesProvider,
  parseMotifDisplayModeOverrides,
} from "@/lib/gentle-images-context"
import { LanguageProvider } from "@/lib/i18n-context"

function renderToggle() {
  return render(
    createElement(
      LanguageProvider,
      null,
      createElement(
        GentleImagesProvider,
        null,
        createElement(GentleImageStyleToggle)
      )
    )
  )
}

describe("GentleImageStyleToggle", () => {
  afterEach(cleanup)

  beforeEach(() => {
    window.localStorage.clear()
  })

  it("restores only valid per-motif display mode overrides", () => {
    expect(
      parseMotifDisplayModeOverrides(
        JSON.stringify({
          "morphous-artichoke": "mosaic",
          "morphous-abalone": "normal",
          "morphous-ibex": "fluffy",
          "morphous-broken": "blurred",
          "morphous-null": null,
        })
      )
    ).toEqual({
      "morphous-artichoke": "mosaic",
      "morphous-abalone": "normal",
      "morphous-ibex": "fluffy",
    })

    expect(parseMotifDisplayModeOverrides(null)).toEqual({})
    expect(parseMotifDisplayModeOverrides("not-json")).toEqual({})
    expect(parseMotifDisplayModeOverrides("[]")).toEqual({})
  })
  it("shows three display modes, starts fluffy, and remembers normal mode", async () => {
    renderToggle()

    expect(
      screen
        .getByRole("button", { name: "ふわふわモード" })
        .getAttribute("aria-pressed")
    ).toBe("true")
    expect(
      screen.getByRole("button", { name: "モザイクモード" })
    ).not.toBeNull()
    expect(screen.getByRole("button", { name: "通常モード" })).not.toBeNull()

    fireEvent.click(screen.getByRole("button", { name: "通常モード" }))

    await waitFor(() => {
      expect(window.localStorage.getItem("morphous:motif-display-mode")).toBe(
        "normal"
      )
    })
  })

  it("migrates the previous reduced-intensity preference to normal mode", async () => {
    window.localStorage.setItem("morphous:gentle-images", "false")

    renderToggle()

    await waitFor(() => {
      expect(
        screen
          .getByRole("button", { name: "通常モード" })
          .getAttribute("aria-pressed")
      ).toBe("true")
    })
    expect(
      screen
        .getByRole("button", { name: "ふわふわモード" })
        .getAttribute("aria-pressed")
    ).toBe("false")
  })
})
