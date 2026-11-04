'use client';

import {useDeferredValue,useEffect,useRef,useState} from 'react';
import {ArrowRight,BookOpen,Check,Clock,Code2,FolderCode,Globe,GraduationCap,MousePointer2,Moon,Plus,Search,Settings2,Sun,Terminal,Users,X} from 'lucide-react';
import Avatar from './avatar';
import BrandMark from './brand-mark';
import ClassroomPanel from './classroom-panel';
import SnippetPlayground from './snippet-playground';
import CodePreview from './code-preview';
import {Project} from '@/lib/model';
import {Starter,starters} from '@/lib/starters';

type Props={page:string;onPage:(v:string)=>void;projects:Project[];onOpen:(p:Project)=>void;onTemplate:(s:Starter)=>void;onModal:(v:string)=>void;avatar:number;color:string;user:string;dark:boolean;onTheme:()=>void};
const navItems=[
 ['Overview','Discover','Fresh coding ideas and starter projects.'],
 ['Projects','My projects','Open projects saved on this device or account.'],
 ['My students','Classroom','Manage invitations, assignments, and student work.'],
 ['Lesson notes','Notebook','Keep private lesson notes in this browser.']
];
const categories=['All projects','Python','Java','C++','C','Web development','Turtle graphics'];

export default function WorkspaceHome({page,onPage,projects,onOpen,onTemplate,onModal,avatar,color,user,dark,onTheme}:Props){
 const [query,setQuery]=useState(''),[category,setCategory]=useState('All projects'),[sort,setSort]=useState('Recent first'),[avatarCursor,setAvatarCursor]=useState(false),[cursorAvailable,setCursorAvailable]=useState(false);
 const searchInput=useRef<HTMLInputElement>(null);
 useEffect(()=>{const supported=matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches;setCursorAvailable(supported);try{setAvatarCursor(supported&&localStorage.getItem('classcode-avatar-pointer')==='on')}catch{setAvatarCursor(false)}},[]);
 useEffect(()=>{const shortcut=(e:KeyboardEvent)=>{if(e.key==='/'&&!(e.target as HTMLElement).closest('input,textarea,[contenteditable]')){e.preventDefault();searchInput.current?.focus()}};window.addEventListener('keydown',shortcut);return()=>window.removeEventListener('keydown',shortcut)},[]);
 const search=useDeferredValue(query.toLowerCase());
 const matchCategory=(type:string,files:Record<string,string>)=>category==='All projects'||category===type||(category==='Web development'&&type==='web')||(category==='Turtle graphics'&&Object.values(files).some(code=>/\b(import turtle|from turtle import)\b/.test(code)));
 const matches=(p:Project)=>p.name.toLowerCase().includes(search)&&matchCategory(p.type,p.files);
 const sorted=projects.filter(matches).toSorted((a,b)=>sort==='A–Z'?a.name.localeCompare(b.name):Date.parse(b.updated)-Date.parse(a.updated));
 const recent=projects.toSorted((a,b)=>Date.parse(b.updated)-Date.parse(a.updated))[0];
 const templates=starters.filter(s=>(s.name+' '+s.category+' '+s.description).toLowerCase().includes(search)&&(category==='All projects'||category===s.category));
 function setCursorEnabled(enabled:boolean){setAvatarCursor(enabled);try{localStorage.setItem('classcode-avatar-pointer',enabled?'on':'off')}catch{}window.dispatchEvent(new CustomEvent('classcode-avatar-pointer',{detail:{enabled}}))}

 return <div className="learning-workspace">
  <header className="studio-header">
   <button className="studio-logo" onClick={()=>onPage('Overview')} aria-label="ClassCode home"><span><BrandMark size={31}/></span>classcode<span className="logo-period">.</span></button>
   <nav aria-label="Main navigation">{navItems.map(([key,title,description])=><button title={description} aria-label={`${title}: ${description}`} className={page===key?'active':''} key={key} onClick={()=>{onPage(key);setQuery('')}}>{title}{key==='Projects'&&user&&<small aria-label={`${projects.length} projects`}>{projects.length}</small>}</button>)}</nav>
   <div className="studio-header-actions">
    <button className="studio-icon" aria-label={`Switch to ${dark?'light':'dark'} theme`} title={`Switch to ${dark?'light':'dark'} theme`} onClick={onTheme}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button>
    <details className="studio-settings"><summary aria-label="Workspace settings" title="Workspace settings"><Settings2 size={18}/></summary><div className="settings-menu"><strong>Workspace settings</strong><button type="button" aria-pressed={avatarCursor} disabled={!cursorAvailable} onClick={()=>setCursorEnabled(!avatarCursor)}><MousePointer2 size={16}/><span>Character cursor</span><small>{cursorAvailable?(avatarCursor?'On':'Off'):'Unavailable'}</small></button><p>Optional. Available with a mouse and standard motion settings. Your normal cursor stays visible on buttons and text fields.</p></div></details>
    <button className="account-link" onClick={()=>onModal('account')}>{user?user.split('@')[0]:'Sign in'}<ArrowRight size={14}/></button>
    <button className="profile-avatar" aria-label="Choose your avatar" onClick={()=>onModal('avatar')}><Avatar kind={avatar} color={color} size={38}/></button>
   </div>
  </header>
  <main className="studio-main">
   {page==='Overview'?<>
    <section className="discovery-hero"><div className="hero-copy"><span className="studio-kicker"><span aria-hidden="true"/> A CODING WORKSPACE FOR STUDENTS AND TEACHERS</span><h1>Students make.<br/><span>Teachers guide.</span></h1><p>Write Python, draw with Turtle, or build for the web. Teachers can invite a class, set challenges, and review student work in one place.</p><div className="hero-buttons"><button className="studio-primary" onClick={()=>onModal('create')}>Start a project <ArrowRight size={17}/></button></div><div className="hero-capabilities"><span><Check size={14}/>Runs in your browser</span><span><Check size={14}/>Local projects need no account</span></div></div><div className="hero-visual"><div className="hero-disc" aria-hidden="true"/><SnippetPlayground onOpen={onTemplate}/><div className="hero-character"><Avatar kind={avatar} color={color} size={105}/><span>Ready when you are.</span></div></div></section>
    <div className="workspace-divider"><span>YOUR WORKSPACE. YOUR PACE.</span><span>Make it. Test it. Figure it out.</span></div>
    <section className="jump-back"><div><span className="mini-label">PICK UP WHERE YOU LEFT OFF</span><h2>{recent?'Back to your next big thing.':user?'Your next project starts here.':'Try ClassCode as a guest or sign in to sync.'}</h2><p>{recent?'Your latest project is right where you left it.':user?'Start a project and it will appear here.':'Guest projects stay in this browser. Sign in when you want account-based cloud storage.'}</p></div>{recent?<button className="continue-card" onClick={()=>onOpen(recent)}><span className={'project-symbol '+recent.type}>{recent.type==='web'?<Globe size={23}/>:<Terminal size={23}/>}</span><span><strong>{recent.name}</strong><small>{projectLanguage(recent)} · {relativeTime(recent.updated)}</small></span><ArrowRight size={20}/></button>:user?<button className="continue-card empty" onClick={()=>onModal('create')}><span className="project-symbol"><Plus size={23}/></span><span><strong>Create a project</strong><small>Choose a language and make a first draft.</small></span><ArrowRight size={20}/></button>:<div className="guest-actions"><button className="studio-secondary" onClick={()=>onModal('account')}>Sign in to sync <ArrowRight size={15}/></button><span>Your work stays editable without signing in.</span></div>}</section>
   </>:<div className="inner-page-heading"><span className="studio-kicker">YOUR CLASSCODE WORKSPACE</span><h1>{page==='Projects'?'A home for every idea.':page==='My students'?'Good teaching starts with connection.':'The notes behind the breakthroughs.'}</h1><p>{page==='Projects'?'All your experiments, saved in one place.':page==='My students'?'Create a class, assign a challenge, and review student work.':'A little space to plan, reflect, and remember what worked.'}</p></div>}
   {(page==='Overview'||page==='Projects')&&<>
    <section className="discovery-section"><div className="discovery-heading"><div><span className="mini-label">{page==='Overview'?'IDEAS TO MAKE YOUR OWN':'MADE BY YOU'}</span><h2>{page==='Overview'?'Choose a starting point':'Your projects'}</h2></div><label className="studio-search"><Search size={18}/><input ref={searchInput} aria-label="Search projects and starters" value={query} onChange={e=>setQuery(e.target.value)} placeholder={page==='Overview'?'Find a coding idea…':'Search your projects…'}/>{query&&<button type="button" aria-label="Clear search" onClick={()=>setQuery('')}><X size={14}/></button>}<kbd aria-hidden="true">/</kbd></label></div><div className="discovery-controls"><div className="category-tabs" aria-label="Project categories">{categories.map(c=><button type="button" aria-pressed={category===c} className={category===c?'active':''} onClick={()=>setCategory(c)} key={c}>{c==='All projects'?<FolderCode size={14}/>:c==='Web development'?<Globe size={14}/>:<Code2 size={14}/>}<span>{c}</span></button>)}</div>{page==='Overview'?<span className="results-label" aria-live="polite">{templates.length} {templates.length===1?'idea':'ideas'}</span>:<select aria-label="Sort projects" value={sort} onChange={e=>setSort(e.target.value)}><option>Recent first</option><option>A–Z</option></select>}</div>
     {page==='Overview'?<div className="starter-grid">{templates.map(s=><button className={'starter-card starter-'+s.id} key={s.id} onClick={()=>onTemplate(s)}><StarterArt starter={s}/><div className="starter-info"><span className="starter-category">{s.category}</span><h3>{s.name}</h3><p>{s.description}</p><div className="starter-bottom"><span><span className="level-dot"/>{s.level}</span><span><Clock size={13}/>{s.time}</span><span className="starter-action">Open <ArrowRight size={15}/></span></div></div></button>)}</div>:<div className="studio-projects">{sorted.map(p=><button className="saved-project-card" key={p.id} onClick={()=>onOpen(p)}><div className="saved-project-top"><span className={'project-symbol '+p.type}>{p.type==='web'?<Globe size={25}/>:<Terminal size={25}/>}</span><ArrowRight size={19}/></div><h3>{p.name}</h3><span className="saved-language">{projectLanguage(p)}</span><div className="saved-project-bottom"><span><Check size={12}/> Saved</span><span>{relativeTime(p.updated)}</span></div></button>)}<button className="new-project-card" onClick={()=>onModal('create')}><Plus size={26}/><strong>Make something new</strong><span>There’s always room for another idea.</span></button></div>}
     {page==='Overview'&&!templates.length&&<div className="studio-empty"><Search size={28}/><h3>No ideas match those filters yet.</h3><p>Try another language or clear your search to see all {starters.length} starting points.</p><button className="studio-link" onClick={()=>{setQuery('');setCategory('All projects')}}>Show all ideas <ArrowRight size={15}/></button></div>}
     {page==='Projects'&&!sorted.length&&<div className="studio-empty"><FolderCode size={28}/><h3>{projects.length?'No projects match those filters.':'Your projects will appear here.'}</h3><p>{projects.length?'Try another language or clear your search.':'Start a project, or sign in to keep your work synced to your account.'}</p><button className="studio-link" onClick={()=>{if(projects.length){setQuery('');setCategory('All projects')}else onModal('create')}}>{projects.length?'Reset filters':'Start a project'} <ArrowRight size={15}/></button></div>}
    </section>
    {page==='Overview'&&<><TeacherOverview onOpen={()=>onPage('My students')}/><StudentSafetyPreview/></>}
   </>}
   {page==='My students'&&<ClassroomPanel onOpen={onOpen} onSignIn={()=>onModal('account')}/>}
   {page==='Lesson notes'&&<StudioNotebook/>}
   <footer className="studio-footer"><button className="studio-logo" onClick={()=>onPage('Overview')}><span><BrandMark size={25}/></span>classcode<span className="logo-period">.</span></button><p>Students make. Teachers guide.</p><span>For curious minds.</span><nav aria-label="Policies and information"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/safety">Safety</a><a href="/about">About</a></nav></footer>
  </main>
 </div>
}

