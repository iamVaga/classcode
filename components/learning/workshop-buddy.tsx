'use client';

import dynamic from 'next/dynamic';
import {useEffect, useState} from 'react';
import {Settings, Sparkles} from 'lucide-react';
import Avatar, {buddyNames, buddyOrange} from '../avatar';

const BuddyPicker = dynamic(() => import('../buddy-picker'), {ssr: false});
const key = 'classcode-avatar';
const changeEvent = 'classcode-avatar-change';
const initial = {kind: 0, color: buddyOrange, gear: 'none'};
const reactions = {
  ready: 'I’ll follow the steps with you.',
  thinking: 'Take a moment to predict.',
  finished: 'You reached the last step!',
};

export default function WorkshopBuddy({mood}: {mood: keyof typeof reactions}) {
  const [buddy, setBuddy] = useState(initial);
  const [customizing, setCustomizing] = useState(false);

  useEffect(() => {
    function read() {
      try {
        const saved = JSON.parse(localStorage.getItem(key) ?? 'null') as Partial<typeof initial> | null;
        const kind = saved?.kind;
        const color = saved?.color;
        const gear = saved?.gear;
        setBuddy({
          kind: typeof kind === 'number' && Number.isInteger(kind) && buddyNames[kind] ? kind : initial.kind,
          color: typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color) ? color : initial.color,
          gear: typeof gear === 'string' && ['none', 'headphones', 'shades', 'bow'].includes(gear) ? gear : initial.gear,
        });
      } catch {
        setBuddy(initial);
      }
    }
    read();
    window.addEventListener(changeEvent, read);
    window.addEventListener('storage', read);
    return () => {
      window.removeEventListener(changeEvent, read);
      window.removeEventListener('storage', read);
    };
  }, []);

  return <div className="learn-coach learn-workshop-buddy" data-mood={mood}>
    <Avatar {...buddy} size={58}/>
    <div><p>{reactions[mood]} {mood === 'finished' && <Sparkles size={15} aria-hidden="true"/>}</p>
      <button className="learn-small" type="button" onClick={() => {
        document.documentElement.dataset.buddyGear = buddy.gear;
        setCustomizing(true);
      }}><Settings size={15}/> Customize buddy</button>
    </div>
    {customizing && <BuddyPicker kind={buddy.kind} color={buddy.color} onClose={() => setCustomizing(false)} onSave={(kind, color, gear) => {
      const updated = {kind, color, gear};
      try {
        localStorage.setItem(key, JSON.stringify(updated));
        window.dispatchEvent(new Event(changeEvent));
      } catch {}
      document.documentElement.dataset.buddyGear = gear;
      setBuddy(updated);
      setCustomizing(false);
    }}/>}
  </div>;
}
