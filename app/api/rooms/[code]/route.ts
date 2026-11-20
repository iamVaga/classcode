import * as Y from 'yjs';
import {liveDatabase} from '@/lib/server/mongodb';
import {decodeLiveUpdate,encodeLiveUpdate,readLiveFiles} from '@/lib/live-crdt';
import {validDraft} from '@/lib/live';
import {roomLimit} from '@/lib/server/room-limit';

const headers={'Cache-Control':'no-store'};
type Context={params:Promise<{code:string}>};
async function roomCollection(){return (await liveDatabase()).collection('guest_rooms')}
export async function GET(_request:Request,context:Context){
 const {code}=await context.params;
 if(!/^[a-f0-9]{20}$/.test(code))return Response.json({error:'Check the session code or link.'},{status:400,headers});
 try{
  if(!await roomLimit(_request,'read',240))return Response.json({error:'Too many requests. Try again shortly.'},{status:429,headers});
  const room=await (await roomCollection()).findOne({_id:code as never,expiresAt:{$gt:new Date()}},{projection:{name:1,type:1,state:1,version:1}});
  return room?Response.json(room,{headers}):Response.json({error:'This room has expired or does not exist.'},{status:404,headers});
 }catch{return Response.json({error:'Connection failed. Your code is still here.'},{status:503,headers})}
}
export async function PATCH(request:Request,context:Context){
 if(new URL(request.headers.get('origin')||'https://invalid').host!==request.headers.get('host'))return Response.json({error:'Request origin is not allowed'},{status:403});
 const {code}=await context.params;
 if(!/^[a-f0-9]{20}$/.test(code))return Response.json({error:'Invalid room'},{status:400,headers});
 try{
  if(!await roomLimit(request,'write',240))return Response.json({error:'Too many updates. Reconnecting shortly.'},{status:429,headers});
  const raw=await request.text();
  if(raw.length>800000)return Response.json({error:'Session update is too large'},{status:413,headers});
  const {state,version}=JSON.parse(raw);
  if(typeof state!=='string'||state.length>700000||!Number.isSafeInteger(version))return Response.json({error:'Invalid update'},{status:400,headers});
  const rooms=await roomCollection();
  const room=await rooms.findOne({_id:code as never,expiresAt:{$gt:new Date()}});
  if(!room)return Response.json({error:'Room expired'},{status:404,headers});
  const doc=new Y.Doc();
  try{
   Y.applyUpdate(doc,decodeLiveUpdate(room.state));
   Y.applyUpdate(doc,decodeLiveUpdate(state));
   if(!validDraft({name:room.name,files:readLiveFiles(doc.getMap('files')),sequence:0,session:'room'}))return Response.json({error:'Invalid project update'},{status:400,headers});
   const merged=encodeLiveUpdate(Y.encodeStateAsUpdate(doc));
   if(merged.length>290000)return Response.json({error:'Session history is full. Save your project and start a new room.'},{status:413,headers});
   const result=await rooms.updateOne({_id:code as never,version,expiresAt:{$gt:new Date()}},{$set:{state:merged},$inc:{version:1}});
   return result.modifiedCount?Response.json({state:merged,version:version+1},{headers}):Response.json({state:room.state,version:room.version},{status:409,headers});
  }finally{doc.destroy()}
 }catch{return Response.json({error:'Could not sync. Reconnecting…'},{status:503,headers})}
}
