import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import viteTsConfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"

const config = defineConfig({
  plugins: [
    devtools(),
    // Cloudflare Pages auto-detection selects the worker preset in CI. This
    // project deploys the prerendered `.output/public` directory, so keep the
    // build environment-independent and use Node only for prerendering.
    nitro({ preset: "node-server" }),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        autoSubfolderIndex: true,
        autoStaticPathsDiscovery: true,
        crawlLinks: false,
        filter: ({ path }) =>
          path === "/" || path === "/gallery" || path === "/privacy",
        failOnError: true,
      },
    }),
    viteReact(),
  ],
})

export default config
