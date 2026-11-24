'use client';

import {useState} from 'react';
import Link from 'next/link';
import {ArrowRight, Check, ChevronRight, CircleHelp, RotateCcw, Star} from 'lucide-react';
import {reviewCards} from '@/lib/learn/lessons';
import {learning, useLearningProgress} from '@/lib/learn/progress';
import {tracks, type Lesson, type Track} from '@/lib/learn/types';

export function Challenge({lesson, practiceHref}: {lesson: Lesson; practiceHref?: string}) {
  const [number, setNumber] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const question = lesson.questions[number];
  const correct = picked === question.answer;
  function choose(index: number) {
    if (correct || picked === index) return;
    setPicked(index);
    learning.answer(`${lesson.id}:${number}`, index === question.answer);
  }
  return <section className="learn-panel learn-challenge" id="challenge" aria-labelledby="challenge-title">
    <div className="learn-challenge-meta"><span>{practiceHref ? 'Quick check' : 'Challenge'}</span><span>+30 XP</span><small>Question {number + 1} of {lesson.questions.length}</small></div>
    <h2 id="challenge-title">{question.prompt}</h2>
    {practiceHref && <div className="learn-answer-actions">
      <button type="button" className="learn-small" aria-expanded={showChoices} aria-controls="learn-choice-panel" onClick={() => setShowChoices(value => !value)}>
        {showChoices ? 'Hide choices' : 'Show choices'}
      </button>
      <Link className="learn-button learn-violet" href={practiceHref}>Practice in Revision Arena <ArrowRight size={17}/></Link>
    </div>}
    <div id="learn-choice-panel" hidden={Boolean(practiceHref && !showChoices)}>
      <div className="learn-answers" role="group" aria-label="Choose an answer">
        {question.options.map((option, index) => <button type="button" key={option} onClick={() => choose(index)} disabled={correct}
          data-result={picked === index ? correct ? 'correct' : 'incorrect' : undefined}>
          <b aria-hidden="true">{String.fromCharCode(65 + index)}</b>{option}
          {picked === index && <span className="learn-sr"> · {correct ? 'correct' : 'try again'}</span>}
        </button>)}
      </div>
      <div className="learn-answer-actions">
        {!correct && <button type="button" className="learn-small" onClick={() => setHint(value => !value)} aria-expanded={hint}>
          <CircleHelp size={16}/>{hint ? 'Hide hint' : 'Show a hint'}
        </button>}
        <div role="status">{correct ? <p><strong>That’s right.</strong> {question.explain}</p> :
          picked !== null || hint ? <p><strong>{picked !== null ? 'Try another answer. ' : 'Hint. '}</strong>{hint ? question.hint : 'A hint is available if you need it.'}</p> : null}</div>
        {correct && <button type="button" className="learn-small learn-action" onClick={() => {
          setNumber((number + 1) % lesson.questions.length);
          setPicked(null);
          setHint(false);
        }}>{number + 1 < lesson.questions.length ? 'Next question' : 'Practice again'} <ChevronRight size={16}/></button>}
      </div>
    </div>
  </section>;
}

