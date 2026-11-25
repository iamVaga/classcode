'use client';

import {Check, Compass, Layers3, Zap} from 'lucide-react';
import {learning} from '@/lib/learn/progress';
import type {Mode} from '@/lib/learn/types';

const modes = [
  {id: 'explorer', title: 'Explorer', copy: 'See the idea in everyday words.', icon: Compass},
  {id: 'builder', title: 'Builder', copy: 'Connect the idea to each line of code.', icon: Layers3},
  {id: 'pro', title: 'Pro', copy: 'Dig into trade-offs and edge cases.', icon: Zap},
] as const;

export default function LearningModes({mode}: {mode: Mode}) {
  return <fieldset className="learn-modes">
    <legend>Choose how you learn</legend>
    <div>{modes.map(({id, title, copy, icon: Icon}) =>
      <button type="button" aria-pressed={mode === id} data-mode={id} key={id} onClick={() => learning.mode(id)}>
        <Icon size={22} aria-hidden="true"/><strong>{title}</strong><span>{copy}</span>
        {mode === id && <Check size={16} className="learn-mode-check" aria-hidden="true"/>}
      </button>
    )}</div>
  </fieldset>;
}
