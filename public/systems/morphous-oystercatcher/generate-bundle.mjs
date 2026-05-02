import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const slug = "morphous-oystercatcher";
const basePath = `/systems/${slug}`;
const motifData = readFileSync(new URL("./motif.png", import.meta.url)).toString("base64");
const motifHref = `data:image/png;base64,${motifData}`;

const palette = [
  ["Background", "Surf White", "#f7f8f6", "oklch(0.978 0.005 120)"],
  ["Ink", "Plumage Black", "#111315", "oklch(0.181 0.006 240)"],
  ["Primary", "Beak Red", "#e33b1f", "oklch(0.602 0.202 34)"],
  ["Secondary", "Sea Grey", "#728087", "oklch(0.590 0.023 220)"],
  ["Accent", "Eye Ring", "#ff6a3d", "oklch(0.707 0.177 42)"],
  ["Signal", "Feather White", "#ffffff", "oklch(1 0 0)"],
  ["Surface", "Mist Panel", "#e8eceb", "oklch(0.932 0.007 185)"],
  ["Muted", "Rock Lichen", "#9ba19c", "oklch(0.689 0.010 145)"],
  ["Depth", "Basalt", "#2b3033", "oklch(0.306 0.009 235)"],
];

const light = {
  background: "oklch(0.978 0.005 120)",
  foreground: "oklch(0.181 0.006 240)",
  card: "oklch(1 0 0)",
  "card-foreground": "oklch(0.181 0.006 240)",
  popover: "oklch(1 0 0)",
  "popover-foreground": "oklch(0.181 0.006 240)",
  primary: "oklch(0.602 0.202 34)",
  "primary-foreground": "oklch(1 0 0)",
  secondary: "oklch(0.932 0.007 185)",
  "secondary-foreground": "oklch(0.306 0.009 235)",
  muted: "oklch(0.932 0.007 185)",
  "muted-foreground": "oklch(0.423 0.012 225)",
  accent: "oklch(0.707 0.177 42)",
  "accent-foreground": "oklch(0.181 0.006 240)",
  destructive: "oklch(0.602 0.202 34)",
  border: "oklch(0.830 0.011 205)",
  input: "oklch(0.830 0.011 205)",
  ring: "oklch(0.602 0.202 34)",
  "chart-1": "oklch(0.602 0.202 34)",
  "chart-2": "oklch(0.590 0.023 220)",
  "chart-3": "oklch(0.707 0.177 42)",
  "chart-4": "oklch(0.306 0.009 235)",
  "chart-5": "oklch(0.689 0.010 145)",
  sidebar: "oklch(0.958 0.006 160)",
  "sidebar-foreground": "oklch(0.181 0.006 240)",
  "sidebar-primary": "oklch(0.602 0.202 34)",
  "sidebar-primary-foreground": "oklch(1 0 0)",
  "sidebar-accent": "oklch(0.932 0.007 185)",
  "sidebar-accent-foreground": "oklch(0.306 0.009 235)",
  "sidebar-border": "oklch(0.830 0.011 205)",
  "sidebar-ring": "oklch(0.602 0.202 34)",
  radius: "0.5rem",
};

