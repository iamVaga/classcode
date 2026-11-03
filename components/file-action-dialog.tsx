'use client';
import {useEffect,useRef,useState} from 'react';
import {X,FilePlus2,Trash2,RefreshCw} from 'lucide-react';
import {fileNameError} from '@/lib/files';
export type FileAction={kind:'new'}|{kind:'delete'|'starter';file:string};
export default function FileActionDialog({action,files,type,onCancel,onCreate,onConfirm}:{action:FileAction;files:Record<string,string>;type:'python'|'web';onCancel:()=>void;onCreate:(name:string)=>void;onConfirm:()=>void}){
 const [name,setName]=useState(''),[error,setError]=useState('');
 const root=useRef<HTMLDivElement>(null),input=useRef<HTMLInputElement>(null);
 const creating=action.kind==='new',deleting=action.kind==='delete';
 const title=creating?'Create a new file':deleting?'Delete this file?':'Load the Turtle starter?';
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;const first=root.current?.querySelector<HTMLElement>('[data-initial-focus]');first?.focus();return()=>{if(previous?.isConnected)previous.focus()}},[]);
 return <div className="file-dialog-backdrop" onClick={onCancel}><div ref={root} className="file-dialog" role="dialog" aria-modal="true" aria-labelledby="file-dialog-title" aria-describedby="file-dialog-description" onClick={e=>e.stopPropagation()} onKeyDown={e=>{
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();onCancel()}
  if(e.key==='Tab'){const items=root.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled])');if(!items?.length)return;const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
 }}><button className="file-dialog-close" aria-label="Close file dialog" onClick={onCancel}><X size={18}/></button><span className={'file-dialog-icon '+(deleting?'danger':'')}>{creating?<FilePlus2 size={23}/>:deleting?<Trash2 size={23}/>:<RefreshCw size={23}/>}</span><h2 id="file-dialog-title">{title}</h2><p id="file-dialog-description">{creating?'Give your file a name, including its extension.':deleting?<>This removes <strong>{action.file}</strong> from this project. Download a copy first if you want to keep it.</>:<>This replaces the code in <strong>{action.file}</strong> with the Turtle drawing example. Your other files will stay unchanged.</>}</p>
 <form onSubmit={e=>{e.preventDefault();if(creating){const problem=fileNameError(name,files,type);if(problem){setError(problem);input.current?.focus();return}onCreate(name.trim())}else onConfirm()}}>
 {creating&&<label className="file-dialog-label">File name<input ref={input} aria-label="File name" data-initial-focus value={name} maxLength={101} placeholder={type==='python'?'helper.py':'about.html'} autoComplete="off" spellCheck={false} aria-invalid={!!error} aria-describedby={error?'file-dialog-error':'file-dialog-hint'} onChange={e=>{setName(e.target.value);setError('')}}/>{error?<span id="file-dialog-error" className="file-dialog-error" role="alert">{error}</span>:<span id="file-dialog-hint">Supported: .py, .html, .css, .js, .txt</span>}</label>}
 <div className="file-dialog-actions"><button type="button" data-initial-focus={!creating?'':undefined} className="file-dialog-cancel" onClick={onCancel}>Cancel</button><button type="submit" className={'file-dialog-submit '+(deleting?'danger':'')}>{creating?'Create file':deleting?'Delete file':'Replace code'}</button></div></form></div></div>
}

