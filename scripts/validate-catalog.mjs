import fs from "node:fs/promises"
import path from "node:path"

const ROOT = process.cwd()
const dataPath = path.join(ROOT, "src", "data", "systems.json")
const requiredTokens = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
  "radius",
]

async function exists(publicPath) {
  const file = path.join(ROOT, "public", publicPath.replace(/^\//, ""))
  await fs.access(file)
  return file
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function main() {
  const systems = JSON.parse(await fs.readFile(dataPath, "utf8"))
  const expectedSystems = Number(process.env.MORPHOUS_EXPECTED_SYSTEMS ?? systems.length)
  assert(systems.length === expectedSystems, `Expected ${expectedSystems} systems, found ${systems.length}`)
  const slugs = new Set(systems.map((system) => system.slug))
  assert(slugs.size === systems.length, "System slugs must be unique")

  for (const system of systems) {
    assert(system.motifName, `${system.slug} must include a motif name`)
    assert(system.motifCategory, `${system.slug} must include a motif category`)
    assert(system.palette.length >= 6, `${system.slug} must have at least 6 palette colors`)
    for (const token of requiredTokens) {
      assert(system.tokens[token], `${system.slug} missing light token ${token}`)
      assert(system.darkTokens[token], `${system.slug} missing dark token ${token}`)
    }
    await exists(system.assets.motif)
    await exists(system.assets.board)
    await exists(system.assets.darkBoard)
    if (system.assets.hero) await exists(system.assets.hero)
    if (system.assets.texture) await exists(system.assets.texture)
    await exists(system.assets.themeCss)
    await exists(system.assets.themeJson)
    await exists(system.assets.promptsJson)
    assert(system.prompts.length >= 3, `${system.slug} must include reusable image prompts`)
    for (const prompt of system.prompts) {
      assert(prompt.id && prompt.label && prompt.asset && prompt.prompt, `${system.slug} has an incomplete prompt entry`)
      await exists(prompt.asset)
    }
    assert(Array.isArray(system.assets.examples), `${system.slug} examples must be an array`)
    for (const example of system.assets.examples) {
      assert(example.id && example.label && example.image, `${system.slug} has an incomplete example entry`)
      await exists(example.image)
    }
  }

  process.stdout.write(`Validated ${systems.length} Morphous systems.\n`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
