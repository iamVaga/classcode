'use client';

import {useEffect, useMemo, useReducer, useRef, useState, type FormEvent} from 'react';
import {ArrowLeft, ArrowRight, Pause, Play, RotateCcw} from 'lucide-react';
import CodePreview from '@/components/code-preview';
import {controlsFor, draftFor, exampleCode, maxArrayLength, maxValue, minValue, parseInput, type VisualInput} from '@/lib/learn/engine/input';
import {generateSteps, type Prediction} from '@/lib/learn/engine/steps';
import {initialTimeline, updateTimeline} from '@/lib/learn/engine/timeline';
import type {ArenaLesson} from '@/lib/learn/schema';
import StepView from './step-view';
import WorkshopBuddy from './workshop-buddy';

function InputControls({example, onApply}: {example: VisualInput; onApply: (input: VisualInput) => void}) {
  const [draft, setDraft] = useState(() => draftFor(example));
  const [error, setError] = useState('');

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = parseInput(example.kind, draft);
    if (typeof input === 'string') {
      setError(input);
      return;
    }
    setError('');
    onApply(input);
  }

  return <form className="learn-editor-inputs" onSubmit={apply}>
    <fieldset>
      <legend>Change the input</legend>
      <p id="visual-input-help">{example.kind === 'insertion-sort'
        ? `Enter 1 to ${maxArrayLength} whole numbers separated by commas.`
        : `Use whole numbers from ${minValue} to ${maxValue}.`}</p>
      <div>
        {controlsFor(example).map(({name, label, array}) =>
          <label key={name}>{label}
            <input value={draft[name]} type="text" autoComplete="off" maxLength={array ? 64 : 5}
              aria-invalid={Boolean(error)} aria-describedby={error ? 'visual-input-help visual-input-error' : 'visual-input-help'} onChange={event => {
                setDraft({...draft, [name]: event.target.value});
                setError('');
              }}/>
          </label>
        )}
      </div>
      {error && <p id="visual-input-error" role="alert">{error}</p>}
      <div className="learn-controls">
        <button type="submit" className="learn-small learn-action">Apply input</button>
        <button type="button" className="learn-small" onClick={() => {
          setDraft(draftFor(example));
          setError('');
          onApply(example);
        }}>Use example values</button>
      </div>
    </fieldset>
  </form>;
}

function PredictionCard({prediction, onReveal}: {prediction: Prediction; onReveal: (choice?: number) => void}) {
  const [choice, setChoice] = useState<number>();
  const prompt = useRef<HTMLFieldSetElement>(null);
  useEffect(() => { prompt.current?.focus({preventScroll: true}); }, []);

  return <fieldset ref={prompt} tabIndex={-1} className="learn-prediction">
    <legend>{prediction.prompt}</legend>
    <div className="learn-prediction-options">
      {prediction.choices.map((text, index) => <label key={text}>
        <input type="radio" name="next-step-prediction" checked={choice === index} onChange={() => setChoice(index)}/>{text}
      </label>)}
    </div>
    <div className="learn-controls">
      <button type="button" className="learn-small learn-action" disabled={choice === undefined} onClick={() => onReveal(choice)}>Reveal next step</button>
      <button type="button" className="learn-small" onClick={() => onReveal()}>Skip prediction</button>
    </div>
  </fieldset>;
}