const dark = {
  background: "oklch(0.181 0.006 240)",
  foreground: "oklch(0.978 0.005 120)",
  card: "oklch(0.245 0.009 235)",
  "card-foreground": "oklch(0.978 0.005 120)",
  popover: "oklch(0.245 0.009 235)",
  "popover-foreground": "oklch(0.978 0.005 120)",
  primary: "oklch(0.707 0.177 42)",
  "primary-foreground": "oklch(0.181 0.006 240)",
  secondary: "oklch(0.306 0.009 235)",
  "secondary-foreground": "oklch(0.978 0.005 120)",
  muted: "oklch(0.306 0.009 235)",
  "muted-foreground": "oklch(0.760 0.011 205)",
  accent: "oklch(0.602 0.202 34)",
  "accent-foreground": "oklch(1 0 0)",
  destructive: "oklch(0.602 0.202 34)",
  border: "oklch(1 0 0 / 14%)",
  input: "oklch(1 0 0 / 18%)",
  ring: "oklch(0.707 0.177 42)",
  "chart-1": "oklch(0.707 0.177 42)",
  "chart-2": "oklch(0.760 0.011 205)",
  "chart-3": "oklch(0.602 0.202 34)",
  "chart-4": "oklch(0.978 0.005 120)",
  "chart-5": "oklch(0.689 0.010 145)",
  sidebar: "oklch(0.215 0.008 238)",
  "sidebar-foreground": "oklch(0.978 0.005 120)",
  "sidebar-primary": "oklch(0.707 0.177 42)",
  "sidebar-primary-foreground": "oklch(0.181 0.006 240)",
  "sidebar-accent": "oklch(0.306 0.009 235)",
  "sidebar-accent-foreground": "oklch(0.978 0.005 120)",
  "sidebar-border": "oklch(1 0 0 / 14%)",
  "sidebar-ring": "oklch(0.707 0.177 42)",
  radius: "0.5rem",
};

const prompts = [
  {
    id: "transparent-motif",
    label: "Transparent Oystercatcher motif",
    asset: `${basePath}/motif.png`,
    prompt:
      "Use case: photorealistic-natural\nAsset type: Morphous Oystercatcher transparent motif chroma-key source\nPrimary request: Create only an isolated oystercatcher beak and head motif for a design-system catalog, no environment, no props, no text.\nSubject: A coastal oystercatcher bird head in precise side profile with glossy black crown, clean white lower patch, vivid long red-orange beak, small red eye ring, crisp black-and-white feather boundary, accurate shorebird anatomy, and smooth natural feather texture.\nComposition/framing: centered complete cutout with generous padding; show the full beak, eye, head, upper neck, and black-white contrast without cropping.\nLighting/mood: clean studio light that preserves the high-signal black/white contrast and the red beak accent.\nChroma-key background: place the subject on a perfectly flat solid #00ff00 removable chroma-key background for transparency removal. The background must be one uniform color with no shadows, gradients, texture, reflections, floor plane, or lighting variation. Do not use #00ff00 anywhere in the subject.\nConstraints: no full beach scene, no rocks, no water background, no second bird, no gull, no puffin, no toucan, no text, no watermark, no props, no cast shadow, no contact shadow.",
  },
  {
    id: "light-design-system",
    label: "Light design-system board",
    asset: `${basePath}/design-system-light.png`,
    prompt:
      'Create one 3840x2160 comprehensive light-mode design-system board for "Morphous Oystercatcher" / "Oystercatcher Beak", source reference for a shadcn/tweakcn theme. Use black/white bird contrast, red-orange beak accent, sea grey water, slate rocky neutrals, and clean white feather panels. Include readable English and Japanese typography guidance plus palette, navigation, dashboard, charts, table, form, status, components, texture, radius, spacing, shadows, and tokens. Use high-signal operational UI labels only; no random brand names, no watermark, no purple gradients, no illegible tiny tables.',
  },
  {
    id: "dark-design-system",
    label: "Dark design-system board",
    asset: `${basePath}/design-system-dark.png`,
    prompt:
      'Create one 3840x2160 comprehensive dark-mode design-system board for "Morphous Oystercatcher" / "Oystercatcher Beak", translated from the light board and the same motif. Use near-black basalt surfaces, white feather text, pale surf borders, red-orange beak active states, sea-grey muted panels, and rocky texture. Include readable English and Japanese typography guidance plus palette, navigation, dashboard, charts, table, form, status, components, texture, radius, spacing, shadows, and tokens. Use high-signal operational UI labels only; no random brand names, no watermark, no purple gradients, no neon overload, no illegible tiny tables.',
  },
];

