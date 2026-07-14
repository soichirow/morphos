import { describe, expect, it } from "vitest"

import { previewSources } from "./asset-preview"

describe("previewSources", () => {
  it("元サイトの絶対URLから軽量プレビューURLを生成する", () => {
    expect(
      previewSources(
        "https://morphos.ameyanagi.com/systems/morphous-zinnia/motif.png",
        { kind: "motif", sizes: "240px" }
      )
    ).toMatchObject({
      src: "https://morphos.ameyanagi.com/systems/morphous-zinnia/previews/motif.webp",
      width: 640,
      height: 640,
      sources: [
        {
          type: "image/avif",
          srcSet:
            "https://morphos.ameyanagi.com/systems/morphous-zinnia/previews/motif-360.avif 360w, https://morphos.ameyanagi.com/systems/morphous-zinnia/previews/motif.avif 640w",
          sizes: "240px",
        },
        {
          type: "image/webp",
          srcSet:
            "https://morphos.ameyanagi.com/systems/morphous-zinnia/previews/motif-360.webp 360w, https://morphos.ameyanagi.com/systems/morphous-zinnia/previews/motif.webp 640w",
          sizes: "240px",
        },
      ],
    })
  })
})
