export interface CaseStudy {
  slug: string;
  title: string;
  question: string;
  description: string;
  topics: string[];
  image: string;
}

export const caseStudies = [
  {
    slug: 'subscriptions',
    title: 'History becomes the present.',
    question: 'Your database says 26. How did it get here?',
    description: 'How a payroll app rebuilt subscriptions as a ledger of dated facts, and why it still stores one answer.',
    topics: ['Subscriptions', 'Data modelling', 'Materialized views'],
    image: '/stories/subscriptions/assets/cinema-ribbon.png',
  },
] satisfies CaseStudy[];
