import 'server-only';
import {createClient} from '@supabase/supabase-js';
import type {Project} from '@/lib/model';
export async function authorizedProject(request:Request,id:string,write=false):Promise<Project>{
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))throw new Response('Invalid project ID',{status:400});
 const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];if(!token)throw new Response('Sign in required',{status:401});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key)throw new Response('Cloud authentication is not configured',{status:503});
 const client=createClient(url,key,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await client.auth.getUser(token);if(error||!data.user)throw new Response('Session expired. Sign in again.',{status:401});
 const project=await client.from('projects').select('*').eq('id',id).maybeSingle();if(project.error||!project.data)throw new Response('Project unavailable',{status:404});
 if(write&&project.data.owner_id!==data.user.id)throw new Response('Only the project owner can archive a revision',{status:403});
 return project.data as Project;
}
