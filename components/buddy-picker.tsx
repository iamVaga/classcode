'use client';

import {useEffect, useRef, useState} from 'react';
import {Moon, Sparkles, Sun, X} from 'lucide-react';
import Avatar, {buddyNames, buddyOrange, referenceBuddies} from './avatar';
import {useTheme} from './theme-provider';

const swatches = [
  ['Coral', '#ff6c56'], ['Yellow', '#ffd341'], ['Mint', '#27bda6'], ['Blue', '#4c9df0'],
  ['Purple', '#8c6bf7'], ['Pink', '#ff8ac6'], ['Green', '#86da53'], ['Orange', buddyOrange],
] as const;
const accessories = [['none','Plain'], ['headphones','Headphones'], ['shades','Cool shades'], ['bow','Bow tie']] as const;
const buddyTraits: Record<number, string> = {3:'Quick and clever',0:'Ready to build',6:'Curious and bold',1:'Made for exploring',4:'A thoughtful guide',9:'Calm and creative'};

export default function BuddyPicker({kind,color,onSave,onClose}: {
  kind:number;
  color:string;
  onSave:(kind:number,color:string,gear:string)=>void;
  onClose:()=>void;
}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const {theme,toggleTheme}=useTheme();
  const [pick,setPick]=useState(kind);
  const [tint,setTint]=useState(color);
  const [gear,setGear]=useState(() => {
    const saved=typeof document==='undefined'?'none':document.documentElement.dataset.buddyGear;
    return accessories.find(([value])=>value===saved)?.[0] ?? 'none';
  });
  const [error,setError]=useState('');

  useEffect(()=>{
    const node=dialog.current;
    node?.showModal();
    return ()=>node?.close();
  },[]);

  function surprise() {
    const choices=referenceBuddies.filter(buddy=>buddy!==pick);
    setPick(choices[Math.floor(Math.random()*choices.length)]);
    setTint(swatches[Math.floor(Math.random()*swatches.length)][1]);
    setGear(accessories[Math.floor(Math.random()*accessories.length)][0]);
  }

  return <dialog ref={dialog} className="buddy-picker reference-buddy-picker" aria-labelledby="buddy-title" onCancel={onClose}>
    <header className="buddy-heading">
      <div>
        <small>Your coding buddy</small>
        <h2 id="buddy-title">Build a buddy to code with.</h2>
        <p>Pick a character, give it your favorite color and add something cool. Your buddy shows up in the editor.</p>
      </div>
      <div className="buddy-header-actions">
        <button className="buddy-pill" onClick={toggleTheme}>{theme==='dark'?<Sun size={16}/>:<Moon size={16}/>} {theme==='dark'?'Light mode':'Dark mode'}</button>
        <button className="buddy-pill buddy-close" aria-label="Close buddy studio" onClick={onClose}><X size={18}/></button>
      </div>
    </header>
    <div className="buddy-layout">
      <div className="buddy-stage">
        <strong className="buddy-speech">Let&apos;s write some code!</strong>
        <Sparkles className="buddy-stage-stars" aria-hidden="true"/>
        <div className="buddy-stage-character"><Avatar kind={pick} color={tint} gear={gear} size={310}/></div>
        <div className="buddy-nameplate" aria-live="polite"><strong>{buddyNames[pick]}</strong><small>{buddyTraits[pick] ?? 'Ready to code'}</small></div>
        <div className="buddy-stage-platform" aria-hidden="true"/>
      </div>
      <div className="buddy-controls">
        <fieldset>
          <legend><span>1</span>Pick a buddy</legend>
          <div className="buddy-grid">{referenceBuddies.map(buddy=>
            <button key={buddy} aria-label={buddyNames[buddy]} aria-pressed={pick===buddy} onClick={()=>setPick(buddy)}>
              <Avatar kind={buddy} color={tint} gear="none" size={buddy===4||buddy===9?150:86}/>
              <span>{buddyNames[buddy].split(' ')[0]}</span>
            </button>)}
          </div>
        </fieldset>
        <fieldset>
          <legend><span>2</span>Pick a color</legend>
          <div className="buddy-swatches">{swatches.map(([name,value])=>
            <button key={value} aria-label={name} title={name} aria-pressed={value===tint} style={{background:value}} onClick={()=>setTint(value)}/>)}</div>
        </fieldset>
        <fieldset>
          <legend><span>3</span>Add something cool</legend>
          <div className="buddy-options">{accessories.map(([value,label])=>
            <button key={value} className="buddy-pill" aria-pressed={gear===value} onClick={()=>setGear(value)}>{label}</button>)}</div>
        </fieldset>
        {error&&<p role="alert">{error}</p>}
        <div className="buddy-actions">
          <button className="buddy-pill" onClick={surprise}>Surprise me</button>
          <button className="buddy-pill buddy-save" onClick={()=>{
            try { onSave(pick,tint,gear); }
            catch { setError('Your browser could not save this buddy. Please try again.'); }
          }}>Use this buddy</button>
        </div>
      </div>
    </div>
  </dialog>;
}
