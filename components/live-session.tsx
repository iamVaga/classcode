'use client';
import {useState} from 'react';
import {Radio,X,Copy} from 'lucide-react';
import {createPortal} from 'react-dom';
import {usePathname,useRouter} from 'next/navigation';
import type {Project} from '@/lib/model';
import type {LiveDraft} from '@/lib/live';

export default function LiveSession({project}:{project:Project;observer:boolean;onDraft:(draft:LiveDraft)=>void;onEditAccess:(allowed:boolean)=>void;activeFile:string}){
 const router=useRouter();
 const pathname=usePathname();
 const roomCode=pathname.startsWith('/session/')?pathname.split('/')[2]:'';
 const [open,setOpen]=useState(false),[value,setValue]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [copied,setCopied]=useState('');
 async function copy(text:string,label:string){
  try{await navigator.clipboard.writeText(text);setCopied(label)}catch{setError('Select and copy the code or link below.')}
 }
 async function create(){
  setBusy(true);setError('');
  try{
   const response=await fetch('/api/rooms',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(project)});
   const result=await response.json();
   if(!response.ok)throw Error(result.error);
   router.push('/session/'+result.code);
  }catch(e){setError(e instanceof Error?e.message:'Could not create room');setBusy(false)}
 }
 function join(){
  const code=value.trim().replace(/.*\/session\//,'').split(/[?#]/)[0].toLowerCase();
  if(!/^[a-f0-9]{20}$/.test(code)){setError('Enter a session code or a ClassCode session link.');return}
  router.push('/session/'+code);
 }
 return <div className="live-session">
  <button className="live-trigger" onClick={()=>setOpen(true)} aria-label="Share with my teacher" aria-haspopup="dialog" aria-expanded={open}><Radio size={14}/><span>Share with my teacher</span></button>
  {open&&createPortal(<div className="room-share-backdrop" onClick={()=>setOpen(false)}><section className="room-share-dialog" role="dialog" aria-modal="true" aria-label="Share or join a session" onClick={event=>event.stopPropagation()} onKeyDown={event=>{if(event.key==='Escape')setOpen(false)}}><header><h2>Code together</h2><button autoFocus aria-label="Close session panel" onClick={()=>setOpen(false)}><X size={20}/></button></header>
   <p>Create a room and share its code or link. Everyone in the room can edit. No account needed.</p>
   {roomCode?<div className="room-share-invite"><label>Session code<input readOnly value={roomCode} aria-label="Shareable session code"/></label><button className="studio-secondary" onClick={()=>void copy(roomCode,'Code copied')}><Copy size={16}/>Copy code</button><label>Invite link<input readOnly value={window.location.origin+pathname} aria-label="Shareable invite link"/></label><button className="studio-primary" onClick={()=>void copy(window.location.origin+pathname,'Link copied')}><Copy size={16}/>Copy invite link</button><span role="status">{copied}</span></div>:<button className="studio-primary" disabled={busy} onClick={()=>void create()}>{busy?'Creating your code…':'Create session code and link'}</button>}
   <form onSubmit={e=>{e.preventDefault();join()}}><label>Session code or link<input aria-label="Session code or link" value={value} onChange={e=>setValue(e.target.value)} placeholder="Paste a code or link"/></label><button className="studio-secondary" type="submit">Join session</button></form>
   {error&&<p role="alert">{error}</p>}
   <small>Anyone with the link can edit. Rooms expire after 24 hours.</small>
  </section></div>,document.body)}
 </div>
}
