'use client';
import {useEffect,useRef,useState} from 'react';
import Avatar from './avatar';

export default function AvatarPointer(){
 const element=useRef<HTMLDivElement>(null);
 const hovered=useRef<Element|null>(null);
 const [enabled,setEnabled]=useState(false);
 const [config,setConfig]=useState({kind:0,color:'#c4b5fd'});
 useEffect(()=>{
  const read=()=>{try{const saved=JSON.parse(localStorage.getItem('classcode-avatar')||'null');if(saved)setConfig(saved);const active=localStorage.getItem('classcode-avatar-pointer')==='on'&&matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches;setEnabled(active);if(!active)localStorage.setItem('classcode-avatar-pointer','off')}catch{setEnabled(false)}};
  const toggle=(event:Event)=>{const enabled=(event as CustomEvent<{enabled:boolean}>).detail?.enabled===true;setEnabled(enabled);try{localStorage.setItem('classcode-avatar-pointer',enabled?'on':'off')}catch{}};
  read();window.addEventListener('classcode-avatar-change',read);window.addEventListener('storage',read);window.addEventListener('classcode-avatar-pointer',toggle);
  return()=>{window.removeEventListener('classcode-avatar-change',read);window.removeEventListener('storage',read);window.removeEventListener('classcode-avatar-pointer',toggle)};
 },[]);
 useEffect(()=>{
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  if(!enabled||!matchMedia('(pointer:fine)').matches||motion.matches)return;
  let frame=0;
  const hide=()=>{document.documentElement.classList.remove('avatar-pointer-on');hovered.current?.classList.remove('avatar-pointer-target');hovered.current=null;if(element.current)element.current.style.opacity='0'};
  const move=(event:PointerEvent)=>{
   if(event.pointerType==='touch')return;
   const target=event.target instanceof Element?event.target:null;
   if(!target||target.closest('a,button,input,textarea,select,summary,[role="button"],[role="tab"],[contenteditable="true"],.monaco-editor,iframe')){hide();return}
   if(hovered.current!==target){hovered.current?.classList.remove('avatar-pointer-target');target.classList.add('avatar-pointer-target');hovered.current=target}
   document.documentElement.classList.add('avatar-pointer-on');cancelAnimationFrame(frame);
   frame=requestAnimationFrame(()=>{if(element.current){element.current.style.transform=`translate3d(${event.clientX}px,${event.clientY}px,0)`;element.current.style.opacity='1'}});
  };
  const down=()=>element.current?.classList.add('clicked'),up=()=>element.current?.classList.remove('clicked');
  const key=(event:KeyboardEvent)=>{if(event.key==='Tab')hide()};
  window.addEventListener('pointermove',move,{passive:true});window.addEventListener('pointerdown',down);window.addEventListener('pointerup',up);window.addEventListener('keydown',key);document.addEventListener('mouseleave',hide);window.addEventListener('blur',hide);
  const motionChange=()=>{if(motion.matches){hide();setEnabled(false);try{localStorage.setItem('classcode-avatar-pointer','off')}catch{}}};
  motion.addEventListener('change',motionChange);
  return()=>{cancelAnimationFrame(frame);hide();motion.removeEventListener('change',motionChange);window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',down);window.removeEventListener('pointerup',up);window.removeEventListener('keydown',key);document.removeEventListener('mouseleave',hide);window.removeEventListener('blur',hide)};
 },[enabled]);
 return <div ref={element} className="avatar-pointer" aria-hidden="true"><span className="pointer-hotspot"/><Avatar kind={config.kind} color={config.color} size={29}/></div>;
}
