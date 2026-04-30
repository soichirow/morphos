# Morphous Prompt Patterns

Use these as starting points. Replace bracketed fields and keep final prompts in `public/systems/{slug}/prompts.json`.

## Transparent Motif

```text
Use case: photorealistic-natural
Asset type: Morphous transparent motif cutout
Primary request: Create only [motif subject], isolated full subject, no environment, no props, no text.
Subject: [motif subject] with accurate anatomy/form, natural texture, markings, material, and posture/shape.
Composition/framing: centered complete cutout with generous padding; do not crop the subject.
Lighting/mood: clean studio light that preserves natural color and material detail.
Transparent workflow: place the subject on a perfectly flat solid [key color] chroma-key background for removal. The background must be one uniform color with no shadows, gradients, texture, reflections, floor plane, or lighting variation. Do not use [key color] anywhere in the subject.
Constraints: no text, no watermark, no props, no landscape, no decorative background, no second subject.
```

## Light Design-System Board

```text
Use case: ui-mockup
Asset type: Morphous light-mode design-system board
Primary request: Generate a comprehensive light-mode design-system board derived from the provided [motif subject] cutout.
Reference use: Extract palette, texture rhythm, contrast, spacing mood, and interaction language from the motif image. The board must visibly respect the motif colors.
Canvas: wide 16:9 board.
Resolution and legibility: high-resolution 4K-class source board, at least 2400px wide when available. Use large readable labels and avoid dense tiny text.
Required visible sections: title, motif story, palette, typography, Japanese typography, components, navigation, dashboard/data, forms, table, command/search, status states, texture, radius, spacing, shadow, tokens, generated asset examples.
Typography: include English and Japanese examples; choose font guidance that would work for multilingual product UI.
Style/medium: premium shadcn/tweakcn-style product design system, realistic UI mockup, precise grid, 8px card radius unless the motif clearly suggests otherwise.
Color palette: use only motif-derived colors plus near-neutrals from the motif.
Text: use short readable UI labels; avoid long paragraphs.
Constraints: no unrelated bright colors, no generic purple/blue gradients, no watermark, no random brand names.
```

## Dark Design-System Board

```text
Use case: ui-mockup
Asset type: Morphous dark-mode design-system board
Primary request: Generate a dark-mode version of the [system name] design-system board. It must feel like the same system translated to dark mode, not a new theme.
Reference use: Use the transparent motif and light design-system board as references. Preserve motif-derived palette roles, component language, texture, spacing, and typography.
Canvas: wide 16:9 board.
Resolution and legibility: high-resolution 4K-class source board, at least 2400px wide when available. Use large readable labels and avoid dense tiny text.
Required visible sections: title, Dark Mode, palette, typography, Japanese typography, components, navigation, dashboard/data, forms, table, command/search, status states, texture, radius, spacing, shadow, tokens, generated asset examples.
Visual details: dark background derived from the motif's deepest colors, light text from motif highlights, restrained contrast, subtle motif texture overlays, crisp shadcn-style cards and controls.
Text: use short readable UI labels; avoid long paragraphs.
Constraints: no neon colors, no flat pure-black background unless the motif requires it, no unrelated saturated colors, no illegible text, no random brand names.
```

## Website Hero Asset

```text
Use case: ui-mockup
Asset type: Morphous website hero/background asset
Primary request: Create a polished website hero image in the exact visual style of the [system name] design-system boards.
Reference use: Use the motif cutout and both design-system boards as style references.
Composition: wide 16:9 banner with visual interest on one side and low-detail negative space reserved for live HTML text.
Visual details: motif-derived texture, environmental/context shapes, refined neutral palette, subtle paper/material grain, crisp but minimal UI accents.
Text: no readable text, no letters, no numbers, no logos, no watermark.
Constraints: no stock-photo look, no busy background behind text area, no unrelated colors.
```

## Texture Or Background Asset

```text
Use case: stylized-concept
Asset type: Morphous texture/background asset
Primary request: Create a seamless-feeling texture tile in the exact visual style of the [system name] boards.
Reference use: Use the motif cutout and design-system boards as references.
Composition: square 1:1 all-over pattern, no central subject, suitable for CSS backgrounds, card accents, and preview panels.
Visual details: motif-derived markings/materials, low-to-medium contrast, tactile texture, no hard seams.
Text: no readable text, no letters, no numbers, no logos, no watermark.
Constraints: no UI elements, no unrelated saturated colors, no noisy camouflage unless the motif requires it.
```

## Example App Preview

```text
Use case: ui-mockup
Asset type: Morphous themed app example
Primary request: Generate a polished [dashboard/workflow/content/table/settings] screen in the exact style of the [system name] design system.
Reference use: Use the motif cutout plus light and dark boards as references.
Canvas: 16:9 desktop web app screen.
Required visible sections: [list expected UI sections].
Style: shadcn/tweakcn-compatible product UI, theme-token driven, precise grid, motif-derived palette and texture.
Text: short readable interface labels only.
Constraints: no unrelated colors, no random logos, no marketing hero layout, no unreadable tiny paragraphs.
```
