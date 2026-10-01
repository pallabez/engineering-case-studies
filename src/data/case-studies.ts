export interface CaseStudy {
  slug: string;
  title: string;
  question: string;
  pageTitle: string;
  description: string;
  topics: string[];
  image: string;
  /** Link preview image, 1200 by 630. Defaults to the layout's. */
  ogImage?: string;
}

export const caseStudies = [
  {
    slug: 'subscriptions',
    title: 'History becomes the present.',
    question: 'Your database says 26. How did it get here?',
    pageTitle: 'A scroll story about rebuilding subscriptions',
    description: 'How a SaaS product rebuilt subscriptions as a ledger of dated facts, and why it still stores one answer.',
    topics: ['Subscriptions', 'Data modelling', 'Materialized views'],
    image: 'stories/subscriptions/assets/cinema-ribbon.png',
  },
  {
    slug: 'subscription-ledger',
    title: 'Nobody touched this row.',
    question: 'By morning it was wrong. What do you store instead?',
    pageTitle: 'Nobody touched this row: replacing a subscription table with a ledger',
    description: 'Three decisions behind a subscription rebuild: store facts, compute state, and cache one answer.',
    topics: ['Subscriptions', 'Append-only ledger', 'Migration'],
    image: 'stories/subscription-ledger/assets/cover.svg',
    ogImage: 'og/subscription-ledger.jpg',
  },
] satisfies CaseStudy[];