function projectLanguage(project:Project){return project.type==='python'?'Python':project.type==='java'?'Java':project.type==='cpp'?'C++':project.type==='c'?'C':'Web development'}
function relativeTime(date:string){const minutes=Math.max(0,Math.floor((Date.now()-Date.parse(date))/60000));if(minutes<1)return 'just now';if(minutes<60)return `${minutes}m ago`;if(minutes<1440)return `${Math.floor(minutes/60)}h ago`;return new Date(date).toLocaleDateString('en',{month:'short',day:'numeric'})}
function StarterArt({starter}:{starter:Starter}){const samples:Record<string,{file:string;code:string}>={
 turtle:{file:'main.py',code:'pen.color("coral")\nfor side in range(5):\n    pen.forward(100)\n    pen.right(144)'},
 web:{file:'index.html',code:'<h1>Hello, curious world.</h1>\n<p>Big ideas start small.</p>'},
 python:{file:'main.py',code:'name = "curious coder"\nprint(f"Hello, {name}!")\nfor step in range(1, 6):\n    print("*" * step)'},
 game:{file:'main.py',code:'if guess == secret:\n    print("You got it!")\nelif guess < secret:\n    print("Try higher")'},
 java:{file:'Main.java',code:'class Greeter {\n  String message(String name) {\n    return "Hello, " + name;\n  }\n}'},
 cpp:{file:'main.cpp',code:'for (int step = 1; step <= 5; ++step) {\n  std::cout << step << "\\n";\n}'},
 c:{file:'main.c',code:'const char *name = "coder";\nprintf("Hello, %s!\\n", name);'},
 planet:{file:'index.html',code:'<h1>Welcome to Moonberry</h1>\n<p>A tiny planet with a very big sky.</p>'}
 };const example=samples[starter.id]||{file:Object.keys(starter.files)[0],code:Object.values(starter.files)[0]};return <div className={'starter-art art-'+starter.id} aria-hidden="true"><div className="starter-code-window"><span className="starter-code-file"><i/>{example.file}</span><pre><CodePreview code={example.code}/></pre><span className="starter-code-foot">{starter.tagline}</span></div></div>}

