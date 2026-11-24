'use client';

import {useState, type CSSProperties} from 'react';
import {ArrowLeft, ArrowRight, Check, RotateCcw} from 'lucide-react';
import CodePreview from '@/components/code-preview';
import Avatar from '@/components/avatar';
import {learning} from '@/lib/learn/progress';
import {buildTrace, labOptions, slicing} from '@/lib/learn/traces';
import {tracks, type Lesson, type Mode, type Scene} from '@/lib/learn/types';

const nodes = [
  {name: 'A', x: 200, y: 35}, {name: 'B', x: 110, y: 102}, {name: 'C', x: 290, y: 102},
  {name: 'D', x: 59, y: 171}, {name: 'E', x: 155, y: 171}, {name: 'F', x: 323, y: 171},
];
const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]];

export function SceneView({scene}: {scene: Scene}) {
  if (scene.kind === 'tables') return <div className="learn-board learn-tables">
    {scene.tables.map(table => <div key={table.title} className="learn-table-wrap">
      <table>
        <caption>{table.title}</caption>
        <thead><tr>{table.headers.map(header => <th scope="col" key={header}>{header}</th>)}</tr></thead>
        <tbody>{table.rows.map((row, index) => <tr key={index} data-match={table.active?.includes(index) || undefined}>
          {row.map((value, column) => <td key={column}>{value}{column === 0 && table.active?.includes(index) && <span className="learn-sr"> (matches)</span>}</td>)}
        </tr>)}</tbody>
      </table>
    </div>)}
  </div>;
  if (scene.kind === 'tree') return <div className="learn-board">
    <p className="learn-board-label">{scene.title}</p>
    <svg className="learn-tree" viewBox="0 0 400 200" role="img" aria-label="Tree A branches to B and C. B has children D and E. C has child F.">
      {edges.map(([parent, child]) => <line key={child} x1={nodes[parent].x} y1={nodes[parent].y} x2={nodes[child].x} y2={nodes[child].y}/>)}
      {nodes.map(node => <g key={node.name} data-tone={node.name === scene.active ? 'active' : scene.visited.includes(node.name) ? 'done' : undefined}>
        <circle cx={node.x} cy={node.y} r="20"/><text x={node.x} y={node.y + 5} textAnchor="middle">{node.name}</text>
      </g>)}
    </svg>
    <p className="learn-board-output">Visited: {scene.visited.join(' → ')}</p>
  </div>;
  return <div className="learn-board">
    <p className="learn-board-label">{scene.title}</p>
    <ol className={`learn-cells learn-${scene.kind}`} aria-label={scene.title}>
      {scene.cells.map((cell, index) => <li key={index} data-tone={cell.tone}>
        {scene.kind === 'chain' && index > 0 && <span className="learn-chain-arrow" aria-hidden="true">→</span>}
        {cell.top !== undefined && <span className="learn-cell-index">{cell.top}</span>}
        <strong className="learn-cell" style={scene.kind === 'bars' ? {'--bar-height': `${Number(cell.value) * 1.05 + 1.4}rem`} as CSSProperties : undefined}>
          {cell.value}{cell.tone && <span className="learn-sr"> ({cell.tone === 'active' ? 'highlighted' : cell.tone === 'done' ? 'finished' : 'ruled out'})</span>}
        </strong>
        {cell.bottom !== undefined && <span className="learn-cell-index">{cell.bottom}</span>}
      </li>)}
    </ol>
    {scene.cells.length === 0 && <p className="learn-board-output">Empty · waiting for an item</p>}
    {scene.kind === 'cells' && scene.metrics && <dl className="learn-metrics">
      {scene.metrics.map(metric => <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}
    </dl>}
    {scene.kind === 'cells' && scene.note && <p className="learn-board-output">{scene.note}</p>}
  </div>;
}

const slicePresets = [
  {label: '[:3]', start: 0, stop: 3}, {label: '[2:]', start: 2, stop: 6},
  {label: '[-2:]', start: -2, stop: 6}, {label: '[1:5]', start: 1, stop: 5},
];
const bounds = Array.from({length: 13}, (_, index) => index - 6);

export default function Lab({lesson, mode, arena, completed}: {lesson: Lesson; mode: Mode; arena: boolean; completed: boolean}) {
  const [step, setStep] = useState(0);
  const [selection, setSelection] = useState(0);
  const [slice, setSlice] = useState({start: 1, stop: 4});
  const interactiveSlice = lesson.id === 'slicing';
  const trace = interactiveSlice ? slicing(slice.start, slice.stop) : buildTrace(lesson.id, selection);
  const frame = trace.frames[step];
  const isLast = step === trace.frames.length - 1;
  const options = labOptions[lesson.id];

  function next() {
    const then = step + 1;
    setStep(then);
    if (then === trace.frames.length - 1) learning.finish(lesson.id);
  }

  function setBounds(start: number, stop: number) {
    setSlice({start, stop});
    learning.explore(lesson.id);
    if (arena) learning.finish(lesson.id);
  }

  return <section className="learn-panel learn-lab" aria-labelledby="lab-title">
    <header className="learn-lab-heading">
      <div><span className="learn-track-label" data-track={lesson.track}>{tracks[lesson.track]}</span>
        <h2 id="lab-title">{lesson.title}</h2><p>{lesson.subtitle}</p></div>
      {completed && <span className="learn-completed"><Check size={16}/> Lab complete</span>}
    </header>
    <div className="learn-lab-grid">
      <div className="learn-lab-main">
        <SceneView scene={frame.scene}/>
        {interactiveSlice ? <div className="learn-slice-controls">
          <div className="learn-control-group" role="group" aria-label="Quick picks">
            <strong>Quick picks</strong>
            {slicePresets.map(preset => <button type="button" className="learn-small" key={preset.label}
              aria-pressed={slice.start === preset.start && slice.stop === preset.stop} onClick={() => setBounds(preset.start, preset.stop)}>{preset.label}</button>)}
          </div>
          <div className="learn-control-group">
            <label>Start <select value={slice.start} onChange={e => setBounds(Number(e.target.value), slice.stop)}>
              {bounds.map(value => <option key={value}>{value}</option>)}
            </select></label>
            <label>Stop <select value={slice.stop} onChange={e => setBounds(slice.start, Number(e.target.value))}>
              {bounds.map(value => <option key={value}>{value}</option>)}
            </select></label>
            <button type="button" className="learn-small" onClick={() => setBounds(1, 4)}><RotateCcw size={15}/> Start over</button>
          </div>
        </div> : <>
          {options && <div className="learn-control-group" role="group" aria-label={options.label}><strong>{options.label}</strong>
            {options.choices.map((option, index) => <button type="button" className="learn-small" key={option} aria-pressed={selection === index}
              onClick={() => {setSelection(index); setStep(0); learning.explore(lesson.id);}}>{option}</button>)}
          </div>}
          <div className="learn-controls">
            <button type="button" className="learn-small" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft size={15}/> Back</button>
            <button type="button" className="learn-small learn-action" disabled={isLast} onClick={next}>Next step <ArrowRight size={15}/></button>
            <button type="button" className="learn-small" onClick={() => setStep(0)}><RotateCcw size={15}/> Start over</button>
            <span>Step {step + 1} of {trace.frames.length}</span>
          </div>
        </>}
        <div className="learn-note learn-note-warm" role="status"><strong>What is happening</strong><p>{frame.caption}</p></div>
      </div>
      <aside className="learn-explanation" aria-label="Code and explanation">
        <div className="learn-coach"><Avatar kind={0} size={54}/><p>{lesson.explanations[mode]}</p></div>
        <pre className="learn-code" tabIndex={0} aria-label="Example code">
          <span className="learn-code-label">{lesson.track === 'sql' ? 'SQL' : 'Python'} · highlighted line is the current step</span>
          {trace.code.map((line, number) => <span className="learn-code-line" data-current={frame.line === number || undefined} key={number}>
            <span aria-hidden="true">{number + 1}</span><CodePreview code={line || ' '}/>
          </span>)}
        </pre>
        <div className="learn-note learn-note-green"><strong>Remember</strong><ul>{lesson.remember.map(point => <li key={point}><Check size={16}/>{point}</li>)}</ul></div>
        <div className="learn-note learn-note-red"><strong>Common mistake</strong><p>{lesson.mistake}</p></div>
        <details className="learn-note"><summary>{lesson.detail.title}</summary><p>{lesson.detail.body}</p></details>
      </aside>
    </div>
  </section>;
}
