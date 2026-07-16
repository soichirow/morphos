import fs from "node:fs/promises"
import path from "node:path"
import {
  CORE_PALETTE_ROLES,
  REQUIRED_TOKEN_KEYS,
} from "../src/domain/morphous-system-constants.js"

const ROOT = process.cwd()
const dataPath = path.join(ROOT, "src", "data", "systems.json")

function assertAssetPath(assetPath, slug, label) {
  assert(
    typeof assetPath === "string" &&
      assetPath.startsWith(`/systems/${slug}/`),
    `${slug} ${label} must use its canonical /systems path`
  )
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
    for (const role of CORE_PALETTE_ROLES) {
      assert(
        system.palette.filter((color) => color.role === role).length === 1,
        `${system.slug} must include exactly one ${role} palette role`
      )
    }
    for (const token of REQUIRED_TOKEN_KEYS) {
      assert(system.tokens[token], `${system.slug} missing light token ${token}`)
      assert(system.darkTokens[token], `${system.slug} missing dark token ${token}`)
    }
    assertAssetPath(system.assets.motif, system.slug, "motif")
    assertAssetPath(system.assets.board, system.slug, "board")
    assertAssetPath(system.assets.darkBoard, system.slug, "dark board")
    if (system.assets.hero) assertAssetPath(system.assets.hero, system.slug, "hero")
    if (system.assets.texture) assertAssetPath(system.assets.texture, system.slug, "texture")
    assertAssetPath(system.assets.themeCss, system.slug, "theme CSS")
    assertAssetPath(system.assets.themeJson, system.slug, "theme JSON")
    assertAssetPath(system.assets.promptsJson, system.slug, "prompts JSON")
    assert(system.prompts.length >= 3, `${system.slug} must include reusable image prompts`)
    for (const prompt of system.prompts) {
      assert(prompt.id && prompt.label && prompt.asset && prompt.prompt, `${system.slug} has an incomplete prompt entry`)
      assertAssetPath(prompt.asset, system.slug, `prompt ${prompt.id}`)
    }
    assert(Array.isArray(system.assets.examples), `${system.slug} examples must be an array`)
    for (const example of system.assets.examples) {
      assert(example.id && example.label && example.image, `${system.slug} has an incomplete example entry`)
      assertAssetPath(example.image, system.slug, `example ${example.id}`)
    }
  }

  process.stdout.write(`Validated ${systems.length} Morphous systems.\n`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
