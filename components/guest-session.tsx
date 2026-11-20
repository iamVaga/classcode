'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import * as Y from 'yjs';
import {createLiveFiles,decodeLiveUpdate,encodeLiveUpdate,readLiveFiles,replaceLiveText} from '@/lib/live-crdt';
import type {Project} from '@/lib/model';
const IDE=dynamic(()=>import('./ide'),{ssr:false});

export default function GuestSession({code}:{code:string}){
 const [project,setProject]=useState<Project|null>(null),[error,setError]=useState(''),[copied,setCopied]=useState(false);
 const doc=useRef<Y.Doc|null>(null);
 const local=useRef<Project|null>(null);
 const apply=useRef<((files:Record<string,string>)=>void)|null>(null);
 useEffect(()=>{
  local.current=null;
  setProject(null);
  let cancelled=false;
  let syncing=false;
  let changed=false;
  let version=0;
  const {doc:ydoc,files}=createLiveFiles();doc.current=ydoc;
  ydoc.on('update',(_update:Uint8Array,origin:unknown)=>{if(origin==='local')changed=true});
  async function sync(){
   if(syncing||cancelled)return;
   syncing=true;
   try{
    const push=changed;
    if(push)changed=false;
    const response=await fetch('/api/rooms/'+code,{
     method:push?'PATCH':'GET',cache:'no-store',
     ...(push?{headers:{'Content-Type':'application/json'},body:JSON.stringify({state:encodeLiveUpdate(Y.encodeStateAsUpdate(ydoc)),version})}:{})
    });
    const result=await response.json();
    if(cancelled)return;
    if(!response.ok&&response.status!==409){if(push)changed=true;throw Error(result.error)}
    version=result.version;
    Y.applyUpdate(ydoc,decodeLiveUpdate(result.state),'remote');
    if(response.status===409)changed=true;
    const nextFiles=readLiveFiles(files);
    if(!local.current){
     const next:Project={id:crypto.randomUUID(),name:result.name,type:result.type,files:nextFiles,version:0,updated:new Date().toISOString()};
     local.current=next;setProject(next);
    }else apply.current?.(nextFiles);
    setError('');
   }catch(e){if(local.current)changed=true;if(!cancelled)setError(e instanceof Error?e.message:'Reconnecting…')}
   finally{syncing=false}
  }
  void sync();
  const interval=setInterval(()=>void sync(),1000);
  return()=>{cancelled=true;clearInterval(interval);doc.current=null;ydoc.destroy()};
 },[code]);
 const syncFiles=useCallback((nextFiles:Record<string,string>)=>{
  const ydoc=doc.current;
  if(!ydoc)return;
  const files=ydoc.getMap<Y.Text>('files');
  ydoc.transact(()=>{
   for(const [name,code] of Object.entries(nextFiles)){
    let text=files.get(name);
    if(!text){text=new Y.Text();files.set(name,text)}
    replaceLiveText(text,code);
   }
   for(const name of Array.from(files.keys()))if(!Object.hasOwn(nextFiles,name))files.delete(name);
  },'local');
 },[]);
 return <div className="guest-room">
  <div className="guest-room-bar"><strong>Session code <code>{code}</code></strong><button onClick={()=>void navigator.clipboard.writeText(code).then(()=>setCopied(true)).catch(()=>setError('Select and copy the session code.'))}>Copy code</button><button onClick={()=>void navigator.clipboard.writeText(window.location.href).then(()=>setCopied(true)).catch(()=>setError('Copy the link from your address bar.'))}>Copy invite link</button><span role="status">{error||(copied?'Copied':'Everyone with this code can edit · expires in 24 hours')}</span><Link href="/">Leave session</Link></div>
  {project?<IDE initial={project} onBack={()=>window.location.assign('/')} onSave={async()=>{}} avatar={0} color="#dce9d5" userId="" onAvatar={()=>{}} guestSync={apply} guestOnFiles={syncFiles}/>:<p role="status" style={{padding:24}}>{error||'Joining session…'}</p>}
 </div>;
}
