'use client';
import {useEffect,useRef,useState} from 'react';
import {Radio,Users,Eye,ShieldCheck,X} from 'lucide-react';
import {db} from '@/lib/supabase';
import type {Project} from '@/lib/model';
import {LiveDraft,validDraft} from '@/lib/live';
export default function LiveSession({project,observer,onDraft}:{project:Project;observer:boolean;onDraft:(draft:LiveDraft)=>void}){
 const [open,setOpen]=useState(false),[joined,setJoined]=useState(false),[status,setStatus]=useState('Not connected'),[people,setPeople]=useState(0);
 const sessionId=useRef('');
 const latest=useRef(project),receive=useRef(onDraft),channel=useRef<ReturnType<NonNullable<typeof db>['channel']>|null>(null),seq=useRef(0);
 useEffect(()=>{sessionId.current=crypto.randomUUID()},[]);
 useEffect(()=>{latest.current=project;receive.current=onDraft},[project,onDraft]);
 useEffect(()=>{
  if(!joined||!db||!project.owner_id)return;
  let cancelled=false,heartbeat:ReturnType<typeof setInterval>|undefined,access:ReturnType<typeof setInterval>|undefined;const session=sessionId.current;let lastSequence=-1,lastSession='';
  const publish=()=>{if(cancelled||observer)return;const payload={name:latest.current.name,files:latest.current.files,sequence:++seq.current,session};if(!validDraft(payload)){setStatus('Project is too large for live sharing (200 KB limit).');return}void channel.current?.send({type:'broadcast',event:'draft',payload}).then(result=>{if(!cancelled)setStatus(result==='ok'?'Sharing live':'Connection interrupted — reconnecting')})};
  setStatus('Connecting securely…');
  void (async()=>{try{
   const {data,error}=await db!.auth.getSession();if(error||!data.session)throw Error('Sign in to join a session.');await db!.realtime.setAuth(data.session.access_token);if(cancelled)return;
   const room=db!.channel('project:'+project.id,{config:{private:true,broadcast:{ack:true,self:false},presence:{key:data.session.user.id}}});channel.current=room;
   room.on('broadcast',{event:'draft'},({payload})=>{if(cancelled||!observer||!validDraft(payload))return;if(payload.session===lastSession&&payload.sequence<=lastSequence)return;lastSession=payload.session;lastSequence=payload.sequence;receive.current(payload);setStatus('Viewing student live')});
   room.on('broadcast',{event:'ended'},()=>{if(!cancelled&&observer)setStatus('Student stopped sharing')});
   room.on('presence',{event:'sync'},()=>{if(cancelled)return;const members=Object.keys(room.presenceState());setPeople(members.length);if(observer&&!members.includes(project.owner_id!))setStatus('Student is not sharing right now');publish()});
   room.subscribe(async state=>{if(cancelled)return;if(state==='SUBSCRIBED'){setStatus(observer?'Waiting for student to share':'Sharing live');await room.track({joined_at:new Date().toISOString()});if(!cancelled)publish()}else if(state==='CHANNEL_ERROR'||state==='TIMED_OUT')setStatus('Unable to connect. Check access and Realtime setup.')});
   if(!observer)heartbeat=setInterval(publish,15000);
   access=setInterval(async()=>{const result=await db!.from('projects').select('id').eq('id',project.id).maybeSingle();if(cancelled)return;if(result.error||!result.data){setStatus('Access could not be verified. Session closed.');setJoined(false)}},30000);
  }catch(e){if(!cancelled)setStatus(String(e))}})();
  return()=>{cancelled=true;if(heartbeat)clearInterval(heartbeat);if(access)clearInterval(access);const room=channel.current;if(room){if(!observer)void room.send({type:'broadcast',event:'ended',payload:{}});void db!.removeChannel(room)}channel.current=null;setPeople(0)};
 },[joined,project.id,project.owner_id,observer]);
 useEffect(()=>{if(!joined||observer)return;const id=setTimeout(()=>{const payload={name:project.name,files:project.files,sequence:++seq.current,session:sessionId.current};if(validDraft(payload))void channel.current?.send({type:'broadcast',event:'draft',payload})},500);return()=>clearTimeout(id)},[project.files,project.name,joined,observer]);

 return <div className="live-session"><button className={'live-trigger '+(joined&&(status==='Sharing live'||status==='Viewing student live')?'connected':'')} aria-expanded={open} onClick={()=>setOpen(v=>!v)}><Radio size={14}/><span>{joined?(status==='Sharing live'?'Sharing live':status==='Viewing student live'?'Live view':'Session status'):'Live session'}</span>{joined&&<small>{people}</small>}</button>{joined&&!observer&&<button className="stop-sharing" onClick={()=>{setJoined(false);setStatus('Sharing is off')}}>Stop sharing</button>}{open&&<section className="live-panel" aria-label="Live session"><header><strong>{observer?'Watch a student code':'Code with your teacher'}</strong><button aria-label="Close live session panel" onClick={()=>setOpen(false)}><X size={16}/></button></header><div className="session-role"><ShieldCheck size={19}/><span>{observer?'Teacher · view only':'Student controls sharing'}</span></div><p>{observer?'See the student’s code as they type. Your view cannot overwrite their work.':'When you start, teachers linked to you can see every file in this project as you type. They can watch, but they can’t change your code.'}</p>{!db||!project.owner_id?<div className="session-setup">This project can’t be shared live. Ask your teacher to help you open a saved classroom project.</div>:<><div className="session-state" role="status"><Eye size={15}/>{status}</div>{joined&&<div className="session-presence"><Users size={15}/>{people} connected {people===1?'participant':'participants'} · authorized room</div>}<button className="studio-primary" onClick={()=>setJoined(v=>!v)}>{joined?(observer?'Leave session':'Stop sharing'):observer?'Join student workspace':'Start sharing'}</button></>}<small>Stopping ends live updates. Teachers linked to you can still open the saved project.</small></section>}</div>
}



