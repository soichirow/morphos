import { describe, expect, it } from "vitest"

import { readStorageItem, writeStorageItem } from "./browser-storage"

describe("browser storage boundary", () => {
  it("preserves normal storage reads and writes", () => {
    const values = new Map<string, string>()
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    }

    expect(writeStorageItem(storage, "favorites", '["a"]')).toBe(true)
    expect(readStorageItem(storage, "favorites")).toBe('["a"]')
  })

  it("turns unavailable storage into a non-fatal empty read", () => {
    const unavailable = {
      getItem(): string | null {
        throw new DOMException("blocked", "SecurityError")
      },
      setItem(): void {
        throw new DOMException("blocked", "SecurityError")
      },
    }

    expect(readStorageItem(unavailable, "favorites")).toBeNull()
    expect(writeStorageItem(unavailable, "favorites", "[]")).toBe(false)
  })

  it("does not hide programmer errors outside the storage operations", () => {
    let writes = 0
    const storage = {
      getItem: () => null,
      setItem: () => {
        writes += 1
      },
    }

    expect(writeStorageItem(storage, "palette", "{}" )).toBe(true)
    expect(writes).toBe(1)
  })
})
