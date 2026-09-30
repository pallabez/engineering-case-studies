# Engineering case studies

Pallab's cinematic, interactive engineering stories. Built with Astro and TypeScript. Static output, with browser JavaScript only where a story needs interaction.

## Run locally

Use Node 24 and npm.

```sh
npm install
npm run dev
```

Open the URL printed by Astro, normally http://127.0.0.1:4173/. Astro chooses the next available port if that port is busy. The subscription story lives at `/stories/subscriptions/`.

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
- `src/stories/subscriptions/`: the subscription film, scene data, canvas renderer, timeline, and CSS.
- `public/stories/subscriptions/assets/`: original illustrations.
- `docs/`: factual background and illustration provenance.
- `previews/`: design-review screenshots, excluded from the published output.

The existing film renderer and controls remain JavaScript during this migration. Site metadata, Astro component props, and new pages use TypeScript. React is optional if a future story needs it; the existing story does not.

## Add a case study

1. Add metadata to `src/data/case-studies.ts`, including a unique slug and image.
2. Add `src/pages/stories/<slug>.astro` using `BaseLayout`.
3. Keep its content, styles, and interactive components in `src/stories/<slug>/`.
4. Put its public assets in `public/stories/<slug>/assets/`.
5. Run `npm run check` and `npm run build`. Check desktop, mobile, keyboard controls, and reduced motion for an interactive story.

The index automatically lists catalog entries. Each story owns its visual language and interaction; there is no mandatory scene format. Standard page navigation gives each story a fresh browser lifecycle.

## Hosting

`npm run build` creates static files in `dist/` for any static host. Existing Sites project metadata is retained in `.openai/hosting.json`. This migration does not publish the project.

## Subscription story

The first story opens with a current value of 26 seats, reveals three signed coverage facts, advances time to 16 seats, and explains the materialized view. Approvals and migration remain optional side stories. The customer, dates, and counts are fictional. See `docs/subscription-story.md` and `docs/ILLUSTRATIONS.md`.