export default function Walkthrough({lesson, explanation}: {lesson: ArenaLesson; explanation: string}) {
  const [visual, setVisual] = useState(lesson.visual);
  const [timeline, dispatch] = useReducer(updateTimeline, initialTimeline);
  const steps = useMemo(() => generateSteps(visual), [visual]);
  const step = steps[timeline.index];
  const last = steps.length - 1;
  const prediction = timeline.pending === null ? undefined : steps[timeline.pending].meta.prediction;
  const {index, playing, speed, predictFirst} = timeline;
  const currentNote = useRef<HTMLDivElement>(null);
  const sample = lesson.codeSamples[0];
  const codeLines = useMemo(() => exampleCode(sample.source, visual).split('\n'), [sample.source, visual]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => dispatch({type: 'seek', index: index + 1, steps, autoplay: true}), 1100 / speed);
    return () => clearTimeout(timer);
  }, [index, playing, speed, steps]);

  function seek(index: number) {
    dispatch({type: 'seek', index, steps});
  }

  return <section className="learn-panel learn-lab" aria-labelledby="visual-lesson-title">
    <header className="learn-lab-heading">
      <div>
        <h2 id="visual-lesson-title">{lesson.title}</h2>
        <p>{lesson.summary}</p>
        <p className="learn-analogy"><strong>Picture this.</strong> {lesson.analogy}</p>
      </div>
    </header>
    <div className="learn-lab-grid">
      <div className="learn-lab-main">
        <StepView state={step.state}/>
        <div className="learn-timeline" role="group" aria-label="Timeline controls">
          <div className="learn-controls">
            <button className="learn-small" type="button" disabled={index === 0} onClick={() => seek(index - 1)}><ArrowLeft size={16}/> Back</button>
            <button className="learn-small" type="button" disabled={Boolean(prediction)} onClick={() => dispatch({type: 'play', last})}>
              {playing ? <Pause size={16}/> : <Play size={16}/>} {playing ? 'Pause' : 'Play'}
            </button>
            <button className="learn-small learn-action" type="button" disabled={index === last || Boolean(prediction)} onClick={() => seek(index + 1)}>
              Next step <ArrowRight size={16}/>
            </button>
            <button className="learn-small" type="button" onClick={() => dispatch({type: 'reset'})}><RotateCcw size={16}/> Reset</button>
          </div>
          <label className="learn-scrubber">
            <span>Timeline</span><span>Step {index + 1} of {steps.length}</span>
            <input type="range" min={0} max={last} value={index} aria-label="Timeline step"
              aria-valuetext={`Step ${index + 1} of ${steps.length}`} onChange={event => seek(event.currentTarget.valueAsNumber)}/>
          </label>
          <div className="learn-timeline-settings">
            <label>Speed <select value={speed} onChange={event => dispatch({type: 'speed', rate: Number(event.target.value)})}>
              <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option>
            </select></label>
            <label><input type="checkbox" checked={predictFirst} onChange={event => dispatch({type: 'predict', enabled: event.target.checked})}/> Predict First</label>
          </div>
        </div>
        {prediction && <PredictionCard key={timeline.pending} prediction={prediction} onReveal={choice => {
          const feedback = choice === undefined ? '' : choice === prediction.answer ? 'Your prediction matches.' : 'Here’s what happens.';
          dispatch({type: 'reveal', feedback});
          currentNote.current?.focus({preventScroll: true});
        }}/>}
        <div ref={currentNote} className="learn-note learn-note-warm" tabIndex={-1} role="status" aria-atomic="true">
          <strong>Step {index + 1}</strong>
          <p>{timeline.feedback && <strong>{timeline.feedback} </strong>}{step.note}</p>
          {step.meta.comparisons !== undefined && <p>Comparisons {step.meta.comparisons} · Swaps {step.meta.swaps}</p>}
          {step.meta.output !== undefined && <p><strong>Output </strong><code>{step.meta.output}</code></p>}
        </div>
        <InputControls example={lesson.visual} onApply={input => {
          setVisual(input);
          dispatch({type: 'reset'});
        }}/>
      </div>
      <aside className="learn-explanation" aria-label="Code and explanation">
        <WorkshopBuddy mood={prediction ? 'thinking' : index === last ? 'finished' : 'ready'}/>
        <p className="learn-note">{explanation}</p>
        <pre className="learn-code" tabIndex={0} aria-label={`${sample.title}, example code`}>
          <span className="learn-code-label">{sample.language === 'python' ? 'Python' : 'SQL'} · highlighted lines show the current step</span>
          {codeLines.map((line, index) => <span className="learn-code-line" data-current={step.highlightLines.includes(index + 1) || undefined} key={index}>
            <span>{index + 1}{step.highlightLines.includes(index + 1) && <span className="learn-sr"> (current)</span>}</span><CodePreview code={line || ' '}/>
          </span>)}
        </pre>
        <div className="learn-note learn-note-green"><strong>Remember</strong><ul>{lesson.remember.map(point => <li key={point}>{point}</li>)}</ul></div>
        <div className="learn-note learn-note-red"><strong>Common mistake</strong><p>{lesson.commonMistake}</p></div>
      </aside>
    </div>
  </section>;
}
