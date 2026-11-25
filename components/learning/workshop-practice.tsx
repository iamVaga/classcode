'use client';

import {useState, type FormEvent} from 'react';
import {ArrowRight, RotateCcw} from 'lucide-react';
import type {ArenaChallenge, ArenaLesson} from '@/lib/learn/schema';
import type {Mode} from '@/lib/learn/types';

const challengeNames = {
  predict: 'Predict the output',
  blank: 'Fill the blank',
  bug: 'Spot the bug',
  parsons: 'Reorder the lines',
  complexity: 'Match the complexity',
};

function Exercise({question, onNext}: {question: ArenaChallenge; onNext?: () => void}) {
  const [choice, setChoice] = useState<number>();
  const [draft, setDraft] = useState('');
  const [order, setOrder] = useState<number[]>([]);
  const [result, setResult] = useState<boolean>();
  const selected = 'options' in question ? choice !== undefined
    : question.kind === 'blank' ? Boolean(draft.trim()) : order.length === question.lines.length;

  function check(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult('options' in question ? choice === question.answer :
      question.kind === 'blank' ? question.answers.includes(draft.trim()) : order.every((line, position) => line === position));
  }

  return <form className="learn-exercise" onSubmit={check}>
    <fieldset>
      <legend>{question.prompt}</legend>
      {'options' in question ? <div className="learn-prediction-options">
        {question.options.map((option, index) => <label key={option}>
          <input type="radio" name={question.id} checked={choice === index} onChange={() => {
            setChoice(index);
            setResult(undefined);
          }}/>{option}
        </label>)}
      </div> : question.kind === 'blank' ? <label className="learn-blank">Your answer
        <input type="text" value={draft} autoComplete="off" maxLength={220} onChange={event => {
          setDraft(event.target.value);
          setResult(undefined);
        }}/>
      </label> : <div className="learn-order">
        <div role="group" aria-label="Available lines">
          {question.lines.map((line, index) => ({line, index})).toReversed().map(({line, index}) =>
            <button key={line} className="learn-small" type="button" disabled={order.includes(index)} onClick={() => {
              setOrder([...order, index]);
              setResult(undefined);
            }}>{line}</button>
          )}
        </div>
        <div>
          <span>Your order</span>
          <ol aria-label="Your ordered lines">{order.map(index => <li key={index}>{question.lines[index]}</li>)}</ol>
          <button type="button" className="learn-small" disabled={!order.length} onClick={() => {
            setOrder(order.slice(0, -1));
            setResult(undefined);
          }}><RotateCcw size={15}/> Undo last line</button>
        </div>
      </div>}
    </fieldset>
    <details className="learn-inline-hint"><summary>Show hint</summary><p>{question.hint}</p></details>
    <div className="learn-controls">
      <button type="submit" className="learn-small learn-action" disabled={!selected}>Check answer</button>
      {onNext && <button type="button" className="learn-small" onClick={onNext}>Next question <ArrowRight size={16}/></button>}
    </div>
    <div role="status">{result !== undefined && <p>
      <strong>{result ? 'That’s right. ' : 'Try another answer. '}</strong>
      {result ? question.explanation : question.hint}
    </p>}</div>
  </form>;
}

export default function WorkshopPractice({lesson, mode}: {lesson: ArenaLesson; mode: Mode}) {
  const questions = lesson.challenges.filter(question => question.mode === mode);
  const [number, setNumber] = useState(0);
  const question = questions[number];
  return <div className="learn-secondary-grid learn-workshop-practice">
    <section className="learn-panel learn-side-panel learn-challenge" aria-labelledby="visual-practice-title">
      <h2 id="visual-practice-title">Prove it</h2>
      <p className="learn-challenge-meta">{challengeNames[question.kind]} · {number + 1} of {questions.length}</p>
      <Exercise question={question} key={question.id}
        onNext={questions.length > 1 ? () => setNumber((number + 1) % questions.length) : undefined}/>
    </section>
    <section className="learn-panel learn-side-panel" aria-labelledby="visual-recall-title">
      <h2 id="visual-recall-title">Revise later</h2>
      <p>Say your answer before you open each card.</p>
      <div className="learn-workshop-recall">
        {lesson.flashcards.map(card => <details key={card.id} className="learn-note">
          <summary>{card.front}</summary><p>{card.back}</p>
        </details>)}
      </div>
    </section>
  </div>;
}
