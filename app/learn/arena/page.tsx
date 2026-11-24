import type {Metadata} from 'next';
import LearningHub from '@/components/learning/hub';

export const metadata: Metadata = {
  title: 'Revision Arena',
  description: 'Practice Python, data structures, algorithms, and SQL in visual labs, challenges, and flashcard decks.',
  alternates: {canonical: '/learn/arena'},
};

export default async function RevisionArena({searchParams}: {searchParams: Promise<{topic?: string | string[]}>}) {
  const {topic} = await searchParams;
  const initialTopic = typeof topic === 'string' ? topic : undefined;
  return <LearningHub key={initialTopic} view="arena" initialTopic={initialTopic}/>;
}
