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
    slug: 'subscription-ledger',
    title: 'What should a subscription table store?',
    question: 'Ours stored the answer. It went stale at midnight.',
    pageTitle: 'What should a subscription table store? Replacing a status row with a ledger',
    description: 'Three decisions behind a subscription rebuild: store facts, compute state, and cache one answer.',
    topics: ['Subscriptions', 'Append-only ledger', 'Migration'],
    image: 'stories/subscription-ledger/assets/cover.svg',
    ogImage: 'og/subscription-ledger.jpg',
  },
] satisfies CaseStudy[];
