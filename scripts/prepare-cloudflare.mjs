import { copyFile, mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

import { writeDiscoveryFiles } from "./build-sitemap.mjs"

const outputDir = resolve(".output/public")
const indexPath = resolve(outputDir, "index.html")

await mkdir(outputDir, { recursive: true })
await copyFile(indexPath, resolve(outputDir, "404.html"))
const discoveryResult = await writeDiscoveryFiles()
await writeFile(resolve(outputDir, ".nojekyll"), "", "utf8")

console.log("Prepared static Cloudflare Pages output:")
console.log(`- ${indexPath}`)
console.log(`- ${resolve(outputDir, "404.html")}`)
console.log(`- ${resolve(outputDir, ".nojekyll")}`)
console.log(
  `- ${discoveryResult.outputPath} (${discoveryResult.urlCount} URLs)`
)
console.log(`- ${discoveryResult.robotsPath}`)
