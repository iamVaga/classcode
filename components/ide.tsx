'use client';
import {useEffect,useRef,useState,useCallback} from 'react';
import type {CSSProperties} from 'react';
import Editor from './adaptive-editor';
import {useConnection} from './connection-provider';
import {ArrowLeft,Play,Square,Plus,X,PanelLeft,Download,Ellipsis,Maximize2,RefreshCw,Trash2,Monitor,Smartphone,Sun,Moon,Columns2,FileCode2,PanelRight,Minus,Keyboard,Search,Check,ArrowRight,Command,FolderCode} from 'lucide-react';
import BrandMark from './brand-mark';
import FileActionDialog,{FileAction} from './file-action-dialog';
import {Project,previewDocument} from '@/lib/model';
import Avatar from './avatar';
import TurtleCanvas,{TurtleCommand} from './turtle-canvas';
import LiveSession from './live-session';
import ProjectHistory from './project-history';
import AccessibilityMenu from './accessibility-menu';
import {observerFor,LiveDraft} from '@/lib/live';
import {analyzePythonError} from '@/lib/analyser';
import type {HintLevel,PythonAnalysis} from '@/lib/analyser';
import {inputPrompts} from '@/lib/python-input';
import {isCompiledLanguage,runCompiledCode} from '@/lib/compiled-runner';
import {useTheme} from './theme-provider';

