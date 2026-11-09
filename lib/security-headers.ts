import {monacoStylesheet} from './monaco-assets.mjs';

export const pythonWorkerContentSecurityPolicy = [
 "default-src 'none'",
 "script-src 'wasm-unsafe-eval' https://cdn.jsdelivr.net/pyodide/v0.27.7/full/",
 "connect-src 'self' https://cdn.jsdelivr.net/pyodide/v0.27.7/full/",
 "frame-ancestors 'none'",
].join('; ');

export const pygameWorkerContentSecurityPolicy = [
 "default-src 'none'",
 // Emscripten uses JavaScript evaluation when dynamically linking Pygame.
 "script-src 'unsafe-eval' https://cdn.jsdelivr.net/pyodide/v0.29.4/full/",
 "connect-src https://cdn.jsdelivr.net/pyodide/v0.29.4/full/",
 "frame-ancestors 'none'",
].join('; ');

export function buildContentSecurityPolicy(nonce:string,isDevelopment:boolean,supabaseUrl:string){
 const supabaseOrigin=supabaseUrl?new URL(supabaseUrl).origin:"'self'";
 const supabaseSocket=supabaseUrl?supabaseOrigin.replace(/^https:/,'wss:').replace(/^http:/,'ws:'):"'self'";
 return [
  "default-src 'self'",
  `script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net${isDevelopment?" 'unsafe-eval'":""}`,
  `style-src 'self' 'unsafe-inline' ${monacoStylesheet}`,
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${supabaseSocket} https://cdn.jsdelivr.net https://wandbox.org/api/compile.json`,
  "worker-src 'self' blob:",
  "frame-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self' ${supabaseOrigin}`,
  "frame-ancestors 'none'",
  ...(isDevelopment?[]:["upgrade-insecure-requests"]),
 ].join('; ');
}
