'use client';
import {useEffect,useRef,useState} from 'react';
import {Radio,Users,Eye,ShieldCheck,X,RefreshCw,Check,MessageSquareText} from 'lucide-react';
import * as Y from 'yjs';
import {db} from '@/lib/supabase';
import type {Project} from '@/lib/model';
import {LiveDraft,validDraft} from '@/lib/live';
import {createLiveFiles,decodeLiveUpdate,encodeLiveUpdate,readLiveFiles,replaceLiveText,teacherMayEdit} from '@/lib/live-crdt';


export default function LiveSession({project,observer,onDraft,onEditAccess,activeFile}:{project:Project;observer:boolean;onDraft:(draft:LiveDraft)=>void;onEditAccess:(allowed:boolean)=>void;activeFile:string}){
 const [open,setOpen]=useState(false),[joined,setJoined]=useState(false),[status,setStatus]=useState('Not connected'),[people,setPeople]=useState(0),[editConsent,setEditConsent]=useState(false),[suggestion,setSuggestion]=useState(''),[incoming,setIncoming]=useState<{file:string;code:string;author:string}|null>(null),[authEpoch,setAuthEpoch]=useState(0);
 const sessionId=useRef(''),latest=useRef(project),receive=useRef(onDraft),channel=useRef<ReturnType<NonNullable<typeof db>['channel']>|null>(null),doc=useRef<Y.Doc|null>(null),files=useRef<Y.Map<Y.Text>|null>(null),sending=useRef(false);
 useEffect(()=>{sessionId.current=crypto.randomUUID()},[]);
 useEffect(()=>{latest.current=project;receive.current=onDraft},[project,onDraft]);
 useEffect(()=>{
  if(!joined||!db||!project.owner_id)return;
  let cancelled=false;setStatus('Connecting securely…');if(observer)onEditAccess(false);
  const {doc:ydoc,files:yfiles}=createLiveFiles();doc.current=ydoc;files.current=yfiles;
  if(!observer){ydoc.transact(()=>{for(const [name,code] of Object.entries(latest.current.files)){const text=new Y.Text();text.insert(0,code);yfiles.set(name,text)}},'seed')}
  const applyToEditor=()=>{if(cancelled||sending.current)return;const nextFiles=readLiveFiles(yfiles);if(!Object.keys(nextFiles).length)return;const next={name:latest.current.name,files:nextFiles,sequence:Date.now(),session:sessionId.current,version:latest.current.version};if(validDraft(next))receive.current(next)};
  const broadcast=(event:string,payload:unknown)=>{if(!cancelled)void channel.current?.send({type:'broadcast',event,payload}).then(result=>{if(!cancelled&&result!=='ok')setStatus(result==='timed out'?'Update timed out · reconnecting':'Could not send update · check your connection')}).catch(()=>{if(!cancelled)setStatus('Connection lost · reconnect to keep working')})};
  const onUpdate=(update:Uint8Array,origin:unknown)=>{if(origin==='remote'||origin==='seed'||cancelled)return;broadcast('crdt-update',{update:encodeLiveUpdate(update),author:observer?'teacher':'student'})};
  ydoc.on('update',onUpdate);ydoc.on('update',applyToEditor);
  void(async()=>{try{
   const {data,error}=await db!.auth.getSession();if(error||!data.session)throw Error('Sign in again to join this session.');
   await db!.realtime.setAuth(data.session.access_token);if(cancelled)return;
   const room=db!.channel('project:'+project.id,{config:{private:true,broadcast:{ack:false,self:false},presence:{key:data.session.user.id}}});channel.current=room;
   room.on('broadcast',{event:'crdt-update'},({payload})=>{try{if(typeof payload?.update!=='string')return;Y.applyUpdate(ydoc,decodeLiveUpdate(payload.update),'remote');if(payload.author==='teacher')setStatus('Your teacher suggested a change')}catch{setStatus('A live update could not be read · reconnect to resync')}});
   room.on('broadcast',{event:'sync-request'},()=>{if(!observer)broadcast('crdt-update',{update:encodeLiveUpdate(Y.encodeStateAsUpdate(ydoc)),author:'student'})});
   room.on('broadcast',{event:'suggestion'},({payload})=>{if(!observer||typeof payload?.file!=='string'||typeof payload?.code!=='string'||payload.code.length>200000||!Object.hasOwn(latest.current.files,payload.file))return;setIncoming({file:payload.file,code:payload.code,author:'Your teacher'})});
   room.on('broadcast',{event:'consent'},({payload})=>{if(observer&&typeof payload?.allowed==='boolean'){setEditConsent(payload.allowed);onEditAccess(payload.allowed);setStatus(payload.allowed?'You approved shared editing':'Your teacher is here · suggesting only');setAuthEpoch(value=>value+1)}});
   room.on('broadcast',{event:'ended'},()=>{if(!cancelled&&observer){setStatus('Student ended sharing');onEditAccess(false);setEditConsent(false)}});
   room.on('presence',{event:'sync'},()=>{if(cancelled)return;const members=Object.keys(room.presenceState());setPeople(members.length);if(observer)setStatus(members.includes(project.owner_id!)?'Your teacher is here · suggestions are on':'Waiting for student to share')});
   room.subscribe(async state=>{if(cancelled)return;if(state==='SUBSCRIBED'){try{await room.track({joined_at:new Date().toISOString(),role:observer?'teacher':'student'});if(cancelled)return;setStatus(observer?'Waiting for student to share':'Sharing live · teacher suggestions are on');if(observer){const auth=await db!.auth.getUser();if(auth.data.user){const permission=await db!.from('project_edit_consents').select('project_id').eq('project_id',project.id).eq('teacher_id',auth.data.user.id).maybeSingle();if(permission.data){onEditAccess(true);setEditConsent(true);setStatus('You approved shared editing')}}}if(observer)broadcast('sync-request',{});else broadcast('crdt-update',{update:encodeLiveUpdate(Y.encodeStateAsUpdate(ydoc)),author:'student'})}catch{setStatus('Connected, but presence could not start. Leave and rejoin.')}}else if(state==='CHANNEL_ERROR'||state==='TIMED_OUT'||state==='CLOSED'){setStatus(state==='TIMED_OUT'?'Connection timed out · check your network':'Could not join. Check sign-in and classroom access.');setPeople(0);if(observer)onEditAccess(false)}});
  }catch(e){if(!cancelled){setStatus(e instanceof Error?e.message:'Could not connect. Please retry.');if(observer)onEditAccess(false)}}})();
  return()=>{cancelled=true;ydoc.off('update',onUpdate);ydoc.destroy();if(channel.current){if(!observer)void channel.current.send({type:'broadcast',event:'ended',payload:{}});void db!.removeChannel(channel.current)}channel.current=null;doc.current=null;files.current=null;setPeople(0);if(observer)onEditAccess(false)};
 },[joined,project.id,project.owner_id,observer,onEditAccess,authEpoch]);
 useEffect(()=>{if(!joined||!teacherMayEdit(observer,editConsent)||!files.current)return;const yfiles=files.current;const timer=setTimeout(()=>{sending.current=true;doc.current?.transact(()=>{for(const [name,code] of Object.entries(project.files)){let text=yfiles.get(name);if(!text){text=new Y.Text();yfiles.set(name,text)}replaceLiveText(text,code)}for(const name of Array.from(yfiles.keys()))if(!Object.hasOwn(project.files,name))yfiles.delete(name)},'editor');sending.current=false},160);return()=>clearTimeout(timer)},[project.files,joined,observer,editConsent]);
 const toggle=()=>{if(joined){setJoined(false);setEditConsent(false);if(observer)onEditAccess(false);setStatus(observer?'Session left':'Sharing is off')}else{if(observer)onEditAccess(false);setJoined(true)}};
 const sendSuggestion=()=>{if(!suggestion.trim()||!channel.current)return;channel.current.send({type:'broadcast',event:'suggestion',payload:{file:activeFile,code:suggestion.slice(0,200000)}});setSuggestion('');setStatus('Suggestion sent · student decides whether to use it')};
 const allowEditing=async(allowed:boolean)=>{if(observer||!db||!project.owner_id)return;setStatus(allowed?'Saving your permission…':'Turning off direct editing…');const auth=await db.auth.getUser();if(!auth.data.user){setStatus('Sign in again to update sharing permissions.');return}if(allowed){const teachers=await db.from('teacher_students').select('teacher_id').eq('student_id',auth.data.user.id);if(teachers.error||!teachers.data?.length){setStatus('No assigned teacher is linked to this project yet.');return}const result=await db.from('project_edit_consents').insert(teachers.data.map(({teacher_id})=>({project_id:project.id,student_id:auth.data.user!.id,teacher_id})));if(result.error){setStatus('Could not save permission. Please try again.');return}}else{const result=await db.from('project_edit_consents').delete().eq('project_id',project.id).eq('student_id',auth.data.user.id);if(result.error){setStatus('Could not turn off permission. Please try again.');return}}setEditConsent(allowed);onEditAccess(false);void channel.current?.send({type:'broadcast',event:'consent',payload:{allowed}});setStatus(allowed?'Direct editing approved':'Direct editing turned off')};
 return <div className="live-session">
  <button className={'live-trigger '+(joined&&people>1?'connected':'')} aria-expanded={open} onClick={()=>setOpen(v=>!v)}><Radio size={14}/><span>{joined&&people>1?'Your teacher is here':joined?'Session status':'Live session'}</span>{joined&&<small>{people}</small>}</button>
  {joined&&!observer&&<button className="stop-sharing" onClick={toggle}>End sharing</button>}
  {open&&<section className="live-panel" aria-label="Live session"><header><strong>{observer?'Join a student session':'Code with your teacher'}</strong><button aria-label="Close live session panel" onClick={()=>setOpen(false)}><X size={16}/></button></header>
   <div className="session-role"><ShieldCheck size={19}/><span>{observer?'Assigned teacher · suggestions by default':'You control what your teacher can do'}</span></div>
   <p>{observer?'Watch the student code and send a suggestion. Direct editing starts only after the student approves it.':'Your teacher can see the project while you share. They can suggest a change, and you choose whether to accept it.'}</p>
   {!db||!project.owner_id?<div className="session-setup">This project can’t be shared live. Sign in and open a saved classroom project.</div>:<>
    <div className="session-state" role="status"><Eye size={15}/>{status}</div>
    {joined&&<div className="session-presence"><Users size={15}/>{people} connected · private classroom</div>}
    {joined&&observer&&<><label className="session-suggestion-label" htmlFor="teacher-suggestion"><MessageSquareText size={15}/>Suggest a change to {activeFile}</label><textarea id="teacher-suggestion" className="session-suggestion" value={suggestion} onChange={event=>setSuggestion(event.target.value)} placeholder="Write a helpful code suggestion…"/><button className="studio-primary" disabled={!suggestion.trim()} onClick={sendSuggestion}>Send suggestion</button></>}
    {joined&&!observer&&<label className="session-consent-toggle"><input type="checkbox" checked={editConsent} onChange={event=>allowEditing(event.target.checked)}/>Allow my teacher to edit directly</label>}
    {joined&&!observer&&incoming&&<div className="incoming-suggestion"><strong>{incoming.author} suggested an edit in {incoming.file}</strong><pre>{incoming.code}</pre><div><button onClick={()=>{const payload={name:latest.current.name,files:{...latest.current.files,[incoming.file]:incoming.code},sequence:Date.now(),session:sessionId.current,version:latest.current.version};if(validDraft(payload)){receive.current(payload);setIncoming(null);setStatus('Teacher suggestion accepted')}}}><Check size={14}/>Accept</button><button onClick={()=>setIncoming(null)}>Dismiss</button></div></div>}
    <button className="studio-primary" onClick={toggle}>{joined?(observer?'Leave session':'Stop sharing'):observer?'Join as teacher':'Start sharing'}{joined&&status.startsWith('Could not')&&<RefreshCw size={14}/>}</button>
   </>}
   <small>Only you and teachers assigned to your classroom can join. You can end sharing at any time.</small>
  </section>}
 </div>
}
