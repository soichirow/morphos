---
name: morphous-catalog
description: Create or refresh Morphous website design-system/theme bundles from animal, insect, plant, landscape, mineral, weather, or other nature motifs. Use when Codex is asked to generate Morphous motif images, light/dark design-system boards, reusable image prompts, generated web assets, shadcn/tweakcn theme exports, or the Morphous themed component gallery.
---

# Morphous Catalog

## Core Rule

Morphous is a website for browsing motif-driven design systems and shadcn/tweakcn-compatible themes. Generate creative bitmap assets with the Codex image tool (`imagegen` skill), not repo scripts. Scripts may assemble metadata, sample colors, remove chroma-key backgrounds, write theme files, and validate assets, but they must not fabricate the motif, design-system boards, or generated web example images.

Use Bun for project commands (`bun run ...`). If a Python helper or validator is needed, run it through `uv` (for example `uv run --with pyyaml python ...`); do not call `python` or `python3` directly. Do not create or update PowerPoint output unless the user explicitly reintroduces that requirement.

## Motif Workflow

1. Pick or confirm one system identity: `slug`, display name, motif subject, motif category (`animal`, `insect`, `plant`, `landscape`, `mineral`, `weather`, etc.), biome/context, and design mood.
2. Generate the motif first as an isolated transparent-background asset. For the built-in image tool, use the `imagegen` transparent workflow: generate on a flat removable chroma-key background, remove it locally, then validate alpha. Save the final PNG to `public/systems/{slug}/motif.png` or `animal.png` when preserving an older bundle contract.
3. Generate `design-system-light.png` from the motif image as a source reference. It must be one comprehensive high-resolution board containing palette, typography, multilingual type guidance, components, navigation, dashboard/data, forms, texture, spacing/radius/shadow tokens, and sample usage.
4. Generate `design-system-dark.png` as a separate high-resolution image-tool call from the same motif and light board. It must feel like the same system translated to dark mode.
5. Generate additional web assets only when useful: `hero.png`, `texture.png`, `background.png`, example app screens, pattern crops, or card imagery. Keep these derived from the motif and boards.
6. Record every final image-generation prompt in that system's `public/systems/{slug}/prompts.json`. Prompts are user-facing assets; include enough detail for users to reuse them.
7. Record system identity, palette, theme references, and asset paths in that system's `public/systems/{slug}/system.json`.
8. Derive and export shadcn/tweakcn theme tokens from the motif and boards, then update catalog metadata and website routes.
9. Validate the theme, generated assets, catalog, and app before finishing.

## Asset Contract

Each Morphous system should write:

- `public/systems/{slug}/motif.png` or `animal.png` for legacy systems
- `public/systems/{slug}/design-system-light.png` or `design-system.png` for legacy systems
- `public/systems/{slug}/design-system-dark.png`
- `public/systems/{slug}/theme.css`
- `public/systems/{slug}/theme.json`
- `public/systems/{slug}/prompts.json`
- `public/systems/{slug}/system.json`
- Optional generated assets: `hero.png`, `texture.png`, `background.png`, `examples/*.png`

Catalog metadata must be written to `src/data/systems.json` and `src/data/systems.ts`. Metadata should include:

- motif identity and category
- light and dark design-system board paths
- shadcn/tweakcn tokens for light and dark mode
- generated assets
- reusable prompts

Prompts and system metadata are canonical inside each individual system folder. Do not hard-code a new theme's prompts, palette, or asset list in the shared catalog generator.

## Design-System Board Rules

- The motif image is the source of truth. Sample or derive visible colors from the motif, not a generic theme.
- Generate light and dark boards as separate image-tool calls.
- Design-system boards must be high-resolution source assets. Target 4K-class 16:9 output and accept at least 2400px wide when the active image tool path supports it. If the saved board is below 2000px wide, visibly blurry, or has unreadable labels, regenerate before cataloging it.
- Keep text large enough to survive gallery preview downscaling. Do not overpack tiny token tables; use fewer, larger rows if needed so palette names, typography labels, and component labels remain legible.
- Include typography guidance for English and Japanese. Add multilingual guidance for other scripts when the motif or target audience suggests it.
- Include enough UI coverage to guide implementation: buttons, inputs, selects, textarea, checkboxes, radio, switch, tabs, badges, alerts, cards, tables, command/search, navigation, dashboard charts, empty/error/loading states, spacing, radius, border, shadow, texture, and icons.
- Keep colors faithful to the motif: body/fur/wing/petal/stone/water colors, markings, shadows, highlights, and environmental context.
- Avoid unrelated saturated colors, generic purple/blue gradients, stock UI kits, illegible text, and one-note palettes.

## Theme Rules

- Export semantic shadcn/tweakcn CSS variables: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-*`, `sidebar-*`, and `radius`.
- Include dark-mode tokens.
- Keep `theme.css` directly downloadable and compatible with a shadcn/Tailwind CSS-variable setup.
- Keep `theme.json` suitable for a tweakcn-like editor/import flow: identity, motif metadata, palette, light tokens, dark tokens, generated assets, and prompts.
- When the motif changes in the gallery, the preview surface should switch the active CSS variables and generated assets.
- The shared `generate:catalog` script should scan per-system manifests and prompt files. Adding a new theme should require creating or updating that theme's system folder, not recreating or specializing the shared script.

## Website Requirements

- Build the real themed gallery, not a landing page.
- The gallery must provide theme/motif selection, light/dark toggle, search/filtering, and preview areas.
- The active theme should style the gallery itself and the component preview surface.
- Show all available shadcn components already present in the repo; when adding components, follow local shadcn patterns and keep them theme-token driven.
- Provide downloads for `theme.css`, `theme.json`, `prompts.json`, and generated assets.
- Surface reusable prompts in the catalog UI; prompts are first-class output, not hidden implementation notes.
- Generated images should be visible where they help users understand the theme: motif cutout, light/dark boards, hero/background/texture assets, and example app previews.

## Sub-Agent Guidance

Use sub-agents only after a single motif workflow has been validated and the user asks to generate multiple themes. Split by motif/system so each worker owns a disjoint output folder, for example `public/systems/morphous-dragonfly` versus `public/systems/morphous-lichen`. Tell workers they are not alone in the codebase and must not overwrite shared gallery/schema files without coordinating through the parent agent.

When sub-agents generate images concurrently, do not let them copy the newest global generated image blindly. The built-in image tool saves to a shared generated-images directory, so each worker must snapshot that directory before each image call and copy only the new file produced after that call. Avoid commands like `ls -t ... | head -1` unless the worker is the only active image generator.

## Validation

Run relevant checks with Bun before final response:

```bash
bun run generate:catalog
bun run validate:catalog
bun run lint
bun run typecheck
bun run build
```

Use asset-specific checks as needed:

```bash
file public/systems/{slug}/*.png
shasum -a 256 public/systems/{slug}/*.png
```

For design-system board dimensions, inspect the generated files and regenerate if they are too small or illegible:

```bash
file public/systems/{slug}/design-system*.png
```

For transparent motif validation, inspect alpha or use the `imagegen` transparent-output checks.

## Prompt Patterns

For concrete reusable prompt templates, read `references/prompt-patterns.md` when writing or revising Morphous image prompts.
