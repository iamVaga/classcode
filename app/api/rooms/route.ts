import {randomBytes} from 'node:crypto';
import * as Y from 'yjs';
import {liveDatabase} from '@/lib/server/mongodb';
import {validDraft} from '@/lib/live';
import {encodeLiveUpdate} from '@/lib/live-crdt';
import {roomLimit} from '@/lib/server/room-limit';

export async function POST(request:Request){
 if(new URL(request.headers.get('origin')||'https://invalid').host!==request.headers.get('host'))return Response.json({error:'Request origin is not allowed'},{status:403});
 try{
  if(!await roomLimit(request,'create',10))return Response.json({error:'Too many rooms. Try again in a minute.'},{status:429});
  const body=await request.text();
  if(body.length>220000)return Response.json({error:'Project is too large'},{status:413});
  const project=JSON.parse(body);
  if(!validDraft({...project,sequence:0,session:'room'})||!['python','web','java','cpp','c'].includes(project.type))return Response.json({error:'Invalid project'},{status:400});
  const doc=new Y.Doc();
  const files=doc.getMap<Y.Text>('files');
  for(const [name,code] of Object.entries(project.files)){const text=new Y.Text();text.insert(0,String(code));files.set(name,text)}
  const state=encodeLiveUpdate(Y.encodeStateAsUpdate(doc));doc.destroy();
  const code=randomBytes(10).toString('hex');
  const rooms=(await liveDatabase()).collection('guest_rooms');
  await rooms.createIndex({expiresAt:1},{expireAfterSeconds:0});
  await rooms.insertOne({_id:code as never,name:project.name,type:project.type,state,version:0,expiresAt:new Date(Date.now()+86400000)});
  return Response.json({code},{headers:{'Cache-Control':'no-store'}});
 }catch(error){
  console.error('Guest room creation failed',{name:error instanceof Error?error.name:'UnknownError',code:typeof error==='object'&&error!==null&&'code' in error?error.code:undefined});
  return Response.json({error:'Sharing is temporarily unavailable. Your project is still saved. Please try again.'},{status:503});
 }
}
