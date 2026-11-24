import type {Metadata} from 'next';
import LearningHub from '@/components/learning/hub';

export const metadata: Metadata = {
  title: 'Concept Studio',
  description: 'Explore Python, data structures, algorithms, and SQL with step-by-step visuals and explanations at three depths.',
  alternates: {canonical: '/learn'},
};

export default async function ConceptStudio({searchParams}: {searchParams: Promise<{topic?: string | string[]}>}) {
  const {topic} = await searchParams;
  const initialTopic = typeof topic === 'string' ? topic : undefined;
  return <LearningHub key={initialTopic} view="studio" initialTopic={initialTopic}/>;
}
