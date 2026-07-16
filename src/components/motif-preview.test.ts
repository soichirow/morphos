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

import { MotifPreview } from "./motif-preview"
import { systems } from "@/data/systems"
import { GentleImagesProvider } from "@/lib/gentle-images-context"
import { LanguageProvider } from "@/lib/i18n-context"

function renderPreview(slug = "morphous-emerald-cockroach") {
  const system = systems.find(
    (candidate) => candidate.slug === slug
  )
  if (!system) throw new Error("real catalog fixture is missing")

  const preview = createElement(MotifPreview, {
    system,
    label: system.motifName,
    allowReveal: true,
  })
  const result = render(
    createElement(
      LanguageProvider,
      null,
      createElement(GentleImagesProvider, null, preview)
    )
  )

  return { ...result, system }
}

function realMotifNode(container: HTMLElement, slug: string) {
  return container.querySelector(
    `[src*="/systems/${slug}/previews/motif"], [srcset*="/systems/${slug}/previews/motif"]`
  )
}

describe("MotifPreview", () => {
  afterEach(cleanup)

  beforeEach(() => {
    window.localStorage.clear()
  })

  it("shows the toddler scribble pilot without loading the real motif", () => {
    const { container, system } = renderPreview()

    expect(
      container.querySelector(
        `img[src="/gentle-motifs/${system.slug}.webp"]`
      )
    ).not.toBeNull()
    expect(realMotifNode(container, system.slug)).toBeNull()
  })

  it("uses a shipped scribble for a non-pilot gentle motif", () => {
    const { container, system } = renderPreview("morphous-stag-beetle")

    expect(
      container.querySelector(
        `img[src="/gentle-motifs/${system.slug}.webp"]`
      )
    ).not.toBeNull()
    expect(realMotifNode(container, system.slug)).toBeNull()
  })

  it("falls back to mosaic for a motif without a shipped scribble", () => {
    const { container, system } = renderPreview("morphous-artichoke")

    expect(
      screen.getByRole("img", { name: `${system.motifName}のモザイク表示` })
    ).not.toBeNull()
    expect(realMotifNode(container, system.slug)).not.toBeNull()
    expect(
      container.querySelector(
        `img[src="/gentle-motifs/${system.slug}.webp"]`
      )
    ).toBeNull()
  })

  it("uses a blurred mosaic presentation when the user selects mosaic mode", async () => {
    window.localStorage.setItem("morphous:motif-display-mode", "mosaic")
    const { container, system } = renderPreview()

    await waitFor(() => {
      expect(
        screen.getByRole("img", { name: `${system.motifName}のモザイク表示` })
      ).not.toBeNull()
    })
    expect(realMotifNode(container, system.slug)).not.toBeNull()
    expect(
      container.querySelector(
        `img[src="/gentle-motifs/${system.slug}.webp"]`
      )
    ).toBeNull()
  })

  it("loads the real motif only after the user explicitly reveals it", async () => {
    const { container, system } = renderPreview()

    fireEvent.click(screen.getByRole("button", { name: "元の画像を表示" }))

    await waitFor(() => {
      expect(realMotifNode(container, system.slug)).not.toBeNull()
    })
  })
})