function svgText(x, y, text, size, fill, weight = 600, anchor = "start") {
  return `<text x="${x}" y="${y}" font-family="Geist, Inter, Arial, 'Hiragino Sans', sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="0">${text}</text>`;
}

function card(x, y, w, h, fill, stroke, r = 28, opacity = 1) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="4" opacity="${opacity}"/>`;
}

function pill(x, y, w, h, fill, text, color, stroke = "none") {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="${fill}" stroke="${stroke}" stroke-width="3"/>${svgText(x + w / 2, y + 34, text, 26, color, 700, "middle")}`;
}

function paletteBlocks(isDark) {
  return palette
    .map(([role, name, hex], i) => {
      const x = 180 + (i % 3) * 300;
      const y = 590 + Math.floor(i / 3) * 138;
      const label = isDark ? "#f7f8f6" : "#111315";
      const muted = isDark ? "#aeb8bb" : "#596367";
      return `<g>${card(x, y, 246, 102, hex, isDark ? "#ffffff26" : "#11131518", 18)}
        ${svgText(x + 18, y + 142, role, 25, label, 800)}
        ${svgText(x + 18, y + 178, name, 22, muted, 600)}
        ${svgText(x + 18, y + 211, hex, 21, muted, 500)}
      </g>`;
    })
    .join("");
}

