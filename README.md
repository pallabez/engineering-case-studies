# Engineering case studies

Pallab's cinematic, interactive engineering stories. Built with Astro and TypeScript. Static output, with browser JavaScript only where a story needs interaction.

## Run locally

Use Node 24 and npm.

```sh
npm install
npm run dev
```

Open the URL printed by Astro, normally http://127.0.0.1:4173/. Astro chooses the next available port if that port is busy. The subscription ledger story lives at `/stories/subscription-ledger/`.

```sh
npm run check
npm run build
npm run preview
```

`dist/` is generated output. Edit `src/` and `public/`, never `dist/`.

## Project structure

- `src/pages/index.astro`: case-study index.
- `src/pages/stories/`: a route for each case study.
- `src/layouts/BaseLayout.astro`: shared document metadata and HTML shell.
- `src/data/case-studies.ts`: typed case-study catalog used by the index.
- `src/stories/subscription-ledger/`: the decision-log story. `fold.ts` is the coverage fold, `story.ts` drives the interactive ledger, `fold.check.ts` is its self-check.
- `public/stories/subscription-ledger/assets/`: ledger illustrations.
- `docs/`: factual background and illustration provenance.
- `previews/`: design-review screenshots, excluded from the published output.

Site metadata, Astro component props, and interactive code use TypeScript.

## Add a case study

1. Add metadata to `src/data/case-studies.ts`, including a unique slug and image.
2. Add `src/pages/stories/<slug>.astro` using `BaseLayout`.
3. Keep its content, styles, and interactive components in `src/stories/<slug>/`.
4. Put its public assets in `public/stories/<slug>/assets/`.
5. Run `npm run check` and `npm run build`. Check desktop, mobile, keyboard controls, and reduced motion for an interactive story.

The index automatically lists catalog entries. Each story owns its visual language and interaction; there is no mandatory scene format. Standard page navigation gives each story a fresh browser lifecycle.

## Hosting

`npm run build` creates static files in `dist/` for any static host. Existing Sites project metadata is retained in `.openai/hosting.json`. This migration does not publish the project.

## Subscription ledger story

The story covers the subscription rebuild as a decision log: why the old row went stale, the append-only ledger, the fold and the projection row. Its interactive runs a port of the fold on a fictional account. See `docs/subscription-ledger-story.md`.

```sh
node src/stories/subscription-ledger/fold.check.ts
```
