import 'server-only';
import {MongoClient} from 'mongodb';
import type {Project} from '@/lib/model';
export type Revision=Project&{project_id:string;captured_at:Date};
const state=globalThis as typeof globalThis&{classcodeMongo?:Promise<MongoClient>};
let collectionPromise:Promise<import('mongodb').Collection<Revision>>|undefined;
export function revisionCollection(){
 if(!process.env.MONGODB_URI)throw Error('MongoDB is not configured');
 if(!collectionPromise)collectionPromise=(async()=>{
  if(!state.classcodeMongo){const client=new MongoClient(process.env.MONGODB_URI!,{maxPoolSize:5,minPoolSize:0,maxIdleTimeMS:30000,serverSelectionTimeoutMS:5000,connectTimeoutMS:5000});state.classcodeMongo=client.connect().catch(async error=>{state.classcodeMongo=undefined;await client.close();throw error})}
  const client=await state.classcodeMongo;const collection=client.db(process.env.MONGODB_DB||'classcode').collection<Revision>('project_revisions');
  await collection.createIndex({project_id:1,version:1},{unique:true});return collection;
 })().catch(error=>{collectionPromise=undefined;throw error});
 return collectionPromise;
}
