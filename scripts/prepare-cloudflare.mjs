import { copyFile, mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const outputDir = resolve(".output/public")
const indexPath = resolve(outputDir, "index.html")

await mkdir(outputDir, { recursive: true })
await copyFile(indexPath, resolve(outputDir, "404.html"))
await writeFile(resolve(outputDir, ".nojekyll"), "", "utf8")

console.log("Prepared static Cloudflare Pages output:")
console.log(`- ${indexPath}`)
console.log(`- ${resolve(outputDir, "404.html")}`)
console.log(`- ${resolve(outputDir, ".nojekyll")}`)
