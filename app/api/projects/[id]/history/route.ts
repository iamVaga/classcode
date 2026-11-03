import {authorizedProject} from '@/lib/server/project-access';
import {revisionCollection} from '@/lib/server/mongodb';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
function failed(error:unknown){if(error instanceof Response){error.headers.set('Cache-Control','no-store');return error}return Response.json({error:'Revision history could not connect. Check the server database configuration and try again.'},{status:503,headers})}
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){try{
 const {id}=await params;await authorizedProject(request,id);
 if(!process.env.MONGODB_URI)return Response.json({configured:false,revisions:[]},{headers});
 const collection=await revisionCollection(),value=new URL(request.url).searchParams.get('version');
 if(value!==null){if(!/^\d{1,9}$/.test(value))return Response.json({error:'Invalid revision version'},{status:400,headers});const revision=await collection.findOne({project_id:id,version:Number(value)},{projection:{_id:0}});return revision?Response.json({revision},{headers}):Response.json({error:'Revision not found'},{status:404,headers})}
 const revisions=await collection.find({project_id:id},{projection:{_id:0,project_id:1,name:1,type:1,version:1,updated:1,captured_at:1}}).sort({version:-1}).limit(20).toArray();return Response.json({configured:true,revisions},{headers});
 }catch(error){return failed(error)}}
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){try{
 const {id}=await params,project=await authorizedProject(request,id,true);
 if(!process.env.MONGODB_URI)return Response.json({error:'Add MONGODB_URI on the server to enable revision history.'},{status:503,headers});
 const collection=await revisionCollection();const revision={...project,project_id:id,captured_at:new Date()};
 // Repeated requests for a saved version are idempotent. Client code is never trusted.
 try{await collection.updateOne({project_id:id,version:project.version},{$setOnInsert:revision},{upsert:true})}catch(error){if((error as {code?:number}).code!==11000)throw error}
 return Response.json({archived:true,version:project.version},{headers});
 }catch(error){return failed(error)}}
