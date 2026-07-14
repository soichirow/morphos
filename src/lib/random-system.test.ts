import { describe, expect, it } from "vitest"

import { pickRandomSystemSlug } from "./random-system"

describe("pickRandomSystemSlug", () => {
  it("selects a different system when alternatives exist", () => {
    expect(pickRandomSystemSlug(["a", "b", "c"], "a", () => 0)).toBe("b")
    expect(pickRandomSystemSlug(["a", "b", "c"], "a", () => 0.999)).toBe("c")
  })

  it("deduplicates candidates before selection", () => {
    expect(pickRandomSystemSlug(["a", "b", "b"], "a", () => 0.8)).toBe("b")
  })

  it("keeps the only available system and handles an empty catalog", () => {
    expect(pickRandomSystemSlug(["a"], "a", () => 0)).toBe("a")
    expect(pickRandomSystemSlug([], "a", () => 0)).toBeUndefined()
  })
})
