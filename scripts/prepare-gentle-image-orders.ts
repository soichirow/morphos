import { mkdir, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { systems } from "../src/data/systems.ts"
import { buildGentleImageOrders } from "./build-gentle-image-orders.ts"
import type { GentleImageOrder } from "./build-gentle-image-orders.ts"

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")

async function mapWithConcurrency<T>(
  values: ReadonlyArray<T>,
  concurrency: number,
  operation: (value: T) => Promise<void>
): Promise<void> {
  let nextIndex = 0

  async function worker(): Promise<void> {
    while (nextIndex < values.length) {
      const index = nextIndex
      nextIndex += 1
      const value = values[index]
      if (value !== undefined) await operation(value)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, () => worker())
  )
}

async function downloadReference(order: GentleImageOrder): Promise<void> {
  const response = await fetch(order.sourceImage, {
    headers: { "User-Agent": "morphos-ja-gentle-image-preparer/1.0" },
  })
  const contentType = response.headers.get("content-type") ?? ""

  if (!response.ok) {
    throw new Error(
      `Failed to download ${order.slug}: ${response.status} ${response.statusText}`
    )
  }
  if (!contentType.toLowerCase().startsWith("image/")) {
    throw new Error(
      `Expected an image for ${order.slug}, received ${contentType || "unknown"}`
    )
  }

  const destination = resolve(projectRoot, order.localReference)
  const bytes = new Uint8Array(await response.arrayBuffer())
  if (bytes.byteLength === 0) {
    throw new Error(`Downloaded an empty image for ${order.slug}`)
  }

  await mkdir(dirname(destination), { recursive: true })
  await writeFile(destination, bytes)
}

async function main(): Promise<void> {
  const orders = buildGentleImageOrders(systems)
  const manifestPath = resolve(projectRoot, "tmp/imagegen/gentle-orders.json")

  await Promise.all(
    orders.map(async (order) => {
      const promptPath = resolve(projectRoot, order.promptFile)
      await mkdir(dirname(promptPath), { recursive: true })
      await writeFile(promptPath, `${order.prompt}\n`, "utf8")
    })
  )

  await mkdir(dirname(manifestPath), { recursive: true })
  await writeFile(manifestPath, `${JSON.stringify(orders, null, 2)}\n`, "utf8")
  await mapWithConcurrency(orders, 8, downloadReference)

  process.stdout.write(
    `Prepared ${orders.length} gpt-image-2 orders and source references.\n`
  )
}

await main()
