import { describe, expect, it } from "vitest"

import {
  motifPresentationFor,
  shouldUseGentleMotif,
} from "./motif-presentation"
import { systems } from "@/data/systems"

describe("motif presentation safety", () => {
  it("uses a gentle illustration by default for potentially uncomfortable real catalog motifs", () => {
    const insect = systems.find(
      (system) => system.slug === "morphous-emerald-cockroach"
    )
    const mollusk = systems.find(
      (system) => system.slug === "morphous-banana-slug"
    )
    const snake = systems.find(
      (system) => system.slug === "morphous-rattlesnake"
    )
    const flower = systems.find(
      (system) => system.slug === "morphous-cherry-blossom"
    )

    expect(insect).toBeDefined()
    expect(mollusk).toBeDefined()
    expect(snake).toBeDefined()
    expect(flower).toBeDefined()
    expect(motifPresentationFor(insect!)).toBe("default-stylized")
    expect(motifPresentationFor(mollusk!)).toBe("default-stylized")
    expect(motifPresentationFor(snake!)).toBe("default-stylized")
    expect(motifPresentationFor(flower!)).toBe("standard")
  })

  it("classifies every real system without broad category false positives", () => {
    const counts = systems.reduce<
      Partial<Record<ReturnType<typeof motifPresentationFor>, typeof systems>>
    >((groups, system) => {
      const policy = motifPresentationFor(system)
      groups[policy] = [...(groups[policy] ?? []), system]
      return groups
    }, {})

    expect(counts["default-stylized"]).toHaveLength(68)
    expect(counts["safe-optional"]).toHaveLength(57)
    expect(counts.standard).toHaveLength(486)
    expect(
      motifPresentationFor(
        systems.find((system) => system.slug === "morphous-albatross")!
      )
    ).toBe("standard")
    expect(
      motifPresentationFor(
        systems.find((system) => system.slug === "morphous-tortoise")!
      )
    ).toBe("standard")
    expect(shouldUseGentleMotif("fluffy")).toBe(true)
    expect(shouldUseGentleMotif("mosaic")).toBe(true)
  })

  it("protects every catalog motif while cautious display is enabled", () => {
    const formerlyStandard = systems.find(
      (system) => system.slug === "morphous-artichoke"
    )

    expect(formerlyStandard).toBeDefined()
    expect(motifPresentationFor(formerlyStandard!)).toBe("standard")
    expect(shouldUseGentleMotif("fluffy")).toBe(true)
    expect(shouldUseGentleMotif("normal")).toBe(false)
    expect(shouldUseGentleMotif("fluffy", true)).toBe(false)
  })
})
