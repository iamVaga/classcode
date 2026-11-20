'use client';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Accessibility,Check,Type,X} from 'lucide-react';

type Preferences={age:'junior'|'teen'|'adult-teacher';readable:boolean;contrast:boolean;readAloud:boolean};
const defaults:Preferences={age:'teen',readable:false,contrast:false,readAloud:false};
function apply(value:Preferences){
 const root=document.documentElement;
 root.dataset.age=value.age;
 root.dataset.readable=value.readable?'on':'off';
 root.dataset.contrast=value.contrast?'high':'normal';
 root.dataset.readAloud=value.readAloud?'on':'off';
 try{localStorage.setItem('classcode-accessibility',JSON.stringify(value))}catch{}
 window.dispatchEvent(new CustomEvent('classcode-preferences-change',{detail:value}));
}

export default function AccessibilityMenu(){
 const [open,setOpen]=useState(false),[value,setValue]=useState(defaults);
 const panel=useRef<HTMLElement>(null);
 useEffect(()=>{
  try{
   const stored=localStorage.getItem('classcode-accessibility');
   const next=stored?{...defaults,...JSON.parse(stored)}:defaults;
   setValue(next);apply(next);
  }catch{apply(defaults)}
 },[]);
 useEffect(()=>{
  if(!open)return;
  const previous=document.activeElement as HTMLElement|null;
  panel.current?.querySelector<HTMLElement>('button')?.focus();
  function keydown(event:KeyboardEvent){
   if(event.key==='Escape'){event.preventDefault();setOpen(false)}
   if(event.key!=='Tab')return;
   const controls=panel.current?.querySelectorAll<HTMLElement>('button,select,input');
   if(!controls?.length)return;
   const first=controls[0],last=controls[controls.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
  document.addEventListener('keydown',keydown);
  return()=>{document.removeEventListener('keydown',keydown);previous?.focus()};
 },[open]);
 function update(next:Partial<Preferences>){
  const merged={...value,...next};setValue(merged);apply(merged);
 }
 return <div className="accessibility-menu">
  <button className="icon-button" aria-label="Accessibility and reading preferences" aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(v=>!v)}><Accessibility size={17}/><span className="comfort-trigger-label">Reading &amp; comfort</span></button>
  {open&&createPortal(<div className="comfort-backdrop" onClick={()=>setOpen(false)}>
   <section ref={panel} className="accessibility-panel comfort-dialog" role="dialog" aria-modal="true" aria-labelledby="comfort-title" onClick={event=>event.stopPropagation()}>
    <header><div><span className="comfort-subtitle">Workspace preferences</span><h2 id="comfort-title">Reading &amp; comfort</h2></div><button className="icon-button" aria-label="Close reading preferences" onClick={()=>setOpen(false)}><X size={18}/></button></header>
    <label className="comfort-age">Writing style<select value={value.age} onChange={e=>update({age:e.target.value as Preferences['age']})}><option value="junior">Junior · ages 10–12</option><option value="teen">Teen · ages 13–18</option><option value="adult-teacher">Adult · teacher</option></select></label>
    <div className="comfort-options">
     <label className="accessibility-check"><input type="checkbox" checked={value.readable} onChange={e=>update({readable:e.target.checked})}/><span><strong><Type size={14}/> Reading-friendly type</strong><small>Use Lexend with extra letter spacing.</small></span>{value.readable&&<Check size={14}/>}</label>
     <label className="accessibility-check"><input type="checkbox" checked={value.contrast} onChange={e=>update({contrast:e.target.checked})}/><span><strong>High contrast</strong><small>Strengthen text, borders, and focus states.</small></span>{value.contrast&&<Check size={14}/>}</label>
     <label className="accessibility-check"><input type="checkbox" checked={value.readAloud} onChange={e=>update({readAloud:e.target.checked})}/><span><strong>Read hints aloud</strong><small>Speak each new Python hint.</small></span>{value.readAloud&&<Check size={14}/>}</label>
    </div>
    <footer><small>Code size is in the editor toolbar. Shortcuts open with Ctrl + K.</small><button className="studio-primary" onClick={()=>setOpen(false)}>Done</button></footer>
   </section>
  </div>,document.body)}
 </div>;
}
