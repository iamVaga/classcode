'use client';
import {useEffect,useRef,useState} from 'react';
import Avatar from './avatar';
export default function AvatarPointer(){
 const element=useRef<HTMLDivElement>(null);const [enabled,setEnabled]=useState(true),[config,setConfig]=useState({kind:0,color:'#c4b5fd'});
 useEffect(()=>{const read=()=>{try{const saved=JSON.parse(localStorage.getItem('classcode-avatar')||'null');if(saved)setConfig(saved);setEnabled(localStorage.getItem('classcode-avatar-pointer')!=='off')}catch{}};read();window.addEventListener('classcode-avatar-change',read);window.addEventListener('storage',read);return()=>{window.removeEventListener('classcode-avatar-change',read);window.removeEventListener('storage',read)}},[]);
 useEffect(()=>{
  if(!enabled||!matchMedia('(pointer:fine)').matches)return;
  let frame=0;const hide=()=>{document.documentElement.classList.remove('avatar-pointer-on');if(element.current)element.current.style.opacity='0'};
  const move=(event:PointerEvent)=>{if(event.pointerType==='touch')return;const target=event.target as HTMLElement;if(target.closest('input,textarea,[contenteditable],.monaco-editor,iframe')){hide();return}document.documentElement.classList.add('avatar-pointer-on');cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(element.current){element.current.style.transform=`translate3d(${event.clientX}px,${event.clientY}px,0)`;element.current.style.opacity='1'}})};
  const down=()=>element.current?.classList.add('clicked'),up=()=>element.current?.classList.remove('clicked');
  const key=(e:KeyboardEvent)=>{if(e.key==='Tab')hide()};window.addEventListener('pointermove',move,{passive:true});window.addEventListener('pointerdown',down);window.addEventListener('pointerup',up);window.addEventListener('keydown',key);document.addEventListener('mouseleave',hide);window.addEventListener('blur',hide);
  return()=>{cancelAnimationFrame(frame);hide();window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',down);window.removeEventListener('pointerup',up);window.removeEventListener('keydown',key);document.removeEventListener('mouseleave',hide);window.removeEventListener('blur',hide)};
 },[enabled]);
 return <><div ref={element} className="avatar-pointer" aria-hidden="true"><span className="pointer-hotspot"/><Avatar kind={config.kind} color={config.color} size={29}/><span className="pointer-spark">✦</span></div><button className="pointer-toggle" aria-pressed={enabled} onClick={()=>{setEnabled(!enabled);try{localStorage.setItem('classcode-avatar-pointer',enabled?'off':'on')}catch{}}} title="Toggle avatar cursor"><Avatar kind={config.kind} color={config.color} size={23}/><span>Avatar cursor <b>{enabled?'ON':'OFF'}</b></span></button></>
}
