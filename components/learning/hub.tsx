'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {ArrowRight, BookOpen, Check, Code2, Database, Flame, Heart, Layers3, ScanLine, Zap} from 'lucide-react';
import {learning, useLearningProgress} from '@/lib/learn/progress';
import {lessons} from '@/lib/learn/lessons';
import {tracks, type Lesson, type Track} from '@/lib/learn/types';
import Lab from './lab';
import {Challenge, Quests, Recall} from './activities';
import LearningModes from './modes';
import LearningNavigation from './navigation';

const subjects = [
  {id: 'python', title: 'Python', icon: Code2},
  {id: 'dsa', title: 'Data structures & algorithms', icon: Layers3},
  {id: 'sql', title: 'SQL', icon: Database},
] as const;
const featured = ['loops', 'stack-queue', 'bubble-sort', 'binary-search'];
const labIcons = {loops: Code2, 'stack-queue': Layers3, 'bubble-sort': Layers3, 'binary-search': ScanLine};
type View = 'studio' | 'arena';
type Filter = Track | 'featured';

function Topics({active, onChoose, explored}: {active: string; onChoose: (id: string) => void; explored: string[]}) {
  return <section className="learn-topics" aria-labelledby="learn-topics-title">
    <h2 id="learn-topics-title">Pick a concept</h2>
    <div className="learn-topic-grid">{subjects.map(({id, title, icon: Icon}) =>
      <section className="learn-panel learn-topic" key={id} data-track={id}>
        <h3><Icon size={21} aria-hidden="true"/>{title}</h3>
        <ul>{lessons.filter(lesson => lesson.track === id).map(lesson =>
          <li key={lesson.id}><button type="button" aria-pressed={active === lesson.id} onClick={() => onChoose(lesson.id)}>
            {lesson.title}{explored.includes(lesson.id) ? <Check size={15} aria-label="Explored"/> : <ArrowRight size={15} aria-hidden="true"/>}
          </button></li>
        )}</ul>
      </section>
    )}</div>
  </section>;
}

function Labs({filter, onFilter, current, onChoose, completed}: {
  filter: Filter; onFilter: (filter: Filter) => void; current: Lesson; onChoose: (id: string) => void; completed: string[];
}) {
  const visible = filter === 'featured' ? featured.map(id => lessons.find(lesson => lesson.id === id)!) : lessons.filter(lesson => lesson.track === filter);
  return <section className="learn-topics" id="labs" aria-labelledby="learn-labs-title">
    <div className="learn-section-heading">
      <h2 id="learn-labs-title">Pick a lab</h2>
      <div className="learn-control-group" role="group" aria-label="Filter labs">
        <button type="button" className="learn-small" aria-pressed={filter === 'featured'} onClick={() => onFilter('featured')}>Featured</button>
        {subjects.map(({id}) => <button type="button" className="learn-small" key={id} aria-pressed={filter === id} onClick={() => onFilter(id)}>{id === 'dsa' ? 'DSA' : tracks[id]}</button>)}
      </div>
    </div>
    <div className="learn-lab-cards">{visible.map(lesson => {
      const Icon = labIcons[lesson.id as keyof typeof labIcons] ?? subjects.find(subject => subject.id === lesson.track)!.icon;
      return <button type="button" className="learn-panel learn-lab-card" key={lesson.id} data-track={lesson.track}
        aria-pressed={current.id === lesson.id} onClick={() => onChoose(lesson.id)}>
        <span className="learn-lab-icon"><Icon size={20} aria-hidden="true"/></span><small>{lesson.minutes} min</small>
        <strong>{lesson.title}</strong>
        <span>{completed.includes(lesson.id) ? 'Completed' : lesson.subtitle}</span>
      </button>;
    })}</div>
  </section>;
}

