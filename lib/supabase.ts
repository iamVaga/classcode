import {createClient} from '@supabase/supabase-js';
export const passwordResetRedirect='https://classcode-sand.vercel.app/';
export const configured=!!(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const db=configured?createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!):null;

export async function googleSignInEnabled(signal?:AbortSignal):Promise<boolean>{
 if(!configured)return false;
 const url=new URL('/auth/v1/settings',process.env.NEXT_PUBLIC_SUPABASE_URL);
 const response=await fetch(url,{headers:{apikey:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!},signal,cache:'no-store'});
 if(!response.ok)throw new Error('Sign-in settings are unavailable. Try again or continue with email.');
 const settings=await response.json() as {external?:{google?:boolean}};
 return settings.external?.google===true;
}
