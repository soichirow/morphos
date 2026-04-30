import { createFileRoute, redirect } from "@tanstack/react-router"

// The "/systems/$slug" route is now a deep-link shortcut into the gallery —
// the gallery already renders the full system view (downloads, hero, board,
// component preview, palette tuning, assets, prompts). Redirect so anyone
// landing here sees the canonical, fully-featured view.
export const Route = createFileRoute("/systems/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/gallery",
      search: { system: params.slug },
      replace: true,
    })
  },
})