function chart(x, y, darkMode) {
  const axis = darkMode ? "#ffffff30" : "#11131524";
  const red = "#e33b1f";
  const grey = darkMode ? "#8f9ca1" : "#728087";
  return `<g>
    <polyline points="${x},${y + 250} ${x + 120},${y + 190} ${x + 240},${y + 205} ${x + 360},${y + 118} ${x + 480},${y + 148} ${x + 600},${y + 70}" fill="none" stroke="${red}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="${x},${y + 300} ${x + 600},${y + 300}" fill="none" stroke="${axis}" stroke-width="4"/>
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="${x + 36 + i * 112}" y="${y + 306 - (80 + i * 28)}" width="56" height="${80 + i * 28}" rx="10" fill="${grey}" opacity="${0.55 + i * 0.08}"/>`).join("")}
  </g>`;
}

function tableRows(x, y, darkMode) {
  const fg = darkMode ? "#f7f8f6" : "#111315";
  const muted = darkMode ? "#aeb8bb" : "#596367";
  const line = darkMode ? "#ffffff24" : "#11131518";
  return ["Ready", "Review", "Risk", "Queued"].map((state, i) => {
    const yy = y + i * 74;
    const red = i === 2 ? "#e33b1f" : i === 0 ? "#728087" : darkMode ? "#3a4246" : "#e8eceb";
    return `<g>
      <line x1="${x}" x2="${x + 770}" y1="${yy + 48}" y2="${yy + 48}" stroke="${line}" stroke-width="3"/>
      ${svgText(x, yy + 35, `Harbor ${String(i + 1).padStart(2, "0")}`, 28, fg, 700)}
      ${svgText(x + 260, yy + 35, i === 2 ? "High signal" : "Normal", 26, muted, 600)}
      ${pill(x + 555, yy, 150, 46, red, state, i === 2 || i === 0 ? "#fff" : fg, darkMode ? "#ffffff18" : "#11131514")}
    </g>`;
  }).join("");
}

function board(mode) {
  const darkMode = mode === "dark";
  const bg = darkMode ? "#111315" : "#f7f8f6";
  const fg = darkMode ? "#f7f8f6" : "#111315";
  const muted = darkMode ? "#aeb8bb" : "#596367";
  const surface = darkMode ? "#1d2326" : "#ffffff";
  const panel = darkMode ? "#252b2f" : "#e8eceb";
  const border = darkMode ? "#ffffff24" : "#1113151f";
  const shadow = darkMode ? "#00000055" : "#11131518";
  const accent = darkMode ? "#ff6a3d" : "#e33b1f";
  const inverse = darkMode ? "#111315" : "#ffffff";
  const title = darkMode ? "Dark Mode Board" : "Light Mode Board";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="3840" height="2160" viewBox="0 0 3840 2160">
  <defs>
    <pattern id="speckle-${mode}" width="96" height="96" patternUnits="userSpaceOnUse">
      <rect width="96" height="96" fill="${bg}"/>
      <circle cx="18" cy="32" r="3" fill="${darkMode ? "#ffffff1f" : "#11131514"}"/>
      <circle cx="71" cy="58" r="4" fill="${darkMode ? "#ffffff18" : "#72808724"}"/>
      <circle cx="42" cy="82" r="2" fill="${darkMode ? "#72808755" : "#11131512"}"/>
    </pattern>
    <filter id="softShadow-${mode}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="${shadow}" flood-opacity="1"/>
    </filter>
  </defs>
  <rect width="3840" height="2160" fill="url(#speckle-${mode})"/>
  <rect x="0" y="0" width="3840" height="18" fill="${accent}"/>
  ${svgText(160, 155, "Morphous Oystercatcher", 86, fg, 850)}
  ${svgText(166, 225, `Oystercatcher Beak / ${title}`, 36, muted, 650)}
  ${svgText(166, 285, "High-signal operational UI: black/white contrast, red beak actions, sea-grey rocky neutrals.", 34, fg, 600)}
  <image href="${motifHref}" x="2950" y="82" width="660" height="440" preserveAspectRatio="xMidYMid meet"/>
  ${pill(160, 330, 178, 54, accent, "Signal", inverse)}
  ${pill(358, 330, 184, 54, panel, "Ready", fg, border)}
  ${pill(562, 330, 218, 54, panel, "状態", fg, border)}

  ${card(130, 465, 960, 710, surface, border, 34)}
  ${svgText(180, 540, "Palette", 46, fg, 850)}
  ${svgText(180, 586, "Motif sampled roles", 25, muted, 600)}
  ${paletteBlocks(darkMode)}

  ${card(1140, 465, 1030, 710, surface, border, 34)}
  ${svgText(1190, 540, "Typography EN / JA", 46, fg, 850)}
  ${svgText(1190, 642, "Aa", 148, fg, 850)}
  ${svgText(1405, 630, "Geist Display", 46, fg, 800)}
  ${svgText(1405, 690, "Status labels, dashboard numerals, dense tables", 30, muted, 600)}
  ${svgText(1190, 812, "状態", 110, fg, 850)}
  ${svgText(1405, 792, "Noto Sans JP fallback", 42, fg, 800)}
  ${svgText(1405, 852, "送信  検索  入力  警告", 32, muted, 650)}
  ${["Heading 56/64", "Body 28/40", "Caption 22/32", "Tabular nums"].map((t, i) => pill(1190 + i * 230, 940, 198, 54, i === 0 ? accent : panel, t, i === 0 ? inverse : fg, border)).join("")}
  <rect x="1190" y="1038" width="880" height="4" fill="${border}"/>
  ${svgText(1190, 1100, "Use sharp weight contrast, never tiny labels.", 31, fg, 700)}

  ${card(2220, 465, 1490, 710, surface, border, 34)}
  ${svgText(2270, 540, "Navigation / Dashboard / Charts", 46, fg, 850)}
  ${card(2270, 610, 260, 495, darkMode ? "#15191b" : "#111315", darkMode ? "#ffffff20" : "#111315", 24)}
  ${["Overview", "Queue", "Signals", "Table", "Settings"].map((t, i) => `<g>${i === 1 ? `<rect x="2300" y="${690 + i * 76}" width="196" height="48" rx="16" fill="${accent}"/>` : ""}${svgText(2322, 724 + i * 76, t, 27, i === 1 || !darkMode ? "#fff" : "#dfe5e4", 750)}</g>`).join("")}
  ${card(2570, 610, 300, 150, panel, border, 24)}
  ${svgText(2604, 674, "Queue", 28, muted, 650)}
  ${svgText(2604, 734, "478", 58, fg, 850)}
  ${card(2905, 610, 300, 150, panel, border, 24)}
  ${svgText(2939, 674, "Risk", 28, muted, 650)}
  ${svgText(2939, 734, "Low", 58, fg, 850)}
  ${card(3240, 610, 300, 150, panel, border, 24)}
  ${svgText(3274, 674, "Ready", 28, muted, 650)}
  ${svgText(3274, 734, "96%", 58, fg, 850)}
  ${chart(2590, 815, darkMode)}
  ${pill(3270, 832, 160, 52, accent, "Alert", inverse)}
  ${pill(3450, 832, 150, 52, panel, "Stable", fg, border)}

  ${card(130, 1235, 1040, 760, surface, border, 34)}
  ${svgText(180, 1310, "Form / Inputs", 46, fg, 850)}
  ${["Name", "Status", "Harbor note"].map((t, i) => `${svgText(185, 1395 + i * 142, t, 27, muted, 700)}${card(185, 1420 + i * 142, 760, i === 2 ? 100 : 68, i === 2 ? panel : bg, border, 18)}${svgText(220, 1465 + i * 142, i === 0 ? "Oystercatcher" : i === 1 ? "Ready" : "Rocky shore signal review", 27, fg, 600)}`).join("")}
  ${pill(185, 1904, 178, 62, accent, "送信", inverse)}
  ${pill(386, 1904, 180, 62, panel, "Cancel", fg, border)}
  <circle cx="686" cy="1935" r="22" fill="${accent}"/><rect x="760" y="1914" width="92" height="46" rx="23" fill="${accent}"/><circle cx="828" cy="1937" r="18" fill="${inverse}"/>

  ${card(1220, 1235, 1170, 760, surface, border, 34)}
  ${svgText(1270, 1310, "Table / Status", 46, fg, 850)}
  ${svgText(1270, 1385, "ID", 28, muted, 800)}
  ${svgText(1530, 1385, "Signal", 28, muted, 800)}
  ${svgText(1830, 1385, "状態", 28, muted, 800)}
  ${tableRows(1270, 1440, darkMode)}
  ${card(1270, 1815, 940, 104, panel, border, 22)}
  ${svgText(1308, 1878, "Toast: Beak accent reserved for action and risk.", 31, fg, 750)}

  ${card(2440, 1235, 1270, 760, surface, border, 34)}
  ${svgText(2490, 1310, "Component States / Tokens", 46, fg, 850)}
  ${["Default", "Hover", "Active", "Disabled"].map((t, i) => pill(2490 + i * 212, 1374, 178, 58, i === 2 ? accent : panel, t, i === 2 ? inverse : fg, border)).join("")}
  ${svgText(2490, 1515, "Radius", 30, muted, 700)}${svgText(2660, 1515, "8px", 34, fg, 850)}
  ${svgText(2490, 1588, "Spacing", 30, muted, 700)}${svgText(2660, 1588, "8 / 16 / 24 / 40", 34, fg, 850)}
  ${svgText(2490, 1661, "Shadow", 30, muted, 700)}${svgText(2660, 1661, "low, crisp", 34, fg, 850)}
  ${svgText(2490, 1734, "Border", 30, muted, 700)}${svgText(2660, 1734, "surf line", 34, fg, 850)}
  ${["--primary", "--background", "--chart-1", "--sidebar"].map((t, i) => `${card(3100, 1490 + i * 86, 430, 58, i === 0 ? accent : panel, border, 14)}${svgText(3128, 1528 + i * 86, t, 25, i === 0 ? inverse : fg, 750)}`).join("")}
  ${svgText(2490, 1920, "Texture: basalt speckle, white feather planes, red beak focus.", 30, fg, 700)}
  </svg>`;
}

