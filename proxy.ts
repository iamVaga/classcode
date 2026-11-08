import {NextResponse,type NextRequest} from 'next/server';
import {buildContentSecurityPolicy,pythonWorkerContentSecurityPolicy} from '@/lib/security-headers';

export function proxy(request:NextRequest){
 const nonce=btoa(crypto.randomUUID());
 const policy=buildContentSecurityPolicy(nonce,process.env.NODE_ENV==='development',process.env.NEXT_PUBLIC_SUPABASE_URL||'');
 const requestHeaders=new Headers(request.headers);
 requestHeaders.set('x-nonce',nonce);
 requestHeaders.set('Content-Security-Policy',policy);
 const response=NextResponse.next({request:{headers:requestHeaders}});
 response.headers.set('Content-Security-Policy',policy);
 if(request.nextUrl.pathname==='/python-worker.js'){
  response.headers.set('Content-Security-Policy',pythonWorkerContentSecurityPolicy);
 }
 response.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
 response.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=(), payment=(), usb=()');
 response.headers.set('X-Content-Type-Options','nosniff');
 response.headers.set('X-Frame-Options','DENY');
 if(process.env.NODE_ENV==='production')response.headers.set('Strict-Transport-Security','max-age=31536000; includeSubDomains');
 return response;
}

export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
