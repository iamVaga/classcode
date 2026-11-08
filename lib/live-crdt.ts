import * as Y from 'yjs';

export function encodeLiveUpdate(bytes:Uint8Array){let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary)}
export function decodeLiveUpdate(value:string){if(value.length>300_000)throw new Error('Live update is too large');return Uint8Array.from(atob(value),char=>char.charCodeAt(0))}
export function createLiveFiles(){const doc=new Y.Doc();return {doc,files:doc.getMap<Y.Text>('files')}}
export function replaceLiveText(text:Y.Text,value:string){const old=text.toString();let start=0;while(start<old.length&&start<value.length&&old[start]===value[start])start++;let end=0;while(end<old.length-start&&end<value.length-start&&old[old.length-1-end]===value[value.length-1-end])end++;text.delete(start,old.length-start-end);text.insert(start,value.slice(start,value.length-end))}
export function readLiveFiles(files:Y.Map<Y.Text>){const result:Record<string,string>={};files.forEach((value,key)=>{result[key]=value.toString()});return result}
export function teacherMayEdit(isTeacher:boolean,studentApproved:boolean){return !isTeacher||studentApproved}
