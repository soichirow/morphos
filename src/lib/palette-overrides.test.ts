import { describe, expect, it } from "vitest"

import {
  applyPaletteOverrides,
  parsePaletteOverrides,
  setPaletteOverride,
} from "./palette-overrides"
import { systems } from "@/data/systems"
import { resolveSystem } from "@/domain/catalog"


describe("palette overrides", () => {
  const system = resolveSystem(systems, undefined)
  const firstColor = system.palette[0]
  if (!firstColor) throw new Error("A Morphous system must have a palette")
  const role = firstColor.role

  it("restores only valid role and hex overrides from persisted JSON", () => {
    const parsed = parsePaletteOverrides(
      JSON.stringify({
        [system.slug]: {
          [role]: "#123ABC",
          UnknownRole: "#FFFFFF",
          Primary: "not-a-color",
        },
      }),
      systems
    )

    expect(parsed).toEqual({
      [system.slug]: { [role]: "#123ABC" },
    })
  })

  it.each([null, "null", "[]", "{bad json", `{"${system.slug}":null}`])(
    "treats malformed persisted state %s as empty",
    (raw) => {
      expect(parsePaletteOverrides(raw, systems)).toEqual({})
    }
  )

  it("updates and applies an override without mutating the catalog system", () => {
    const all = setPaletteOverride({}, system, role, "#123ABC")
    const tuned = applyPaletteOverrides(system, all[system.slug] ?? {})

    expect(tuned.palette[0]?.hex).toBe("#123ABC")
    expect(system.palette[0]?.hex).not.toBe("#123ABC")
  })
})
