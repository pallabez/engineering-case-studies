# Nobody touched this row

A decision-log case study about Pallab's subscription revamp, at `/stories/subscription-ledger/`. It covers the same project as `subscription-story.md` with a different reader in mind.

## Who reads it

The first reader is an engineering manager or senior engineer who is evaluating Pallab's work and arrives from a link. They read the hero and the headings in about a minute, then decide whether to read on. They look for how the problem was framed and which decisions were made. The second reader is a backend engineer who wants to learn the technique.

The page is built for that order. The hero states the problem and the outcome. Each heading is a decision. The interactive ledger shows that the model works. The page covers the design and what it does well. It leaves out the migration, known gaps and remaining work.

## Content basis

Reviewed local `backend-core/docs/subscriptions/ledger.md`, `legacy-writer-repoint.md`, `removals.md`, and the fold, projection, grant and change-request code. `fold.ts` ports `subscription-ledger-fold.util.ts` and `subscription-projection.util.ts` to whole-number days.

The page leaves out production counts, revenue, customer identities, the product name and internal links. The account, days, order numbers and seat counts in the interactives are fictional. The lab shows each row from the day it was filed, which is a presentation choice. The fold itself takes only rows, a date and a suspension flag.

## Files

`Story.astro` holds the copy and markup. `fold.ts` is the fold and projection logic, checked by `fold.check.ts`. `story.ts` drives the stale-row demo, the ledger lab, the section nav and the reveals. `Stage.astro` holds the drawing and the script that moves it through nine beats. On wide screens one copy is pinned beside the text steps. On phones nothing is pinned and each step carries its own copy, which plays the move from the previous beat as it scrolls into view. The drawing is hidden from screen readers because the steps carry the content, and it is hidden entirely when JavaScript is off. `style.css` holds the styles. The cover is `public/stories/subscription-ledger/assets/cover.svg` and the link preview is `public/og/subscription-ledger.jpg`, rendered from the cover.

## Accessibility

Native range, checkbox and button controls. The chart is decorative for assistive technology, and the verdict, ledger table and projection row carry the same information as text. Reveals and the hero autoplay are off under reduced motion. Without JavaScript the full text is readable and the lab shows a short description of its default state.
