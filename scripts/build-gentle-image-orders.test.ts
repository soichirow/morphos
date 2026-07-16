import { readdirSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

import { systems } from "../src/data/systems"
import { motifPresentationFor } from "../src/domain/motif-presentation"
import { buildGentleImageOrders } from "./build-gentle-image-orders"

describe("gentle image orders", () => {
  it("covers every real catalog system that can use a gentle motif", () => {
    const expectedSlugs = systems
      .filter((system) => motifPresentationFor(system) !== "standard")
      .map((system) => system.slug)
      .sort()

    const orders = buildGentleImageOrders(systems)

    expect(orders).toHaveLength(125)
    expect(orders.map((order) => order.slug).sort()).toEqual(expectedSlugs)
    expect(new Set(orders.map((order) => order.slug))).toHaveLength(
      orders.length
    )
  })

  it("passes the real source image and truthful canonical colors to gpt-image-2", () => {
    const selectedSystems = systems.filter(
      (system) => motifPresentationFor(system) !== "standard"
    )
    const orders = buildGentleImageOrders(systems)

    for (const system of selectedSystems) {
      const order = orders.find((candidate) => candidate.slug === system.slug)

      expect(order).toBeDefined()
      expect(order?.model).toBe("gpt-image-2")
      expect(order?.sourceImage).toBe(system.assets.motif)
      expect(order?.prompt).toContain("Image 1")
      expect(order?.prompt).toContain("Do not invent colors")
      expect(order?.prompt).toContain("Do not infer unseen body parts")
      expect(order?.prompt).toContain("three-year-old child")
      expect(order?.prompt).toContain("thick wax-crayon")
      expect(order?.prompt).toContain("Do not preserve exact anatomy")
      expect(order?.output).toBe(`public/gentle-motifs/${system.slug}.webp`)

      for (const color of system.palette) {
        expect(order?.prompt).toContain(color.role)
        expect(order?.prompt).toContain(color.name)
        expect(order?.prompt).toContain(color.hex.toUpperCase())
      }
    }

    expect(new Set(orders.map((order) => order.localReference)).size).toBe(
      orders.length
    )
    expect(new Set(orders.map((order) => order.output)).size).toBe(
      orders.length
    )
    expect(new Set(orders.map((order) => order.promptFile)).size).toBe(
      orders.length
    )
  })

  it("ships one decodable WebP filename for every gentle-image order", () => {
    const expected = buildGentleImageOrders(systems)
      .map((order) => `${order.slug}.webp`)
      .sort()
    const shipped = readdirSync(resolve("public/gentle-motifs"))
      .filter((name) => name.endsWith(".webp"))
      .sort()

    expect(shipped).toHaveLength(125)
    expect(shipped).toEqual(expected)
  })
})