function TeacherOverview({onOpen}:{onOpen:()=>void}){return <section className="teacher-overview"><div className="teacher-intro"><span className="mini-label">FOR TEACHERS</span><h2>A clearer view of the work in progress.</h2><p>Bring your class into the same coding workspace. Set a challenge, join a student’s live session, and review submissions and checks.</p><button className="studio-secondary" onClick={onOpen}>Explore the classroom <ArrowRight size={16}/></button></div><div className="teacher-capabilities">
 <article className="teacher-capability"><span className="teacher-icon"><Users size={19}/></span><span className="mini-label">01 · SET UP</span><h3>Create a class</h3><p>Invite students with a private classroom code.</p><div className="teacher-mock teacher-mock-class"><span>CLASSROOM</span><strong>Your class</strong><small>Invite students · private code</small></div></article>
 <article className="teacher-capability"><span className="teacher-icon"><Code2 size={19}/></span><span className="mini-label">02 · ASSIGN</span><h3>Give a challenge</h3><p>Choose a starter, add instructions, and set a due date.</p><div className="teacher-mock teacher-mock-assignment"><span>ASSIGNMENT</span><strong>Make a small program</strong><small>Starter · Instructions · Due date</small></div></article>
 <article className="teacher-capability"><span className="teacher-icon"><GraduationCap size={19}/></span><span className="mini-label">03 · REVIEW</span><h3>See progress</h3><p>Review submitted work and automated checks.</p><div className="teacher-mock teacher-mock-progress"><span>STUDENT WORK</span><strong>Submissions &amp; checks</strong><small>Open a student project to review</small></div></article>
 </div></section>}

