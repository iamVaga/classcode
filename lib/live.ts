import type {Project} from './model';
export type LiveDraft={name:string;files:Record<string,string>;sequence:number;session:string};
export function validDraft(value:unknown):value is LiveDraft{if(!value||typeof value!=='object')return false;const p=value as LiveDraft;return typeof p.name==='string'&&p.name.length<=120&&typeof p.session==='string'&&p.session.length<=100&&Number.isSafeInteger(p.sequence)&&p.sequence>=0&&!!p.files&&typeof p.files==='object'&&!Array.isArray(p.files)&&Object.keys(p.files).length>0&&Object.keys(p.files).length<=50&&Object.entries(p.files).every(([k,v])=>/^[\w-]+\.(py|html|css|js|txt)$/.test(k)&&typeof v==='string')&&new TextEncoder().encode(JSON.stringify(p.files)).byteLength<200000}
export function observerFor(project:Project,userId:string){return !!project.owner_id&&project.owner_id!==userId}

