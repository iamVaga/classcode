import type {Metadata} from 'next';
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import LearningNavigation from '@/components/learning/navigation';
import Workshop from '@/components/learning/workshop';
import {arenaLessons} from '@/lib/learn/loader';
import {tracks} from '@/lib/learn/types';

export const metadata: Metadata = {
  title: 'Visual Lab',
  description: 'Change the inputs, follow each line of code, and predict what happens next.',
  alternates: {canonical: '/learn/visuals'},
};

export default async function VisualLab({searchParams}: {searchParams: Promise<{topic?: string | string[]}>}) {
  const {topic} = await searchParams;
  const order = Object.keys(tracks);
  const lessons = arenaLessons().toSorted((a, b) => order.indexOf(a.track) - order.indexOf(b.track));
  const active = lessons.find(lesson => lesson.id === topic) ?? lessons[0];
  return <div className="learn">
    <a href="#visual-main" className="learn-button learn-skip">Skip to content</a>
    <LearningNavigation><Link href="/learn">Concept Studio</Link><Link href="/learn/arena">Revision Arena</Link></LearningNavigation>
    <main id="visual-main" className="learn-wrap">
      <header className="learn-visual-hero">
        <h1>Visual Lab</h1>
        <p>Change the inputs, follow each step, and predict what comes next.</p>
      </header>
      <nav className="learn-visual-topics" aria-label="Visual lessons">
        {lessons.map(lesson => <Link key={lesson.id} href={`/learn/visuals?topic=${lesson.id}`} aria-current={lesson.id === active.id ? 'page' : undefined}>
          <small>{lesson.track === 'dsa' ? 'DSA' : tracks[lesson.track]}</small>
          <strong>{lesson.title}</strong><ArrowRight size={17} aria-hidden="true"/>
        </Link>)}
      </nav>
      <Workshop key={active.id} lesson={active}/>
    </main>
    <footer className="learn-wrap learn-footer"><Link href="/learn">Back to Concept Studio <ArrowRight size={16}/></Link></footer>
  </div>;
}
