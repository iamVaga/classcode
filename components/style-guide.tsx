'use client';

import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,BookOpen,Check,ChevronDown,ExternalLink,Eye,FolderCode,Info,LoaderCircle,Moon,Play,Plus,Search,ShieldCheck,Sun,Terminal,X} from 'lucide-react';
import CodePreview from './code-preview';

type GuideTab='buttons'|'cards'|'editor';

function Spark({state='idle'}:{state?:'idle'|'thinking'|'celebrate'}){
 return <svg className={`guide-spark guide-spark-${state}`} viewBox="0 0 40 40" fill="none" role="img" aria-label={`Spark companion ${state}`}>
  <path d="M20 3 24 15 37 20 24 24 20 37 16 24 3 20 16 15 20 3Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
  <circle cx="20" cy="20" r="3" fill="currentColor"/>
 </svg>
}

export default function StyleGuide(){
 const [theme,setTheme]=useState<'light'|'dark'>(()=>typeof document!=='undefined'&&document.documentElement.dataset.theme==='dark'?'dark':'light');
 const [tab,setTab]=useState<GuideTab>('buttons');
 const [filter,setFilter]=useState('All tracks');
 const [progress,setProgress]=useState(62);
 const [loaded,setLoaded]=useState(false);
 const [toast,setToast]=useState(false);
 const toastTimer=useRef<number|null>(null);
 const toastRemaining=useRef(4000);
 const toastStarted=useRef(0);
 const dialog=useRef<HTMLDialogElement>(null);
 function toggleTheme(){const next=theme==='dark'?'light':'dark';setTheme(next);document.documentElement.dataset.theme=next;try{localStorage.setItem('classcode-theme',next)}catch{}}
 function dismissToast(){setToast(false);if(toastTimer.current)clearTimeout(toastTimer.current);toastTimer.current=null;toastRemaining.current=4000}
 function startToastTimer(){if(toastTimer.current)clearTimeout(toastTimer.current);toastStarted.current=Date.now();toastTimer.current=window.setTimeout(dismissToast,toastRemaining.current)}
 function showToast(){dismissToast();setToast(true);toastRemaining.current=4000;startToastTimer()}
 useEffect(()=>()=>{if(toastTimer.current)clearTimeout(toastTimer.current)},[])
 return <main className="design-guide">
  <header className="design-guide-header">
   <div><span className="mini-label">ClassCode design system · 01</span><h1>Quiet confidence.<br/>Room to make.</h1><p>Reusable interface patterns for a thoughtful student coding workspace. Light and dark themes share the same measured hierarchy.</p></div>
   <button className="studio-secondary" onClick={toggleTheme}>{theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}Switch to {theme==='dark'?'light':'dark'}</button>
  </header>
  <section className="guide-section" aria-labelledby="guide-foundations"><div><h2 id="guide-foundations">Foundations</h2><p>Color, shape, type, and status colors from the shared token set.</p></div><div className="guide-showcase">
   <div className="guide-row"><span className="guide-badge">Neutral surface</span><span className="guide-badge success"><Check size={14}/> Saved</span><span className="guide-badge warning"><Info size={14}/> Needs a look</span><span className="guide-badge error"><X size={14}/> Run stopped</span></div>
   <div className="guide-row"><span className="guide-muted">A body sentence at the comfortable reading size. One thought, in a line length that stays easy to scan.</span><code>for step in range(5):</code></div>
  </div></section>
  <section className="guide-section" aria-labelledby="guide-actions"><div><h2 id="guide-actions">Actions and controls</h2><p>Primary, secondary, quiet, destructive, disabled, loading, input, select, toggle, tabs, and filters.</p></div><div className="guide-showcase">
   <div className="guide-row"><button className="studio-primary"><Play size={16} fill="currentColor"/>Run code</button><button className="studio-secondary"><Plus size={17}/>New project</button><button className="guide-quiet">Keep exploring <ArrowRight size={16}/></button><button className="guide-destructive"><X size={16}/>Delete draft</button><button className="studio-primary guide-loading" disabled><LoaderCircle size={16}/>Saving</button><button className="studio-secondary" disabled>Unavailable</button></div>
   <div className="guide-row"><label className="guide-field">Project name<input placeholder="My first idea"/></label><label className="guide-field">Language<select defaultValue="python"><option value="python">Python</option><option>Java</option><option>C++</option><option>C</option></select></label><label className="guide-toggle"><input type="checkbox" defaultChecked/><span aria-hidden="true"/><span>Autosave</span></label></div>
   <div className="guide-row" role="tablist" aria-label="Component examples">{(['buttons','cards','editor'] as const).map(item=><button key={item} id={`guide-tab-${item}`} className="guide-tab" role="tab" aria-selected={tab===item} aria-controls="guide-tab-panel" onClick={()=>setTab(item)}>{item==='buttons'?'Buttons':item==='cards'?'Cards':'Editor panels'}</button>)}</div><div className="guide-tab-panel" id="guide-tab-panel" role="tabpanel" aria-labelledby={`guide-tab-${tab}`}>{tab==='buttons'?'Actions use consistent size, focus, loading, and disabled states.':tab==='cards'?'Project cards show a clear title, track, short outcome, and next action.':'Code, preview, and console keep source and feedback in view together.'}</div>
   <div className="guide-row">{['All tracks','Python','Turtle','Web','Games'].map(item=><button key={item} className="guide-chip" aria-pressed={filter===item} onClick={()=>setFilter(item)}>{item}</button>)}</div>
  </div></section>
  <section className="guide-section" aria-labelledby="guide-cards"><div><h2 id="guide-cards">Cards and progress</h2><p>Hover and focus show clear affordance. Progress stays factual and uses tabular numbers.</p></div><div className="guide-showcase">
   <button className="guide-card" onClick={()=>setFilter(filter==='Python'?'All tracks':'Python')}><span className="guide-badge">Python · First steps</span><strong>Make a greeting</strong><small>Change a name and run the code again.</small><span className="guide-card-foot">10 min <ArrowRight size={15}/></span></button>
   <div className="guide-progress-wrap"><div className="guide-progress-heading"><span>Challenge progress</span><strong>{progress}%</strong></div><div className="guide-progress" role="progressbar" aria-label="Challenge progress" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{width:`${progress}%`}}/></div><div className="guide-row"><button className="guide-chip" onClick={()=>setProgress(v=>Math.max(0,v-10))}>Step back</button><button className="guide-chip" onClick={()=>setProgress(v=>Math.min(100,v+10))}>Add progress</button></div></div>
   <div className="guide-row"><svg className="progress-ring" width="58" height="58" viewBox="0 0 58 58" role="img" aria-label="One of three activities complete"><circle cx="29" cy="29" r="24" fill="none" stroke="var(--surface-2)" strokeWidth="5"/><circle cx="29" cy="29" r="24" fill="none" stroke="var(--primary)" strokeWidth="5" strokeDasharray="151" strokeDashoffset="100" strokeLinecap="round"/></svg><span>1 of 3 activities complete</span></div>
  </div></section>
  <section className="guide-section" aria-labelledby="guide-editor"><div><h2 id="guide-editor">Editor and output</h2><p>Syntax colors distinguish code roles in both themes. Output and console remain readable without accent overload.</p></div><div className="guide-showcase">
   <div className="guide-code"><header><span>main.py</span><span>Python</span></header><pre><CodePreview code={'# A small, real Python example\nname = "ClassCode"\nfor step in range(3):\n    print(name, step + 1)'}/></pre></div>
   <div className="guide-console"><header><Terminal size={15}/>Output</header><pre>{loaded?'Hello, ClassCode\nLoop complete.':'Ready when you are. Choose Run code to see output.'}</pre><button className="studio-primary" onClick={()=>{setLoaded(true);showToast()}}><Play size={15} fill="currentColor"/>Run code</button></div>
  </div></section>
  <section className="guide-section" aria-labelledby="guide-states"><div><h2 id="guide-states">States and feedback</h2><p>Empty, error, skeleton, menu, tooltip, dialog, and an announcement that can be dismissed.</p></div><div className="guide-showcase">
   <div className="guide-empty"><Spark/><div><strong>Your next idea starts here.</strong><p>Open a starter and make one change.</p></div><button className="studio-secondary"><FolderCode size={16}/>Browse starters</button></div>
   <div className="guide-error" role="alert"><strong>That run stopped at line 3.</strong><details><summary>Why?</summary><p>Check that the value you pass to the function matches the name you created above.</p></details></div>
   <div className="guide-skeleton-grid" aria-label="Loading project examples"><div className="guide-skeleton"/><div className="guide-skeleton"/></div>
   <div className="guide-row"><details className="guide-dropdown"><summary>Project actions <ChevronDown size={15}/></summary><button>Rename project</button><button>Make a copy</button><button>Export a file</button></details><button className="guide-tip" title="Autosave runs after a short pause">Autosave <Info size={14}/></button><button className="studio-secondary" onClick={()=>dialog.current?.showModal()}><Eye size={16}/>Preview dialog</button><button className="studio-secondary" onClick={showToast}>Show toast</button></div>
   <div className="guide-row"><span className="guide-avatar" aria-label="Student avatar">J</span><span className="guide-avatar guide-avatar-secondary" aria-label="Teacher avatar">T</span><span><ShieldCheck size={18} color="var(--success)"/>Private classroom work</span><Link className="guide-link" href="/safety">Read safety details <ExternalLink size={14}/></Link></div>
  </div></section>
  <dialog className="guide-modal" ref={dialog}><button className="guide-modal-close" aria-label="Close dialog" onClick={()=>dialog.current?.close()}><X size={18}/></button><span className="guide-badge"><BookOpen size={14}/>PROJECT PREVIEW</span><h2>Your code, one change at a time.</h2><p>This dialog is a working example of the shared surface, focus, and dismissal patterns.</p><button className="studio-primary" onClick={()=>dialog.current?.close()}>Done</button></dialog>
  {toast&&<div className="guide-toast" role="status" aria-live="polite" onMouseEnter={()=>{if(toastTimer.current){clearTimeout(toastTimer.current);toastTimer.current=null;toastRemaining.current=Math.max(0,toastRemaining.current-(Date.now()-toastStarted.current))}}} onMouseLeave={startToastTimer} onFocusCapture={()=>{if(toastTimer.current){clearTimeout(toastTimer.current);toastTimer.current=null;toastRemaining.current=Math.max(0,toastRemaining.current-(Date.now()-toastStarted.current))}}} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))startToastTimer()}}><Check size={17}/>Saved in this browser<button aria-label="Dismiss notification" onClick={dismissToast}><X size={16}/></button></div>}
  <footer className="guide-footer"><span>ClassCode design system</span><Link href="/">Back to the workspace <ArrowRight size={15}/></Link></footer>
 </main>
}
