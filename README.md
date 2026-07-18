# Morphous Japanese Edition

Morphous is a bilingual Japanese/English catalog of 611 nature-inspired design systems. This repository is a Japanese fork of [Ameyanagi/morphos](https://github.com/Ameyanagi/morphos).

Production: https://morphos.so1ro.com/

日本語ドキュメント: [README.ja.md](README.ja.md)

## Features

- Japanese-first names with the original English names retained
- Search, category, color, and sort controls
- URL sharing with `?system=<slug>` for browsers, people, and LLMs
- Browser-local favorites
- Random system selection
- Fluffy, mosaic, and normal image modes
- Copy actions for CSS, JSON, prompts, and colors
- Social sharing, OGP, PowerPoint, and Word export
- Cloudflare Pages discovery and analytics foundations

See the [Japanese user guide](docs/user-guide.md) for the complete behavior and privacy boundaries.

## Development

```powershell
npm install
npx playwright install chromium
npm run dev
```

Run the quality gates:

```powershell
npm run lint
npm run typecheck
npm test
npm run build:cloudflare
npm run test:e2e
```

`npm run ci` runs the complete local release gate. A Cloudflare build must exist before running Playwright by itself.

## Documentation

- [User guide (Japanese)](docs/user-guide.md)
- [Architecture (Japanese)](docs/architecture.md)
- [Testing and E2E scenarios (Japanese)](docs/testing.md)
- [Cloudflare release procedure (Japanese)](docs/releasing.md)
- [SEO and analytics governance (Japanese)](docs/site-governance.md)

## Hosting and assets

The canonical production deployment is the Cloudflare Pages project `morphos-ja`, served at `morphos.so1ro.com`. The bundled app contains localized catalog data, copyable artifacts, and 611 gentle illustrations. Normal-mode motif and board images are fetched from `morphos.ameyanagi.com`; see the architecture document for the exact boundary.

Search Console, Bing Webmaster Tools, GA4, and Cloudflare Web Analytics remain incomplete until dashboard evidence and live measurement are recorded. Do not infer completion from repository configuration alone.

## License

Licensed under Apache-2.0 or MIT, at your option. See `LICENSE-APACHE` and `LICENSE-MIT`.
