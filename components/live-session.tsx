'use client';
import {useEffect,useRef,useState} from 'react';
import {Radio,Users,Eye,ShieldCheck,X,RefreshCw} from 'lucide-react';
import {db} from '@/lib/supabase';
import type {Project} from '@/lib/model';
import {LiveDraft,validDraft} from '@/lib/live';

export default function LiveSession({project,observer,onDraft,onEditAccess}:{project:Project;observer:boolean;onDraft:(draft:LiveDraft)=>void;onEditAccess:(allowed:boolean)=>void}){
 const [open,setOpen]=useState(false),[joined,setJoined]=useState(false),[status,setStatus]=useState('Not connected'),[people,setPeople]=useState(0);
 const sessionId=useRef(''),latest=useRef(project),receive=useRef(onDraft),channel=useRef<ReturnType<NonNullable<typeof db>['channel']>|null>(null),seq=useRef(0);
 useEffect(()=>{sessionId.current=crypto.randomUUID()},[]);
 useEffect(()=>{latest.current=project;receive.current=onDraft},[project,onDraft]);
 useEffect(()=>{
  if(!joined||!db||!project.owner_id)return;
  let cancelled=false,heartbeat:ReturnType<typeof setInterval>|undefined,access:ReturnType<typeof setInterval>|undefined;
  const session=sessionId.current;let lastSequence=-1,lastSession='';
  const publish=()=>{
   if(cancelled)return;
   const payload={name:latest.current.name,files:latest.current.files,sequence:++seq.current,session,version:latest.current.version};
   if(!validDraft(payload)){setStatus('Project is too large to share live (200 KB maximum).');return}
   void channel.current?.send({type:'broadcast',event:observer?'teacher-draft':'draft',payload}).then(result=>{
    if(!cancelled&&result!=='ok')setStatus(result==='timed out'?'Update timed out · check your connection':'Could not send update · reconnect and try again');
   }).catch(()=>{if(!cancelled)setStatus('Connection lost · reconnect to keep editing together')});
  };
  setStatus('Connecting securely…');if(observer)onEditAccess(false);
  void(async()=>{try{
   const {data,error}=await db!.auth.getSession();if(error||!data.session)throw Error('Sign in again to join this session.');
   await db!.realtime.setAuth(data.session.access_token);if(cancelled)return;
   const room=db!.channel('project:'+project.id,{config:{private:true,broadcast:{ack:true,self:false},presence:{key:data.session.user.id}}});channel.current=room;
   room.on('broadcast',{event:'draft'},({payload})=>{
    if(cancelled||!validDraft(payload))return;
    if(payload.session===lastSession&&payload.sequence<=lastSequence)return;
    lastSession=payload.session;lastSequence=payload.sequence;
    if(observer){receive.current(payload);setStatus('Editing student code')}
    else setStatus('Teacher updated your code');
   });
   room.on('broadcast',{event:'teacher-draft'},({payload})=>{
    if(cancelled||observer||!validDraft(payload))return;
    receive.current(payload);setStatus('Teacher is editing with you');
   });
   room.on('broadcast',{event:'ended'},()=>{if(!cancelled&&observer){setStatus('Student stopped sharing');onEditAccess(false)}});
   room.on('presence',{event:'sync'},()=>{
    if(cancelled)return;
    const members=Object.keys(room.presenceState());setPeople(members.length);
    if(observer){
     const studentPresent=members.includes(project.owner_id!);
     if(studentPresent){setStatus('Connected · edit together');onEditAccess(true)}
     else {setStatus('Waiting for student to share');onEditAccess(false)}
    }
    publish();
   });
   room.subscribe(async(state,error)=>{
    if(cancelled)return;
    if(state==='SUBSCRIBED'){
     try{await room.track({joined_at:new Date().toISOString()});if(cancelled)return;setStatus(observer?'Waiting for student to share':'Sharing live');publish()}
     catch{setStatus('Connected, but presence could not start. Leave and rejoin.')}
    }else if(state==='CHANNEL_ERROR'||state==='TIMED_OUT'||state==='CLOSED'){
     const detail=error?.message;
     setStatus(detail?`Could not join: ${detail}`:state==='TIMED_OUT'?'Connection timed out · check your network and retry':'Could not join. Check your sign-in and classroom link.');
     setPeople(0);if(observer)onEditAccess(false);
    }
   });
   if(!observer)heartbeat=setInterval(publish,15000);
   access=setInterval(async()=>{
    const result=await db!.from('projects').select('id').eq('id',project.id).maybeSingle();
    if(cancelled)return;
    if(result.error||!result.data){setStatus('Project access expired. Leave and reopen the project.');setJoined(false);if(observer)onEditAccess(false)}
   },30000);
  }catch(e){if(!cancelled){setStatus(e instanceof Error?e.message:'Could not connect. Please retry.');if(observer)onEditAccess(false)}}})();
  return()=>{
   cancelled=true;if(heartbeat)clearInterval(heartbeat);if(access)clearInterval(access);
   const room=channel.current;if(room){if(!observer)void room.send({type:'broadcast',event:'ended',payload:{}});void db!.removeChannel(room)}
   channel.current=null;setPeople(0);if(observer)onEditAccess(false);
  };
 },[joined,project.id,project.owner_id,observer,onEditAccess]);
 useEffect(()=>{
  if(!joined)return;
  const id=setTimeout(()=>{const payload={name:project.name,files:project.files,sequence:++seq.current,session:sessionId.current,version:project.version};if(validDraft(payload))void channel.current?.send({type:'broadcast',event:observer?'teacher-draft':'draft',payload})},500);
  return()=>clearTimeout(id);
 },[project.files,project.name,joined,observer]);
 const toggle=()=>{if(joined){setJoined(false);if(observer)onEditAccess(false);setStatus(observer?'Session left':'Sharing is off')}else{if(observer)onEditAccess(false);setJoined(true)}};
 return <div className="live-session">
  <button className={'live-trigger '+(joined&&status.startsWith('Connected')?'connected':'')} aria-expanded={open} onClick={()=>setOpen(v=>!v)}><Radio size={14}/><span>{joined?(status.startsWith('Connected')?'Connected':'Session status'):'Live session'}</span>{joined&&<small>{people}</small>}</button>
  {joined&&!observer&&<button className="stop-sharing" onClick={toggle}>Stop sharing</button>}
  {open&&<section className="live-panel" aria-label="Live session"><header><strong>{observer?'Join a student session':'Code with your teacher'}</strong><button aria-label="Close live session panel" onClick={()=>setOpen(false)}><X size={16}/></button></header>
   <div className="session-role"><ShieldCheck size={19}/><span>{observer?'Assigned teacher · shared editing':'Student controls sharing'}</span></div>
   <p>{observer?'Join the student’s workspace and edit the code together while they share. Your changes save to their project.':'When you start, teachers linked to you can see every file in this project as you type. They can watch and help edit together.'}</p>
   {!db||!project.owner_id?<div className="session-setup">This project can’t be shared live. Sign in and open a saved classroom project.</div>:<>
    <div className="session-state" role="status"><Eye size={15}/>{status}</div>
    {joined&&<div className="session-presence"><Users size={15}/>{people} connected {people===1?'participant':'participants'} · private classroom</div>}
    <button className="studio-primary" onClick={toggle}>{joined?(observer?'Leave session':'Stop sharing'):observer?'Join and edit together':'Start sharing'}{joined&&status.startsWith('Could not')&&<RefreshCw size={14}/>}</button>
   </>}
   <small>Only you and teachers assigned to your classroom can join.</small>
  </section>}
 </div>
}