export default function LearningHub({view, initialTopic}: {view: View; initialTopic?: string}) {
  const arena = view === 'arena';
  const start = lessons.find(lesson => lesson.id === initialTopic) ?? lessons[arena ? 0 : 1];
  const [active, setActive] = useState(start);
  const [filter, setFilter] = useState<Filter>(initialTopic && !featured.includes(start.id) ? start.track : 'featured');
  const {progress, today, streak} = useLearningProgress();
  const explored = lessons.filter(lesson => progress.explored.includes(lesson.id)).length;

  useEffect(() => { learning.explore(active.id); }, [active.id]);

  function choose(id: string) {
    const lesson = lessons.find(item => item.id === id);
    if (!lesson) return;
    setActive(lesson);
  }

  function changeFilter(next: Filter) {
    setFilter(next);
    if (next === 'featured' ? !featured.includes(active.id) : active.track !== next) {
      const first = next === 'featured' ? featured[0] : lessons.find(lesson => lesson.track === next)?.id;
      if (first) choose(first);
    }
  }

  const level = Math.floor(progress.xp / 100) + 1;
  return <div className="learn">
    <a href="#learn-main" className="learn-button learn-skip">Skip to content</a>
    <LearningNavigation>
      {arena ? <>
        <Link href={`/learn?topic=${active.id}`}>Concept Studio</Link>
        <a href="#labs">Labs</a><a href="#quests">Quests</a><a href="#recall">Recall</a>
      </> : <><Link href={`/learn/arena?topic=${active.id}`}>Revision Arena</Link><Link href="/learn/visuals">Visual Lab</Link></>}
    </LearningNavigation>
    <main id="learn-main" className="learn-wrap">
      <section className="learn-hero" aria-labelledby="learn-title">
        <div>
          <p className="learn-overline"><BookOpen size={16} aria-hidden="true"/> Python · DSA · SQL</p>
          <h1 id="learn-title">{arena ? <>Revision <span>Arena</span></> : <>Concept <span>Studio</span></>}</h1>
          <p>{arena ? 'Trace a program, tackle a challenge, or see what you remember.' : 'See what your code does, one step at a time. Pick an idea and try it for yourself.'}</p>
        </div>
        {arena ? <div className="learn-panel learn-progress learn-xp">
          <div className="learn-progress-heading">
            <div><Zap size={23} aria-hidden="true"/><strong>Level {level}</strong></div><span>{progress.xp} XP total</span>
          </div>
          <progress value={progress.xp % 100} max={100} aria-label="XP towards next level"/>
          <div className="learn-progress-heading">
            <span><Flame size={18} aria-hidden="true"/> {streak} {streak === 1 ? 'day' : 'days'} of practice</span>
            <span role="img" aria-label={`${3 - today.mistakes} of 3 hearts. You can keep practicing at any number.`}>
              {[0, 1, 2].map(index => <Heart aria-hidden="true" size={19} key={index} fill={index < 3 - today.mistakes ? 'currentColor' : 'none'}/>)}
            </span>
          </div>
        </div> : <div className="learn-panel learn-progress">
          <div className="learn-progress-heading"><div><BookOpen size={22} aria-hidden="true"/><strong>Concepts explored</strong></div><span>{explored} / {lessons.length}</span></div>
          <progress value={explored} max={lessons.length} aria-label="Concepts explored"/>
          <p>Try a visual example in each subject and come back for a quick review.</p>
        </div>}
      </section>
      <LearningModes mode={progress.mode}/>
      {arena ? <Labs filter={filter} onFilter={changeFilter} current={active} onChoose={choose} completed={progress.labs}/> :
        <Topics active={active.id} onChoose={choose} explored={progress.explored}/>}
      <Lab key={`lab-${active.id}`} lesson={active} mode={progress.mode} arena={arena} completed={progress.labs.includes(active.id)}/>
      {arena ? <>
        <Challenge key={`challenge-${active.id}`} lesson={active}/>
        <Quests/>
        <Recall/>
      </> : <Challenge key={`challenge-${active.id}`} lesson={active} practiceHref={`/learn/arena?topic=${active.id}#challenge`}/>}
    </main>
    <footer className="learn-wrap learn-footer"><span>Learning progress is saved on this browser.</span><Link href="/">ClassCode home <ArrowRight size={15}/></Link></footer>
  </div>;
}