export function Quests() {
  const {progress, today} = useLearningProgress();
  const answered = today.rewards.some(reward => reward.startsWith('question:'));
  const quests = [
    {title: 'Finish any lab', done: today.finishedLab, count: today.finishedLab ? '1 of 1' : '0 of 1'},
    {title: 'Answer a challenge correctly', done: answered, count: answered ? '1 of 1' : '0 of 1'},
    {title: 'Earn 60 XP', done: today.xp >= 60, count: `${Math.min(today.xp, 60)} of 60 XP`},
  ];
  const badges = [
    {title: 'Loop Master', earned: progress.passed.some(id => id.startsWith('loops:'))},
    {title: 'Stack Hero', earned: progress.passed.some(id => id.startsWith('stack-queue:'))},
    {title: 'Sort Star', earned: progress.passed.some(id => id.startsWith('bubble-sort:'))},
    {title: 'Search Sleuth', earned: progress.passed.some(id => id.startsWith('binary-search:'))},
    {title: 'SQL Explorer', earned: progress.passed.some(id => ['select:', 'join:', 'group-by:'].some(topic => id.startsWith(topic)))},
    {title: 'Memory Champ', earned: progress.mastered.length >= 5},
  ];
  return <section id="quests" className="learn-secondary-grid" aria-label="Quests and badges">
    <div className="learn-panel learn-side-panel">
      <h2>Daily quests</h2><ul className="learn-quests">{quests.map(quest => <li key={quest.title}>
        <span data-done={quest.done}><Check size={14} aria-hidden="true"/></span><div><strong>{quest.title}</strong><small>{quest.count}</small></div>
      </li>)}</ul>
    </div>
    <div className="learn-panel learn-side-panel">
      <h2>Badges</h2><ul className="learn-badges">{badges.map(badge => <li key={badge.title} data-earned={badge.earned}>
        <span><Star size={22} aria-hidden="true" fill={badge.earned ? 'currentColor' : 'none'}/></span><strong>{badge.title}</strong><small>{badge.earned ? 'Earned' : 'Locked'}</small>
      </li>)}</ul>
    </div>
  </section>;
}

export function Recall() {
  const [track, setTrack] = useState<Track | 'all'>('all');
  return <section id="recall" className="learn-recall" aria-labelledby="recall-title">
    <p className="learn-overline">Quick recall</p>
    <h2 id="recall-title">Flip it. Say it. Check it.</h2>
    <p>Say the answer in your own words before you flip. Send tricky cards to the back of the deck.</p>
    <div className="learn-control-group" role="group" aria-label="Recall subjects">
      {(['all', 'python', 'dsa', 'sql'] as const).map(option => <button type="button" className="learn-small" aria-pressed={track === option}
        key={option} onClick={() => setTrack(option)}>{option === 'all' ? 'All subjects' : tracks[option]}</button>)}
    </div>
    <RecallDeck key={track} track={track}/>
  </section>;
}

function RecallDeck({track}: {track: Track | 'all'}) {
  const {progress} = useLearningProgress();
  const cards = reviewCards.filter(card => track === 'all' || card.track === track);
  const [deck, setDeck] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = deck[index];
  const mastered = cards.filter(item => progress.mastered.includes(item.id));

  function rate(correct: boolean) {
    learning.recall(card.id, correct);
    if (correct) setIndex((index + 1) % deck.length);
    else {
      setDeck([...deck.slice(0, index), ...deck.slice(index + 1), card]);
      if (index === deck.length - 1) setIndex(0);
    }
    setFlipped(false);
  }
  return <div className="learn-recall-grid">
    <div>
      <button type="button" className="learn-panel learn-flashcard" onClick={() => setFlipped(value => !value)}>
        <small>{flipped ? 'Answer' : 'Term'} · card {index + 1} of {deck.length}</small>
        <span aria-live="polite">{flipped ? card.answer : card.term}</span>
        <small className="learn-sr">{flipped ? 'Show term' : 'Reveal answer'}</small>
      </button>
      <div className="learn-controls">
        <button type="button" className="learn-small learn-again" onClick={() => rate(false)} disabled={!flipped}><RotateCcw size={15}/> Again</button>
        <button type="button" className="learn-small" aria-pressed={flipped} onClick={() => setFlipped(value => !value)}>Flip</button>
        <button type="button" className="learn-small learn-got-it" onClick={() => rate(true)} disabled={!flipped}><Check size={15}/> Got it</button>
      </div>
    </div>
    <div className="learn-panel learn-side-panel">
      <h3>Mastered {mastered.length} of {cards.length}</h3>
      <progress aria-label="Cards mastered" max={cards.length} value={mastered.length}/>
      <div className="learn-recall-tags">
        {deck.map((item, position) => <button type="button" className="learn-small" key={item.id} aria-pressed={position === index} onClick={() => {
          setIndex(position); setFlipped(false);
        }}>{progress.mastered.includes(item.id) && <Check size={13}/>} {item.term}</button>)}
      </div>
    </div>
  </div>;
}
