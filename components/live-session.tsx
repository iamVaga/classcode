'use client';
import {useState} from 'react';
import {Radio,X} from 'lucide-react';
import type {Project} from '@/lib/model';
import type {LiveDraft} from '@/lib/live';

export default function LiveSession({project}:{project:Project;observer:boolean;onDraft:(draft:LiveDraft)=>void;onEditAccess:(allowed:boolean)=>void;activeFile:string}){
 const [open,setOpen]=useState(false),[value,setValue]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function create(){
  setBusy(true);setError('');
  try{
   const response=await fetch('/api/rooms',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(project)});
   const result=await response.json();
   if(!response.ok)throw Error(result.error);
   window.location.assign('/session/'+result.code);
  }catch(e){setError(e instanceof Error?e.message:'Could not create room');setBusy(false)}
 }
 function join(){
  const code=value.trim().replace(/.*\/session\//,'').split(/[?#]/)[0].toLowerCase();
  if(!/^[a-f0-9]{20}$/.test(code)){setError('Enter a session code or a ClassCode session link.');return}
  window.location.assign('/session/'+code);
 }
 return <div className="live-session">
  <button className="live-trigger" onClick={()=>setOpen(v=>!v)} aria-expanded={open}><Radio size={14}/> Live session</button>
  {open&&<section className="live-panel" aria-label="Live session"><header><strong>Code together</strong><button aria-label="Close session panel" onClick={()=>setOpen(false)}><X size={16}/></button></header>
   <p>Create a room and share its code or link. Everyone in the room can edit. No account needed.</p>
   <button className="studio-primary" disabled={busy} onClick={()=>void create()}>{busy?'Creating room…':'Create session'}</button>
   <form onSubmit={e=>{e.preventDefault();join()}}><label>Session code or link<input aria-label="Session code or link" value={value} onChange={e=>setValue(e.target.value)} placeholder="Paste a code or link"/></label><button className="studio-secondary" type="submit">Join session</button></form>
   {error&&<p role="alert">{error}</p>}
   <small>Anyone with the link can edit. Rooms expire after 24 hours.</small>
  </section>}
 </div>
}
