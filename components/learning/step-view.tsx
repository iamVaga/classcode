import type {CSSProperties} from 'react';
import type {Binding, State} from '@/lib/learn/engine/steps';

function Bindings({bindings, active}: {bindings: readonly Binding[]; active?: string}) {
  if (!bindings.length) return <p className="learn-board-output">No values yet</p>;
  return <dl className="learn-bindings">
    {bindings.map(binding => <div key={binding.name} data-active={binding.name === active || undefined}>
      <dt><code>{binding.name}</code>{binding.name === active && <span>Current</span>}</dt>
      <dd>{binding.value}</dd>
    </div>)}
  </dl>;
}

export default function StepView({state}: {state: State}) {
  if (state.kind === 'memory') return <div className="learn-board learn-engine-board">
    <p className="learn-board-label">Names and values</p>
    <Bindings bindings={state.bindings} active={state.active}/>
  </div>;

  if (state.kind === 'stack') return <div className="learn-board learn-engine-board">
    <p className="learn-board-label">Call stack</p>
    <ol className="learn-stack" aria-label="Call stack, active frame first">
      {state.frames.toReversed().map((frame, index) => <li key={frame.label}>
        <strong>{frame.label}</strong> <span>{index === 0 ? 'Active' : 'Waiting'}</span>
        <Bindings bindings={frame.bindings}/>
      </li>)}
    </ol>
  </div>;

  const max = Math.max(1, ...state.values.map(Math.abs));
  return <div className="learn-board learn-engine-board">
    <p className="learn-board-label">{state.sorted ? 'Sorted array' : 'Array values'}</p>
    <ol className="learn-engine-bars" style={{'--bar-count': state.values.length} as CSSProperties} aria-label="Array values from left to right">
      {state.values.map((value, index) => <li key={index} data-sign={value < 0 ? 'negative' : 'positive'} data-active={state.active.includes(index) || undefined}>
        <span className="learn-engine-bar" style={{'--bar-scale': Math.abs(value) / max} as CSSProperties} aria-hidden="true"/>
        <strong>{value}</strong>
        <small><span className="learn-sr">Index </span>{index}{state.active.includes(index) && <span className="learn-sr">, comparing</span>}</small>
      </li>)}
    </ol>
  </div>;
}
