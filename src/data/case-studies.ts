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
    question: 'Your database says 26. How did it get there?',
    description: 'A subscription revamp told through signed coverage, time, and a materialized view.',
    topics: ['Subscriptions', 'Data modelling', 'Materialized views'],
    image: '/stories/subscriptions/assets/cinema-ribbon.png',
  },
] satisfies CaseStudy[];
