import { describe, expect, it } from "vitest"

import {
  filterAndSortSystems,
  normalizeGallerySearch,
  resolveSystem,
} from "./catalog"
import { systems } from "@/data/systems"
import { colorDistance } from "@/lib/color-distance"
import { systemDisplayIdentity } from "@/lib/i18n"

describe("catalog domain", () => {
  it("normalizes unknown URL search values into the supported query model", () => {
    expect(
      normalizeGallerySearch({
        system: "morphous-artichoke",
        q: "field",
        category: "plant",
        sort: "motifName",
      })
    ).toEqual({
      system: "morphous-artichoke",
      q: "field",
      category: "plant",
      sort: "motifName",
    })

    expect(
      normalizeGallerySearch({
        system: 42,
        q: "",
        category: null,
        sort: "unsupported",
      })
    ).toEqual({})
  })

  it("filters the real catalog by all search terms and category", () => {
    const result = filterAndSortSystems(systems, {
      query: "artichoke mediterranean",
      category: "plant",
      sort: "name",
      searchColor: "",
      colorRole: "Primary",
    })

    expect(result.map((system) => system.slug)).toContain("morphous-artichoke")
    expect(result.every((system) => system.motifCategory === "plant")).toBe(
      true
    )
  })

  it("filters the real catalog through a human-friendly category group", () => {
    const result = filterAndSortSystems(systems, {
      query: "",
      category: "group:small-life",
      sort: "name",
      searchColor: "",
      colorRole: "Primary",
    })

    expect(result.map((system) => system.slug)).toContain(
      "morphous-emerald-cockroach"
    )
    expect(result.map((system) => system.slug)).toContain(
      "morphous-banana-slug"
    )
    expect(result.some((system) => system.motifCategory === "flower")).toBe(
      false
    )
  })

  it("finds a real catalog system by its Japanese display name", () => {
    const localizedIdentities = Object.fromEntries(
      systems.map((system) => [
        system.slug,
        systemDisplayIdentity("ja", system),
      ])
    )

    const result = filterAndSortSystems(systems, {
      query: "アーティチョーク",
      category: "all",
      sort: "name",
      searchColor: "",
      colorRole: "Primary",
      localizedIdentities,
    })

    expect(result.map((system) => system.slug)).toContain("morphous-artichoke")
  })

  it("sorts the real catalog by its Japanese display names", () => {
    const localizedIdentities = Object.fromEntries(
      systems.map((system) => [
        system.slug,
        systemDisplayIdentity("ja", system),
      ])
    )

    const result = filterAndSortSystems(systems, {
      query: "",
      category: "all",
      sort: "name",
      searchColor: "",
      colorRole: "Primary",
      localizedIdentities,
    })
    const names = result.map(
      (system) => localizedIdentities[system.slug]?.name ?? system.name
    )

    expect(names).toEqual(
      [...names].sort((left, right) => left.localeCompare(right, "ja"))
    )
  })

  it("orders color matches by measured distance", () => {
    const result = filterAndSortSystems(systems, {
      query: "",
      category: "all",
      sort: "color",
      searchColor: "#8FA884",
      colorRole: "Primary",
    })
    const distances = result.slice(0, 10).map((system) => {
      const hex =
        system.palette.find((color) => color.role === "Primary")?.hex ??
        "#000000"
      return colorDistance("#8FA884", hex)
    })

    expect(distances).toEqual([...distances].sort((a, b) => a - b))
  })

  it("resolves a valid deep link and falls back for an unknown slug", () => {
    expect(resolveSystem(systems, "morphous-artichoke").slug).toBe(
      "morphous-artichoke"
    )
    expect(resolveSystem(systems, "missing").slug).toBe(
      resolveSystem(systems, undefined).slug
    )
  })
})
