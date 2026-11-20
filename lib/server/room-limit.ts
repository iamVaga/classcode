import {createHash} from 'node:crypto';
import {liveDatabase} from './mongodb';
export async function roomLimit(request:Request,action:string,maximum:number){
 const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'local';
 const minute=Math.floor(Date.now()/60000);
 const id=createHash('sha256').update(action+ip+minute).digest('hex');
 const collection=(await liveDatabase()).collection('room_limits');
 await collection.createIndex({expiresAt:1},{expireAfterSeconds:0});
 try{
  const result=await collection.findOneAndUpdate({_id:id as never},{$inc:{count:1},$setOnInsert:{expiresAt:new Date(Date.now()+120000)}},{upsert:true,returnDocument:'after'});
  return Number(result?.count)<=maximum;
 }catch{return false}
}
