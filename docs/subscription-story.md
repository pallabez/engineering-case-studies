# Subscriptions, in motion

Archived design notes for the removed subscriptions scroll film. Its source, route, and public assets have been removed. The current story is at `/stories/subscription-ledger/`.

Cinematic scrolling story about Pallab's subscription revamp. A pinned full-screen canvas follows six scenes, with scroll-driven camera roll, image crossfades, coverage particles, and short captions. The final timeline is interactive. The Astro source lives in `src/stories/subscriptions/`. Run `npm run dev` from the project root. `npm run build` generates static output in `dist/`.

## Content basis

Reviewed local `backend-core/docs/subscriptions/ledger.md`, `removals.md`, and the change-request services. The public-facing copy covers the signed coverage ledger, materialised projections, approval workflow, and migration approach. It does not include production counts, revenue figures, customer identities, internal links, or implementation secrets.

Aster Studio and its 60-day timeline are fictional educational examples. The film opens with a 26-seat current value, shows the old single-row table that could not explain it, reveals the three dated facts, moves to day 31 and 16 seats, then explains the materialised view. Approvals and migration are optional side stories. Each scene has optional technical notes; the final timeline lets viewers change the day and included facts. The approval walkthrough is deliberately simplified. The proposed seat total is illustrative; the actual preview endpoint calculates adjustment amounts.

`story-model.js` owns the scene content and coverage state, `film-renderer.js` draws the animated explanation, `story.js` coordinates scroll and accessible controls, and `playground.js` implements the final interactive timeline. The legacy history display is described as frozen, not removed; the full ledger-derived history read model remains a future step in the source docs. The site does not claim instant date-driven refresh or a staged deployment switch.

## Assets

Original generated illustrations in `public/stories/subscriptions/assets`. See `ILLUSTRATIONS.md` for generation prompts and source.

## Accessibility

Native range/checkbox/button controls, keyboard access, text alternatives, visible focus, reduced-motion support, and a manual motion reduction control. The no-JavaScript version includes a brief story transcript. On mobile, titles stay above the animated data. Animation stops while the page is hidden and outside the film.
