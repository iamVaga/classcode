'use client';

import {useState} from 'react';
import {ArrowRight} from 'lucide-react';
import CodePreview from './code-preview';
import {Starter, starters} from '@/lib/starters';

const activities = [
  {id:'python', label:'Say hello', file:'hello.py', prompt:'Who gets a hello?', choices:['Fox', 'Robot', 'Dragon']},
  {id:'turtle', label:'Draw a star', file:'artwork.py', prompt:'Pick a pen color', choices:['coral', 'gold', 'turquoise']},
  {id:'web', label:'Make a page', file:'index.html', prompt:'Name your planet', choices:['Moonberry', 'Starfall', 'Bubble']},
] as const;

function sample(id:string, choice:string) {
  if (id==='python') return `friend = "${choice}"\nprint(f"Hello, {friend}!")`;
  if (id==='web') return `<main>\n  <h1>Planet ${choice}</h1>\n  <p>Welcome, explorer!</p>\n</main>`;
  return `import turtle\n\npen = turtle.Turtle()\npen.color("${choice}")\nfor side in range(5):\n    pen.forward(100)\n    pen.right(144)`;
}

export default function SnippetPlayground({onOpen}:{onOpen:(starter:Starter)=>void}) {
  const [active,setActive]=useState(0);
  const [picks,setPicks]=useState([0,0,0]);
  const activity=activities[active];
  const choice=activity.choices[picks[active]];
  const code=sample(activity.id, choice);

  function openEditor() {
    const starter=starters.find(item=>item.id===activity.id)!;
    const files=starter.type==='web'?{...starter.files,[activity.file]:code}:{[activity.file]:code};
    onOpen({...starter,files});
  }

  function moveTab(event:React.KeyboardEvent<HTMLButtonElement>,index:number){
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?activities.length-1:(index+(event.key==='ArrowRight'?1:-1)+activities.length)%activities.length;
    setActive(next);
    document.getElementById(`experiment-tab-${activities[next].id}`)?.focus();
  }

  return <div className="snippet-playground">
    <div className="snippet-playground-top"><span>TRY A TINY EXPERIMENT</span><span className="snippet-lab-dot"/></div>
    <div className="snippet-language-tabs" role="tablist" aria-label="Choose an experiment">
      {activities.map((item,index)=><button type="button" role="tab" id={`experiment-tab-${item.id}`} aria-controls="experiment-panel" aria-selected={active===index} tabIndex={active===index?0:-1} key={item.id} onKeyDown={event=>moveTab(event,index)} onClick={()=>setActive(index)}>{item.label}</button>)}
    </div>
    <div className="experiment-choices" role="group" aria-label={activity.prompt}>
      <strong>{activity.prompt}</strong>
      <div>{activity.choices.map((option,index)=><button key={option} type="button" aria-pressed={choice===option}
        onClick={()=>setPicks(previous=>previous.map((value,i)=>i===active?index:value))}>{option}</button>)}</div>
    </div>
    <div id="experiment-panel" role="tabpanel" aria-labelledby={`experiment-tab-${activity.id}`} className="snippet-editor" aria-label="Example code"><span className="snippet-file-name">{activity.file}</span>
      <div className="snippet-lines" aria-hidden="true">{code.split('\n').map((_,i)=><span key={i}>{i+1}</span>)}</div>
      <pre><CodePreview code={code}/></pre>
    </div>
    <div className="snippet-example-output" aria-live="polite"><span>Live preview</span><span className="snippet-live-indicator"><i/>Updates as you explore</span>
      {activity.id==='turtle'?<svg width="66" height="52" viewBox="0 0 105 95" role="img" aria-label={choice+' star'}><path d="M3 36 H101 L21 94 L52 1 L83 94 Z" fill="none" stroke={choice} strokeWidth="3"/></svg>
        :<strong>{activity.id==='python'?`Hello, ${choice}!`:`Planet ${choice} · Welcome, explorer!`}</strong>}
    </div>
    <button className="snippet-open" onClick={openEditor}>Open my code <ArrowRight size={14}/></button>
  </div>;
}