function StudentSafetyPreview(){return <section className="student-safety"><div><span className="mini-label">HOW WE PROTECT STUDENT WORK</span><h2>Clear boundaries for sharing and learning.</h2><p>Here is what the current app does—and what still needs an owner decision.</p></div><ul><li><Check size={16}/><span><strong>No public project gallery.</strong> Student projects are not publicly published in this version.</span></li><li><Check size={16}/><span><strong>Student starts live sharing.</strong> A teacher joins after the student chooses to share a draft.</span></li><li><Check size={16}/><span><strong>Use classroom-safe details.</strong> Avoid personal information in project names, source code, and output.</span></li></ul><a href="/safety">Read the safety and moderation draft <ArrowRight size={15}/></a></section>}

function StudioNotebook(){const [value,setValue]=useState(''),[status,setStatus]=useState('');useEffect(()=>{try{setValue(localStorage.getItem('classcode-notes')||'')}catch{setStatus('Notes are unavailable in this browser.')}},[]);return <section className="studio-notebook"><div><BookOpen size={21}/><strong>Your teaching notebook</strong><span>{status||'Saved in this browser'}</span></div><textarea aria-label="Lesson notes" placeholder="What are we exploring today?\n\nCapture a lesson idea, a tricky question, or a small win worth remembering." value={value} onChange={e=>{setValue(e.target.value);try{localStorage.setItem('classcode-notes',e.target.value);setStatus('Saved in this browser')}catch{setStatus('Could not save. Copy your notes before leaving.')}}}/></section>}