const defaultCodeShare=60;
const minCodeShare=50;
const maxCodeShare=75;
export default function IDE({initial,onBack,onSave,avatar,color,userId,onAvatar,guestSync,guestOnFiles}:{guestSync?:React.RefObject<((files:Record<string,string>)=>void)|null>;guestOnFiles?:(files:Record<string,string>)=>void;onAvatar:()=>void;initial:Project;onBack:()=>void;onSave:(p:Project)=>Promise<void>;avatar:number;color:string;userId:string}){
 const {conserve,online}=useConnection();
 const observer=observerFor(initial,userId);
 const [teacherEditing,setTeacherEditing]=useState(false);
 const canEdit=!observer||teacherEditing;
 const [project,setProject]=useState(initial),[file,setFile]=useState(Object.keys(initial.files)[0]),[status,setStatus]=useState('Saved'),[output,setOutput]=useState<string[]>([]),[running,setRunning]=useState(false),[src,setSrc]=useState(''),[sidebar,setSidebar]=useState(true),[auto,setAuto]=useState(true),[mobile,setMobile]=useState(false),[full,setFull]=useState(false),[retry,setRetry]=useState(0),[errorAnalysis,setErrorAnalysis]=useState<PythonAnalysis|null>(null),[hintLevel,setHintLevel]=useState<HintLevel>(1),[inputRequests,setInputRequests]=useState<string[]>([]),[inputValues,setInputValues]=useState<string[]>([]),[inputDialog,setInputDialog]=useState(false);
 const [split,setSplit]=useState(defaultCodeShare),[mobilePane,setMobilePane]=useState('code'),[view,setView]=useState('split'),[fontSize,setFontSize]=useState(20),[outputView,setOutputView]=useState(initial.type==='web'?'result':'console'),[commandOpen,setCommandOpen]=useState(false),[shortcutOpen,setShortcutOpen]=useState(false),[commandQuery,setCommandQuery]=useState('');
 const {theme,toggleTheme:toggleWorkspaceTheme}=useTheme();
 const editorDark=theme==='dark';
 const splitKey='classcode-editor-split-v2:'+(userId||'guest');
 const [dialog,setDialog]=useState<FileAction|null>(null);
 const runtimeName=project.type==='web'?'Web preview':project.type==='python'?'Python 3':project.type==='cpp'?'C++':project.type.toUpperCase();
 const [compiledPrompt,setCompiledPrompt]=useState(false),[compiledInput,setCompiledInput]=useState('');
 const compiledRequest=useRef<AbortController|null>(null);
 const compiled=isCompiledLanguage(project.type);
 const workspace=useRef<HTMLDivElement>(null);
 const [drawing,setDrawing]=useState<TurtleCommand[]>([]);
 const worker=useRef<Worker|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),successTimer=useRef<ReturnType<typeof setTimeout>|null>(null),successSeen=useRef(false),latest=useRef(project),saved=useRef(initial),saving=useRef(false),token=useRef('');
 useEffect(()=>{
  if(!guestSync)return;
  guestSync.current=(files)=>{
   if(JSON.stringify(latest.current.files)===JSON.stringify(files))return;
   const next={...latest.current,files};
   latest.current=next;
   setProject(next);
   if(!Object.prototype.hasOwnProperty.call(files,file))setFile(Object.keys(files)[0]);
  };
  return()=>{guestSync.current=null};
 },[guestSync,file]);
 useEffect(()=>{guestOnFiles?.(project.files)},[project.files,guestOnFiles]);
 const [lastSuccessfulRun,setLastSuccessfulRun]=useState<Record<string,string>|null>(null);
 const [firstRunSuccess,setFirstRunSuccess]=useState(false);
 useEffect(()=>{token.current=crypto.randomUUID();return()=>{compiledRequest.current?.abort();compiledRequest.current=null;worker.current?.terminate();if(timer.current)clearTimeout(timer.current);if(successTimer.current)clearTimeout(successTimer.current)}},[]);
 useEffect(()=>{
  const small=window.matchMedia('(max-width:1099px)');
  const mobileLayout=window.matchMedia('(max-width:799px)');
  const resizeLayout=()=>{setSidebar(!small.matches);if(mobileLayout.matches)setView('split')};
  resizeLayout();
  small.addEventListener('change',resizeLayout);
  mobileLayout.addEventListener('change',resizeLayout);
  try {
   const stored=Number(localStorage.getItem(splitKey));
   if(stored>=minCodeShare&&stored<=maxCodeShare)setSplit(stored);
  } catch {}
  return()=>{small.removeEventListener('change',resizeLayout);mobileLayout.removeEventListener('change',resizeLayout)};
 },[splitKey]);
 function updateSplit(value:number){
  const next=Math.min(maxCodeShare,Math.max(minCodeShare,value));
  setSplit(next);
  try{localStorage.setItem(splitKey,String(next))}catch{}
 }
 useEffect(()=>{latest.current=project;if(project!==saved.current)setStatus('Unsaved changes')},[project]);
 const persist=useCallback(async()=>{if(!canEdit||saving.current||latest.current===saved.current)return;saving.current=true;setStatus('Saving…');const candidate={...latest.current,version:saved.current.version+1,updated:new Date().toISOString()};try{await onSave(candidate);const old=latest.current;saved.current=candidate;if(old.files===candidate.files&&old.name===candidate.name){latest.current=candidate;setProject(candidate);setStatus('Saved')}else{setStatus('Unsaved changes');setRetry(value=>value+1)}}catch(e){setStatus('Save failed — '+String(e))}finally{saving.current=false}},[onSave,canEdit]);
 useEffect(()=>{const id=setTimeout(()=>void persist(),conserve?1500:700);return()=>clearTimeout(id)},[project,persist,retry,conserve]);
 useEffect(()=>{const before=(e:BeforeUnloadEvent)=>{if(latest.current!==saved.current){e.preventDefault();e.returnValue=''}};window.addEventListener('beforeunload',before);return()=>window.removeEventListener('beforeunload',before)},[]);
 useEffect(()=>{try{const stored=Number(localStorage.getItem('classcode-code-size'));if(Number.isFinite(stored)&&stored>=12&&stored<=26)setFontSize(stored)}catch{}},[]);
 useEffect(()=>{try{localStorage.setItem('classcode-code-size',String(fontSize))}catch{}},[fontSize]);
 useEffect(()=>{if(!errorAnalysis||document.documentElement.dataset.readAloud!=='on'||!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(errorAnalysis.hints[hintLevel]);utterance.rate=.92;window.speechSynthesis.speak(utterance);return()=>window.speechSynthesis.cancel()},[errorAnalysis,hintLevel]);
 const refresh=useCallback(()=>{setOutput([]);setErrorAnalysis(null);setSrc(previewDocument(latest.current.files,token.current))},[]);
 useEffect(()=>{if(project.type==='web'&&auto){const id=setTimeout(refresh,conserve?900:300);return()=>clearTimeout(id)}},[project.files,project.type,auto,refresh,conserve]);
 useEffect(()=>{const message=(e:MessageEvent)=>{const frame=document.getElementById('code-preview') as HTMLIFrameElement|null;if(e.source===frame?.contentWindow&&e.data?.token===token.current&&typeof e.data.text==='string')setOutput(v=>[...v.slice(-199),e.data.text.slice(0,5000)])};window.addEventListener('message',message);return()=>window.removeEventListener('message',message)},[]);
 function stop(){compiledRequest.current?.abort();compiledRequest.current=null;worker.current?.terminate();worker.current=null;if(timer.current)clearTimeout(timer.current);setRunning(false)}
 function run(){
  if(project.type==='web'){setOutputView('result');setMobilePane('output');refresh();return}
  if(running){stop();setOutput(lines=>[...lines,compiled?'Stopped waiting for the compiler.':'Stopped by you.']);return}
  setOutputView('console');setMobilePane('output');if(view==='code')setView('split');
  if(compiled){setCompiledPrompt(true);return}
  const requests=inputPrompts(project.files[file]||'');
  if(requests.length){setInputRequests(requests);setInputValues(requests.map(()=>''));setInputDialog(true);return}
  runPython([]);
 }
 async function runCompiled(){
  if(!isCompiledLanguage(project.type)||compiledRequest.current)return;
  setCompiledPrompt(false);
  setDrawing([]);setErrorAnalysis(null);
  if(!online){setOutput(['Connect to the internet to run this project.']);return}
  const controller=new AbortController();
  compiledRequest.current=controller;
  setRunning(true);setOutput(['Compiling…']);
  timer.current=setTimeout(()=>{
   if(compiledRequest.current!==controller)return;
   stop();setOutput(['The compiler took too long to respond. Try again.']);
  },60_000);
  try{
   const result=await runCompiledCode(project.type,project.files,file,compiledInput,controller.signal);
   if(compiledRequest.current===controller)setOutput(result);
  }catch(error){
   if(compiledRequest.current===controller)setOutput([error instanceof TypeError?'Could not reach the compiler. Check your connection.':error instanceof Error?error.message:'The compiler could not run this project.']);
  }finally{
   if(compiledRequest.current===controller){
    compiledRequest.current=null;
    if(timer.current)clearTimeout(timer.current);
    setRunning(false);
   }
  }
 }
 function runPython(inputs:string[]){
  if(running)stop();
  if(!online&&!worker.current){setOutput(['You are offline. Python needs a connection for its first load. Your code remains editable.']);return}
  setDrawing([]);setErrorAnalysis(null);setHintLevel(1);setRunning(true);setOutput(['Preparing Python…']);
  if(!worker.current)worker.current=new Worker('/python-worker.js');
  const activeWorker=worker.current;
  const executionTimeout=()=>{timer.current=setTimeout(()=>{stop();setOutput(v=>[...v,'Stopped: 30 second execution limit reached.'])},30000)};
  activeWorker.onmessage=({data})=>{
   if(worker.current!==activeWorker)return;
   if(data.phase)setOutput([String(data.phase)]);
   if(Array.isArray(data.analysis)&&data.analysis.length){const finding=data.analysis[0];setErrorAnalysis({...analyzePythonError(String(finding.traceback||''),project.files[file]||''),line:Number(finding.line)||null});setHintLevel(1)}
   if(data.ready){if(timer.current)clearTimeout(timer.current);setOutput([]);executionTimeout()}
   if(Array.isArray(data.turtle)&&data.turtle.length){setDrawing(v=>[...v,...data.turtle].slice(0,25000));setOutputView('result')}
   if(data.text&&data.error){setOutputView('console');const analysis=analyzePythonError(String(data.text),project.files[file]||'');setErrorAnalysis(analysis);setHintLevel(1)}else if(data.text)setOutput(v=>[...v.slice(-199),String(data.text).slice(0,5000)]);
   if(data.done){if(!data.error){if(!observer)setLastSuccessfulRun(project.files);setOutput(v=>[...v,'Execution finished.']);if(!successSeen.current){successSeen.current=true;setFirstRunSuccess(true);successTimer.current=setTimeout(()=>setFirstRunSuccess(false),700)}}if(timer.current)clearTimeout(timer.current);setRunning(false)}
  };
  activeWorker.onerror=()=>{setOutput(v=>[...v,'Python could not load. Check your connection and press Run to retry.']);stop()};
  activeWorker.postMessage({files:project.files,code:project.files[file],inputs});
  timer.current=setTimeout(()=>{stop();setOutput(v=>[...v,'Python is taking too long to download. Check your connection and press Run to retry.'])},conserve?180000:90000);
 }
 useEffect(()=>{const reconnect=()=>setRetry(v=>v+1);window.addEventListener('online',reconnect);return()=>window.removeEventListener('online',reconnect)},[]);
 const runRef=useRef(run);useEffect(()=>{runRef.current=run});
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.target as HTMLElement)?.closest('[role=dialog]')){if(e.key==='Escape'){setCommandOpen(false);setShortcutOpen(false)}return}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setCommandOpen(v=>!v);setCommandQuery('')}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();void persist()}if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();runRef.current()}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='b'){e.preventDefault();setSidebar(v=>!v)}if(e.key==='?'&&!e.ctrlKey&&!e.metaKey)setShortcutOpen(true)};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[persist]);
 function restoreFiles(files:Record<string,string>){
  if(observer||!Object.keys(files).length)return;
  stop();
  setOutput([]);
  setDrawing([]);
  setErrorAnalysis(null);
  setProject(current=>({...current,files:{...files}}));
  if(!Object.prototype.hasOwnProperty.call(files,file))setFile(Object.keys(files)[0]);
 }
 function update(value:string){if(!canEdit)return;setProject(p=>({...p,files:{...p.files,[file]:value}}))}
 function addFile(){if(!canEdit)return;setDialog({kind:'new'})}
 function deleteFile(n:string){if(!canEdit)return;if(Object.keys(project.files).length>1)setDialog({kind:'delete',file:n})}
 function confirmFileAction(){if(!canEdit||dialog?.kind!=='delete')return;const files={...project.files};delete files[dialog.file];setProject(p=>({...p,files}));if(file===dialog.file)setFile(Object.keys(files)[0]);setDialog(null)}
 function resize(clientX:number){
  const code=workspace.current?.querySelector('.code-pane')?.getBoundingClientRect();
  const result=workspace.current?.querySelector('.result-pane')?.getBoundingClientRect();
  if(code&&result&&code.width+result.width>0)updateSplit((clientX-code.left)/(code.width+result.width)*100);
 }
 async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await workspace.current?.parentElement?.requestFullscreen()}catch{setStatus('Fullscreen is unavailable in this browser. Use Code only or Output only to expand a pane.')}}
 function executeCommand(id:string){
  if(id==='run'){if(running)stop();else run()}
  if(id==='files')setSidebar(value=>!value);
  if(id==='theme')toggleWorkspaceTheme();
  if(id==='shortcuts')setShortcutOpen(true);
  if(id==='projects')void persist().then(()=>{if(latest.current===saved.current)onBack();else setStatus('Save or export your changes before leaving.')});
 }
 return <div className={'ide spacious-ide '+(editorDark?'editor-dark':'editor-light')+(running?' is-running':'')}>
  <header className="ide-header">
   <button className="icon-button" aria-label="Back to projects" onClick={async()=>{
    await persist();
    if(latest.current!==saved.current){setStatus('Save or export your changes before leaving.');return}
    onBack();
   }}><ArrowLeft size={18}/></button>
   <span className="ide-brand">ClassCode</span>
   <input readOnly={!canEdit} aria-label="Project name" value={project.name} onChange={e=>setProject(p=>({...p,name:e.target.value}))}/>
   <button className="save-status" onClick={()=>setRetry(v=>v+1)} title="Save or retry saving">{status==='Saved'&&<Check size={15}/>}{status}</button>
   <button className="ide-theme-toggle" onClick={toggleWorkspaceTheme}>{editorDark?<Sun size={17}/>:<Moon size={17}/>}{editorDark?'Light mode':'Dark mode'}</button>
   <LiveSession project={project} observer={observer} activeFile={file} onEditAccess={setTeacherEditing} onDraft={(draft:LiveDraft)=>{
    const next={...latest.current,name:draft.name,files:draft.files,version:draft.version??latest.current.version};
    latest.current=next;
    setProject(next);
    if(!Object.prototype.hasOwnProperty.call(draft.files,file))setFile(Object.keys(draft.files)[0]||file);
    setStatus(observer?'Student code updated':'Teacher suggested a change');
   }}/>
   <details className="editor-more" onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))event.currentTarget.open=false}} onKeyDown={event=>{if(event.key==='Escape')event.currentTarget.open=false}}>
    <summary aria-label="More workspace options"><span>More</span><Ellipsis size={20} aria-hidden="true"/></summary>
    <div className="editor-more-panel">
     <button className="icon-button" onClick={()=>{setCommandOpen(true);setCommandQuery('')}}><Command size={16}/><span>Commands</span></button>
     <ProjectHistory project={project} observer={observer} onRestore={restoreFiles} lastSuccessfulRun={lastSuccessfulRun} onSave={async()=>{
      await persist();
      if(latest.current!==saved.current)throw Error('Save your current changes before archiving.');
     }}/>
     <button className="editor-export" onClick={()=>{
      const link=document.createElement('a');
      link.href=URL.createObjectURL(new Blob([JSON.stringify(project,null,2)],{type:'application/json'}));
      link.download=project.name+'.json';
      link.click();
      setTimeout(()=>URL.revokeObjectURL(link.href),1000);
     }}><Download size={15}/><span>Download</span></button>
     <button className="icon-button" aria-label="Keyboard shortcuts" onClick={()=>setShortcutOpen(true)}><Keyboard size={17}/><span>Keyboard shortcuts</span></button>
     <button className="icon-button" aria-label="Fullscreen workspace" onClick={()=>void fullscreen()}><Maximize2 size={17}/><span>Full screen</span></button>
     {!guestSync&&<button aria-label="Customize your avatar" onClick={onAvatar}><Avatar kind={avatar} color={color} size={24}/><span>Change avatar</span></button>}
     <div className="pane-switch" aria-label="Workspace layout">
      {[
       {value:'split',label:'Split',Icon:Columns2},
       {value:'code',label:'Code only',Icon:FileCode2},
       {value:'output',label:'Output only',Icon:PanelRight},
      ].map(({value,label,Icon})=><button key={value} aria-pressed={view===value} onClick={()=>setView(value)}><Icon size={16}/><span>{label}</span></button>)}
     </div>
    </div>
   </details>
  </header>
  <div className="coding-toolbar">
   <div className="run-controls">
    <span className="runtime-label">{runtimeName}</span>
    <button className={'run-button '+(running?'is-running':'')} title={compiled?'Compile and run online':'Run your code'} onClick={running?()=>{
     stop();
     setOutput(lines=>[...lines,compiled?'Stopped waiting for the compiler.':'Stopped by you.']);
    }:run}>{running?<Square size={15}/>:<Play size={15} fill="currentColor"/>}{running?'Stop':'Run'}</button>
    <button className="icon-button" aria-label="Reset output" title="Clear output and stop the current run" onClick={()=>{
     if(running)stop();
     setOutput([]);
     setDrawing([]);
     setErrorAnalysis(null);
     setInputDialog(false);
     setCompiledPrompt(false);
    }}><RefreshCw size={16}/></button>
    <span className="run-shortcut">Tip: press Ctrl + Enter to run</span>
   </div>
   <div className="editor-display-controls">
    <div className="font-controls">
     <button aria-label="Decrease editor font" disabled={fontSize<=12} onClick={()=>setFontSize(v=>Math.max(12,v-1))}><Minus size={13}/></button>
     <span>{fontSize}px</span>
     <button aria-label="Increase editor font" disabled={fontSize>=26} onClick={()=>setFontSize(v=>Math.min(26,v+1))}><Plus size={13}/></button>
    </div>
    <AccessibilityMenu/>
   </div>
  </div>
  <div ref={workspace} className={'ide-work layout-'+view+' mobile-pane-'+mobilePane+(sidebar?' explorer-open':'')} style={{'--code-ratio':split/100} as CSSProperties}>
   {view!=='output'&&<aside className="file-sidebar"><div className="file-heading">My files<button className="icon-button" aria-label="New file in explorer" disabled={!canEdit} onClick={addFile}><Plus size={15}/></button></div>{Object.keys(project.files).map(n=><div className={'file-item '+(file===n?'active':'')} key={n}><button onClick={()=>{setFile(n);setMobilePane("code")}}>{n}</button>{Object.keys(project.files).length>1&&<button aria-label={'Delete '+n} disabled={!canEdit} onClick={()=>deleteFile(n)}><X size={12}/></button>}</div>)}</aside>}
   {view!=='output'&&<section className="code-pane" aria-label="Code editor">
    <div className="editor-tabs">
     <button className="icon-button explorer-toggle" aria-label="Toggle explorer" onClick={()=>setSidebar(value=>!value)}><PanelLeft size={16}/></button>
     <div className="file-tab-list" role="tablist" aria-label="Project files">
      {Object.keys(project.files).map(name=><button key={name} role="tab" aria-selected={name===file} className={name===file?'active':''} onClick={()=>setFile(name)}>{name}<span className="file-type-dot"/></button>)}
     </div>
     {Object.keys(project.files).length>1&&<select className="file-tab-overflow" aria-label="Jump to file" value={file} onChange={event=>setFile(event.target.value)}>{Object.keys(project.files).map(name=><option key={name}>{name}</option>)}</select>}
     <button className="icon-button add-file" aria-label="New file" disabled={!canEdit} onClick={addFile}><Plus size={16}/></button>
    </div>
   <Editor key={file} errorLine={errorAnalysis?.line} path={project.id+'/'+file} language={file.endsWith('.py')?'python':file.endsWith('.java')?'java':file.endsWith('.cpp')||file.endsWith('.hpp')?'cpp':file.endsWith('.c')||file.endsWith('.h')?'c':file.endsWith('.html')?'html':file.endsWith('.css')?'css':'javascript'} value={project.files[file]} onChange={value=>update(value||'')} theme={editorDark?'vs-dark':'light'} loading={<span className="loading">Loading editor…</span>} options={{readOnly:!canEdit,fontSize,fontWeight:'600',lineHeight:Math.round(fontSize*1.6),minimap:{enabled:false},padding:{top:20,bottom:20},scrollBeyondLastLine:false,automaticLayout:true,tabSize:4,wordWrap:'on',fontFamily:'var(--font-code)',fontLigatures:true,glyphMargin:false,lineNumbersMinChars:3,folding:true,renderLineHighlight:'line',overviewRulerLanes:0,quickSuggestions:{other:true,comments:false,strings:true},quickSuggestionsDelay:80,suggestOnTriggerCharacters:true,wordBasedSuggestions:'allDocuments',suggest:{showSnippets:true,showFunctions:true,showKeywords:true,preview:true}}}/>
    <div className="editor-status"><span>{file.endsWith('.py')?'Python':file.endsWith('.java')?'Java':file.endsWith('.cpp')||file.endsWith('.hpp')?'C++':file.endsWith('.c')||file.endsWith('.h')?'C':'Web'} · UTF-8</span><span>{observer?(teacherEditing?'Shared editing · autosave on':'Waiting for student to start sharing'):'Saves by itself'}</span></div>
   </section>}
   {view==='split'&&<div className="pane-divider" role="separator" tabIndex={0} aria-label="Resize code and output" aria-orientation="vertical" aria-valuemin={minCodeShare} aria-valuemax={maxCodeShare} aria-valuenow={Math.round(split)} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);resize(e.clientX)}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))resize(e.clientX)}} onPointerUp={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}} onDoubleClick={()=>updateSplit(defaultCodeShare)} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();updateSplit(e.key==='Home'?minCodeShare:e.key==='End'?maxCodeShare:split+(e.key==='ArrowRight'?5:-5))}}}><span/></div>}
   {view!=='code'&&<section className={'result-pane '+(full?'fullscreen':'')} aria-label="Program output"><div className="preview-toolbar"><div className="output-tabs"><button aria-pressed={outputView==='console'} className={outputView==='console'?'active':''} onClick={()=>setOutputView('console')}>Output</button><button aria-pressed={outputView==='result'} className={outputView==='result'?'active':''} onClick={()=>setOutputView('result')}>Preview</button></div><div>{project.type==='web'&&outputView==='result'&&<><label><input type="checkbox" checked={auto} onChange={e=>setAuto(e.target.checked)}/>Auto</label><button className="icon-button" aria-label="Desktop preview" onClick={()=>setMobile(false)}><Monitor size={15}/></button><button className="icon-button" aria-label="Mobile preview" onClick={()=>setMobile(true)}><Smartphone size={15}/></button></>}<button className="icon-button" aria-label="Toggle fullscreen output" onClick={()=>setFull(v=>!v)}>{full?<X size={16}/>:<Maximize2 size={16}/>}</button></div></div>
    <div className={'result-grid '+(outputView==='console'?'console-only':'preview-only')}>
     <section className="result-preview-pane" aria-label="Live preview">{project.type==='web'?outputView==='result'?<div className="preview-body"><iframe id="code-preview" title="Isolated project preview" sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={src} style={{width:mobile?'375px':'100%',maxWidth:'100%'}}/></div>:<div className="preview-empty"><Search size={18}/><span>Console view is open.</span></div>:drawing.length>0?<div className="python-drawing-output"><TurtleCanvas commands={drawing}/></div>:<div className="preview-empty"><TerminalIcon/><strong>{running?'Preparing your preview':'Your preview appears here'}</strong><span>Run the program to see its result.</span></div>}</section>
     <section className="console-pane" aria-label={project.type==='web'?'Browser console':'Program output'}><header><span>{project.type==='web'?'Console':'Output'}</span><button className="icon-button" aria-label="Clear console" onClick={()=>setOutput([])}><Trash2 size={14}/></button></header><div aria-live="polite" className="console-output">{compiledPrompt&&<form className="inline-program-input" onSubmit={event=>{event.preventDefault();void runCompiled()}}><p>Run sends your code and input to Wandbox.</p><label className="program-input-field">Input (optional)<textarea value={compiledInput} maxLength={8192} rows={2} onChange={event=>setCompiledInput(event.target.value)}/></label><div className="program-input-actions"><button type="button" className="studio-secondary" onClick={()=>setCompiledPrompt(false)}>Cancel</button><button type="submit" className="studio-primary">Run on Wandbox</button></div></form>}{inputDialog&&<section className="inline-program-input" aria-label="Program input"><h3>Program input</h3><p>Enter the values your code will read.</p>{inputRequests.map((prompt,index)=><label className="program-input-field" key={`${prompt}-${index}`}><span>{prompt||`Input ${index+1}`}</span><input id={`program-input-${index}`} autoFocus={index===0} value={inputValues[index]||''} maxLength={1000} onChange={event=>setInputValues(values=>values.map((value,i)=>i===index?event.target.value:value))} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();if(index<inputRequests.length-1)document.getElementById(`program-input-${index+1}`)?.focus();else{setInputDialog(false);runPython(inputValues)}}}}/></label>)}<div className="program-input-actions"><button className="studio-secondary" onClick={()=>setInputDialog(false)}>Cancel</button><button className="studio-primary" onClick={()=>{setInputDialog(false);runPython(inputValues)}}><Play size={15}/>Run with these values</button></div></section>}{errorAnalysis&&<article className="friendly-analysis" role="status"><span className="analysis-kicker">{errorAnalysis.kind==='name'?'A small spelling check':errorAnalysis.kind==='syntax'?'Let’s check the shape of this line':'Let’s try one small clue'}</span><strong>Not yet. Here’s a clue.</strong><p>{errorAnalysis.hints[hintLevel]}</p><small>{errorAnalysis.summary}{errorAnalysis.line?` · line ${errorAnalysis.line}`:''}</small>{hintLevel<4&&<button className="analysis-next-hint" onClick={()=>setHintLevel(value=>Math.min(4,value+1) as HintLevel)}>Show another clue · {hintLevel}/4</button>}<details><summary>See the original Python error</summary><pre>{errorAnalysis.original}</pre></details></article>}{output.length?output.map((line,i)=><pre key={i}>{line}</pre>):!errorAnalysis&&<div className="console-blank-state"><div className="console-empty"><strong>{running?'Running your code':'Ready when you are!'}</strong><span>{running?'Output will appear here.':'Press the green Run button to see what your code does.'}</span></div>{project.type==='python'&&<div className="editor-tip"><Avatar kind={3} color="#ff8b49" size={44}/><span>Try changing “world” to your own name, then press Run again.</span></div>}</div>}</div></section>
    </div>
   <div className="output-status"><span className={running?'execution-dot running':'execution-dot'}/><span>{running?'Running your code…':errorAnalysis?'Review the clue':drawing.length?'Graphics ready':output.length?'Execution finished':'Ready'}</span>{firstRunSuccess&&<span className="first-run-reward" aria-label="First run completed"><Check className="success-check" size={17}/><span className="success-particles" aria-hidden="true">{Array.from({length:12},(_,index)=><i key={index} style={{'--particle-angle':`${index*30}deg`} as CSSProperties}/>)}</span></span>}</div></section>}
  </div>
  <nav className="mobile-editor-nav" aria-label="Workspace panes">{[["files","Files"],["code","Code"],["output","Output"]].map(([value,label])=><button key={value} aria-pressed={mobilePane===value} onClick={()=>{setView("split");setMobilePane(value)}}>{label}</button>)}</nav>
  {commandOpen&&<div className="command-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setCommandOpen(false)}}><section className="command-dialog" role="dialog" aria-modal="true" aria-label="Command palette"><div className="command-search"><Search size={17}/><input autoFocus aria-label="Search commands" placeholder="Search commands…" value={commandQuery} onChange={event=>setCommandQuery(event.target.value)}/><kbd>Esc</kbd></div><div className="command-list" role="menu">
   {[{id:'run',label:running?'Stop running code':'Run code',hint:'Ctrl + Enter',icon:running?<Square size={16}/>:<Play size={16}/>},{id:'files',label:sidebar?'Hide file explorer':'Show file explorer',hint:'Ctrl + B',icon:<PanelLeft size={16}/>},{id:'theme',label:'Switch light or dark theme',hint:'',icon:editorDark?<Sun size={16}/>:<Moon size={16}/>},{id:'shortcuts',label:'Show keyboard shortcuts',hint:'?',icon:<Keyboard size={16}/>},{id:'projects',label:'Return to projects',hint:'',icon:<FolderCode size={16}/>}].filter(item=>item.label.toLowerCase().includes(commandQuery.toLowerCase())).map(item=><button key={item.id} role="menuitem" onClick={()=>{executeCommand(item.id);setCommandOpen(false)}}>{item.icon}<span>{item.label}</span><kbd>{item.hint||<ArrowRight size={13}/>}</kbd></button>)}
  </div><footer>Type to filter. Use Tab and Enter to choose.</footer></section></div>}
  {shortcutOpen&&<div className="command-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setShortcutOpen(false)}}><section className="shortcuts-dialog" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts"><button className="shortcut-close" aria-label="Close shortcuts" onClick={()=>setShortcutOpen(false)}><X size={18}/></button><span className="guide-badge"><Keyboard size={14}/>KEYBOARD SHORTCUTS</span><h2>Keep your hands on the code.</h2><dl><div><dt>Run or stop</dt><dd><kbd>Ctrl</kbd><kbd>Enter</kbd></dd></div><div><dt>Open command palette</dt><dd><kbd>Ctrl</kbd><kbd>K</kbd></dd></div><div><dt>Show or hide files</dt><dd><kbd>Ctrl</kbd><kbd>B</kbd></dd></div><div><dt>Save now</dt><dd><kbd>Ctrl</kbd><kbd>S</kbd></dd></div><div><dt>Resize a pane</dt><dd><kbd>Arrow keys</kbd></dd></div></dl><button className="studio-primary" onClick={()=>setShortcutOpen(false)}>Done</button></section></div>}

  {dialog&&<FileActionDialog key={dialog.kind+('file' in dialog?dialog.file:'')} action={dialog} files={project.files} type={project.type} onCancel={()=>setDialog(null)} onCreate={name=>{setProject(p=>({...p,files:{...p.files,[name]:''}}));setFile(name);setMobilePane("code");setDialog(null)}} onConfirm={confirmFileAction}/>}
 </div>
}
function TerminalIcon(){return <span className="output-placeholder-icon"><BrandMark size={42}/></span>}


