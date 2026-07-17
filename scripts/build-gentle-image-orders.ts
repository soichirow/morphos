import type { MorphousSystem } from "../src/domain/morphous-system.ts"

export type GentleImageOrder = {
  slug: string
  model: "gpt-image-2"
  sourceImage: string
  localReference: string
  output: string
  prompt: string
  promptFile: string
  size: "1024x1024"
  quality: "medium"
}

function scribbleConstraintsFor(category: string): string {
  if (category === "insect" || category === "crustacean") {
    return "Reduce the subject to one or two crooked blobs and only a few wrong-count stick lines. Do not preserve exact anatomy, leg count, joints, segments, or shell detail."
  }
  if (category === "reptile") {
    return "Reduce the subject to one thick wobbly line or lopsided oval. Do not draw a recognizable head, scales, teeth, eyes, or exact anatomy."
  }
  if (category === "marine" || category === "mollusk") {
    return "Use one soft blob with a few mismatched squiggles. Remove suckers, pores, wetness, translucency, and exact anatomy; keep only a few oversized identity-defining color marks."
  }
  if (category === "fungi" || category === "plant") {
    return "Use a crooked stick-and-blob or lollipop shape. Replace holes, spores, gills, and pores with at most a few loose loop scribbles."
  }
  if (category === "mammal" || category === "bird" || category === "fish") {
    return "Use one body blob and only the broadest crooked appendage marks. Remove the face, teeth, claws, fur, feathers, fins, bones, and exact anatomy."
  }
  return "Use one or two lopsided blobs and a few loose squiggles. Do not preserve exact anatomy or realistic surface detail."
}

function buildPrompt(system: MorphousSystem): string {
  const palette = system.palette
    .map((color) => `- ${color.role}: ${color.name} (${color.hex.toUpperCase()})`)
    .join("\n")

  return `Use case: reference-guided toddler scribble
Asset type: intentionally unskilled Morphous crayon doodle
Subject: ${system.motifName}
Canonical subject identifier: ${system.motif}
Category: ${system.motifCategory}
Input images: Image 1 is authoritative only for the dominant natural hue families and the broad placement of identity-defining colors. Do not copy its realistic detail.

Primary request:
Draw a deliberately clumsy picture of "${system.motifName}" / "${system.motif}" as if a three-year-old child made one quick attempt with thick wax-crayon. Make it much less accurate than a professional illustration: wobbly edges, uneven pressure, gaps, overshoots, coloring outside the line, awkward proportions, and strong asymmetry.

Style:
Use only two to four broad source-derived colors. Prefer one or two lopsided blobs and a few loose crooked marks. No clean vector edges, polished icon geometry, symmetry, realistic anatomy, surface detail, shading, gradients, highlights, shadows, depth, or mascot treatment. No face unless the motif is literally an eye, and even then draw only an abstract loop.

Composition:
Exact square 1:1 canvas. Leave generous empty space on a plain warm off-white paper background. If Image 1 shows only a wing, eye, trail, shell, body part, or fragment, scribble only that fragment. Do not infer unseen body parts or complete the whole animal.

Canonical Morphous palette (role: name, exact HEX):
${palette}

Color truth requirements:
- Treat Image 1 and the canonical palette above as the only color authorities.
- Preserve the dominant hue families and the broad order of essential bands, rings, or large markings.
- Do not invent colors or add fantasy hues.
- Do not force every palette swatch onto the subject.
- Imperfect crayon coverage is required, but it must not shift a source hue into another hue family.

Category-specific abstraction:
${scribbleConstraintsFor(system.motifCategory)}

Constraints:
No photorealism, clean editorial illustration, professional icon design, creepy microtexture, wet gloss, pores, hair, scales, joints, teeth, claws, gore, attack pose, extra animals, extra objects, text, letters, logos, borders, cast shadows, or watermarks. Do not preserve exact anatomy. Never add a whole creature around a referenced fragment. The result should feel harmless and closer to an abstract toddler scribble than the real subject.`
}

export function buildGentleImageOrders(
  systems: ReadonlyArray<MorphousSystem>
): Array<GentleImageOrder> {
  return systems.map((system) => ({
      slug: system.slug,
      model: "gpt-image-2",
      sourceImage: system.assets.motif,
      localReference: `tmp/imagegen/references/${system.slug}.png`,
      output: `public/gentle-motifs/${system.slug}.webp`,
      prompt: buildPrompt(system),
      promptFile: `tmp/imagegen/prompts/${system.slug}.txt`,
      size: "1024x1024",
      quality: "medium",
    }))
}