function writeThemeCss() {
  const vars = (tokens) => Object.entries(tokens).map(([k, v]) => `  --${k}: ${v};`).join("\n");
  writeFileSync(
    new URL("./theme.css", import.meta.url),
    `/* Morphous Oystercatcher\n   System definition: ${basePath}/system.json\n   Prompt records: ${basePath}/prompts.json\n   Design-system references:\n   light: ${basePath}/design-system-light.png\n   dark: ${basePath}/design-system-dark.png\n*/\n\n:root {\n${vars(light)}\n}\n\n.dark {\n${vars(dark)}\n}\n`,
  );
}

function writeJson() {
  const paletteJson = palette.map(([role, name, hex, oklch]) => ({ role, name, hex, oklch }));
  const systemPalette = palette.map(([role, name, hex]) => ({ role, name, hex }));
  const identity = {
    slug,
    name: "Morphous Oystercatcher",
    motifName: "Oystercatcher Beak",
    motifCategory: "bird",
    biome: "Rocky Shore",
    motif: "red beak high-signal contrast",
  };
  const tags = ["oystercatcher", "bird", "rocky-shore", "black-white", "red-beak", "high-signal", "dark-ready"];
  const assets = {
    motif: `${basePath}/motif.png`,
    board: `${basePath}/design-system-light.png`,
    darkBoard: `${basePath}/design-system-dark.png`,
    examples: [],
    themeCss: `${basePath}/theme.css`,
    themeJson: `${basePath}/theme.json`,
    promptsJson: `${basePath}/prompts.json`,
  };
  writeFileSync(new URL("./prompts.json", import.meta.url), `${JSON.stringify(prompts, null, 2)}\n`);
  writeFileSync(
    new URL("./system.json", import.meta.url),
    `${JSON.stringify(
      {
        schema: "morphous.system.v1",
        status: "ready",
        ...identity,
        description:
          "A shadcn/tweakcn-compatible high-signal system from oystercatcher contrast: white feather surfaces, black basalt structure, red beak actions, and sea-grey rocky neutrals for operational dashboards.",
        typography:
          "Geist for dense operational UI with Noto Sans JP guidance for Japanese labels, strong numerals, and crisp status text.",
        layout:
          "Precise 8px grids, sharp black-white separation, red beak action rails, sea-grey panels, compact tables, and status-first dashboard composition.",
        themeReference: ["design-system-light.png", "design-system-dark.png"],
        tags,
        palette: systemPalette,
        assets: {
          motif: "motif.png",
          board: "design-system-light.png",
          darkBoard: "design-system-dark.png",
          themeCss: "theme.css",
          themeJson: "theme.json",
          promptsJson: "prompts.json",
        },
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    new URL("./theme.json", import.meta.url),
    `${JSON.stringify(
      {
        schema: "morphous.theme.v1",
        source: "Generated from a per-system Morphous manifest and prompt records. CSS variables are shadcn/tweakcn-compatible.",
        identity,
        palette: paletteJson,
        light,
        dark,
        typography:
          "Geist for dense operational UI with Noto Sans JP guidance for Japanese labels, strong numerals, and crisp status text.",
        layout:
          "Precise 8px grids, sharp black-white separation, red beak action rails, sea-grey panels, compact tables, and status-first dashboard composition.",
        tags,
        assets,
        prompts,
      },
      null,
      2,
    )}\n`,
  );
}

function render(name) {
  execFileSync("sips", ["-s", "format", "png", `${name}.svg`, "--out", `${name}.png`], { cwd: new URL(".", import.meta.url) });
  execFileSync("sips", ["-z", "2160", "3840", `${name}.png`, "--out", `${name}.png`], { cwd: new URL(".", import.meta.url) });
}

writeFileSync(new URL("./design-system-light.svg", import.meta.url), board("light"));
writeFileSync(new URL("./design-system-dark.svg", import.meta.url), board("dark"));
render("design-system-light");
render("design-system-dark");
writeThemeCss();
writeJson();
