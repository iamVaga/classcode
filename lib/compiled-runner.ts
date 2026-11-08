const compilers = {
 java: 'openjdk-jdk-21+35',
 cpp: 'gcc-13.2.0',
 c: 'gcc-13.2.0-c',
};

export type CompiledLanguage = keyof typeof compilers;
export const compilerEndpoint = 'https://wandbox.org/api/compile.json';

export function isCompiledLanguage(value: string): value is CompiledLanguage {
 return Object.hasOwn(compilers, value);
}

export async function runCompiledCode(
 language: CompiledLanguage,
 files: Record<string, string>,
 activeFile: string,
 stdin: string,
 signal: AbortSignal,
): Promise<string[]> {
 const sourceName = language === 'java' ? /\.java$/i : language === 'c' ? /\.c$/i : /\.(cpp|cc|cxx)$/i;
 const defaultName = language === 'java' ? 'Main.java' : 'main.' + language;
 const source = Object.hasOwn(files, defaultName) ? defaultName :
  sourceName.test(activeFile) && Object.hasOwn(files, activeFile) ? activeFile :
  Object.keys(files).find(name => sourceName.test(name));
 if (!source || !files[source].trim()) throw new Error('Add code to a source file before running.');
 const includes = language === 'java' ? sourceName : /\.(h|hpp|hh|hxx)$/i;
 const codes = Object.entries(files)
  .filter(([name]) => name !== source && includes.test(name) && /^[\w.-]+$/.test(name))
  .map(([file, code]) => ({file, code}));
 let code = files[source];
 if (language === 'java' && source !== 'prog.java') {
  const className = source.slice(0,-5);
  if (!/^[A-Za-z_$][\w$]*$/.test(className) || codes.some(file=>file.file === 'prog.java')) {
   throw new Error('Use Main.java for the Java entry point.');
  }
  codes.unshift({file:source, code});
  // Wandbox compiles and launches prog.java. Keep the student's public class in its own file.
  code = `class prog { public static void main(String[] args) throws Throwable { ${className}.main(args); } }`;
 }
 const body = JSON.stringify({compiler:compilers[language], code, codes, stdin, save:false});
 if (new TextEncoder().encode(body).length > 128_000) throw new Error('This run is too large. Keep source and input under 128 KB.');
 const response = await fetch(compilerEndpoint, {
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body,
  signal,
  credentials:'omit',
  referrerPolicy:'no-referrer',
 });
 if (response.status === 429) throw new Error('The compiler is busy. Try again shortly.');
 if (!response.ok) throw new Error('The compiler is unavailable. Try again shortly.');
 const result = await response.json() as {compiler_message?:string;program_message?:string;status?:string;signal?:string};
 if (result.status === '126' && [result.compiler_message,result.program_message].some(message=>message?.startsWith('Error: OCI runtime error:'))) {
  throw new Error('The online compiler could not start. Try Run again.');
 }
 const output = [result.compiler_message,result.program_message]
  .filter((message): message is string => typeof message === 'string' && message.length > 0)
  .map(message => message.slice(0,16_000));
 if (result.signal) output.push('Stopped: ' + result.signal);
 else if (result.status === '0') output.push('Execution finished.');
 else if (result.status) output.push('Exited with code ' + result.status + '.');
 else if (!output.length) output.push('The compiler returned no result.');
 return output;
}
