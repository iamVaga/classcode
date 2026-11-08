'use client';
import {useEffect,useRef,useState} from 'react';
import CodePreview from './code-preview';
import dynamic from 'next/dynamic';
import type {EditorProps} from '@monaco-editor/react';
import {useConnection} from './connection-provider';
const Monaco=dynamic(()=>import('@monaco-editor/react'),{
 ssr:false,
 loading:()=> <div className="editor-loading" role="status"><span className="loading-orbit"/><strong>Opening your editor…</strong></div>,
});
const lightweightSuggestions:Record<string,{label:string;insertText:string;detail:string}[]>={
 python:[{label:'print',insertText:'print($1)',detail:'Show a message'},{label:'range',insertText:'range($1)',detail:'Count through numbers'},{label:'input',insertText:'input("$1")',detail:'Ask for input'},{label:'for loop',insertText:'for item in range(5):\n    ',detail:'Repeat an action'},{label:'if statement',insertText:'if condition:\n    ',detail:'Check a condition'},{label:'def function',insertText:'def name():\n    ',detail:'Create a function'},{label:'forward',insertText:'forward($1)',detail:'Move the Turtle'},{label:'backward',insertText:'backward($1)',detail:'Move the Turtle backward'},{label:'right',insertText:'right($1)',detail:'Turn clockwise'},{label:'left',insertText:'left($1)',detail:'Turn counterclockwise'},{label:'circle',insertText:'circle($1)',detail:'Draw a Turtle circle'},{label:'goto',insertText:'goto($1, $2)',detail:'Move to an x and y position'},{label:'color',insertText:'color("$1")',detail:'Set the pen color'},{label:'pensize',insertText:'pensize($1)',detail:'Set the line thickness'},{label:'penup',insertText:'penup()',detail:'Move without drawing'},{label:'pendown',insertText:'pendown()',detail:'Start drawing again'},{label:'speed',insertText:'speed($1)',detail:'Change drawing speed'},{label:'setheading',insertText:'setheading($1)',detail:'Point in a direction'},{label:'begin_fill',insertText:'begin_fill()',detail:'Start a filled shape'},{label:'end_fill',insertText:'end_fill()',detail:'Finish a filled shape'},{label:'bgcolor',insertText:'bgcolor("$1")',detail:'Change the drawing background'},{label:'clear',insertText:'clear()',detail:'Clear the drawing'}],
 java:[{label:'System.out.println',insertText:'System.out.println($1);',detail:'Print a line'},{label:'main method',insertText:'public static void main(String[] args) {\n    \n}',detail:'Start a program'},{label:'for loop',insertText:'for (int i = 0; i < 5; i++) {\n    \n}',detail:'Repeat an action'},{label:'if statement',insertText:'if (condition) {\n    \n}',detail:'Check a condition'},{label:'class',insertText:'public class Main {\n    \n}',detail:'Create a class'},{label:'method',insertText:'public static void name() {\n    \n}',detail:'Create a reusable method'}],
 cpp:[{label:'std::cout',insertText:'std::cout << $1 << "\\n";',detail:'Print a value'},{label:'main function',insertText:'int main() {\n    \n    return 0;\n}',detail:'Start a C++ program'},{label:'for loop',insertText:'for (int i = 0; i < 5; i++) {\n    \n}',detail:'Repeat an action'},{label:'if statement',insertText:'if (condition) {\n    \n}',detail:'Check a condition'},{label:'std::vector',insertText:'std::vector<int> items;',detail:'Create a flexible list'},{label:'function',insertText:'void name() {\n    \n}',detail:'Create a function'}],
 c:[{label:'printf',insertText:'printf("$1\\n");',detail:'Print text'},{label:'main function',insertText:'int main(void) {\n    \n    return 0;\n}',detail:'Start a C program'},{label:'for loop',insertText:'for (int i = 0; i < 5; i++) {\n    \n}',detail:'Repeat an action'},{label:'if statement',insertText:'if (condition) {\n    \n}',detail:'Check a condition'},{label:'scanf',insertText:'scanf("%d", &number);',detail:'Read a number'},{label:'function',insertText:'void name(void) {\n    \n}',detail:'Create a function'}]
};
const bracketPairs:Record<string,string>={'(':')','[':']','{':'}'};
function matchingBrackets(source:string,caret:number){
 const open=Object.keys(bracketPairs),close=Object.values(bracketPairs);
 const index=[caret-1,caret].find(position=>open.includes(source[position])||close.includes(source[position]));
 if(index===undefined||source.length>30_000)return [];
 const current=source[index],forward=open.includes(current);
 const expected=forward?bracketPairs[current]:open[close.indexOf(current)];
 const step=forward?1:-1;
 let depth=0;
 for(let i=index+step;i>=0&&i<source.length;i+=step){
  if(source[i]===current)depth++;
  if(source[i]===expected&&depth--===0)return [index,i];
 }
 return [];
}

export default function AdaptiveEditor({errorLine,...props}:EditorProps & {errorLine?:number|null}){
 const {conserve,online,ready}=useConnection();const [fallback,setFallback]=useState(false),[loaded,setLoaded]=useState(false),[attempt,setAttempt]=useState(0);const text=useRef<HTMLTextAreaElement>(null),paint=useRef<HTMLPreElement>(null);
 const [activeLine,setActiveLine]=useState(1);
 const [scrollTop,setScrollTop]=useState(0);
 const [scrollLeft,setScrollLeft]=useState(0);
 const [caret,setCaret]=useState(0);
 const decorations=useRef<ReturnType<Parameters<NonNullable<EditorProps['onMount']>>[0]['createDecorationsCollection']>|null>(null);
 useEffect(()=>{
  decorations.current?.set(errorLine?[{range:{startLineNumber:errorLine,endLineNumber:errorLine,startColumn:1,endColumn:1},options:{isWholeLine:true,className:'editor-error-line'}}]:[]);
 },[errorLine,loaded,props.path]);
 function updateText(value:string){props.onChange?.(value,{} as Parameters<NonNullable<EditorProps['onChange']>>[1])}
 const [quick,setQuick]=useState<{from:number;items:typeof lightweightSuggestions.python}>();
 const editorLanguage=String(props.language||'python');
 function suggest(value:string,position:number){const before=value.slice(0,position),turtleContext=editorLanguage==='python'&&/\b(?:artist|turtle)\.$/.test(before),prefix=before.match(/[A-Za-z_]\w*$/)?.[0]||'';if(!prefix&&!turtleContext){setQuick(undefined);return}const turtleNames=new Set(['forward','backward','right','left','circle','goto','color','pensize','penup','pendown','speed','setheading','begin_fill','end_fill','bgcolor','clear']);const items=(lightweightSuggestions[editorLanguage]||[]).filter(item=>turtleContext?turtleNames.has(item.label):item.label.toLowerCase().startsWith(prefix.toLowerCase())).slice(0,8);setQuick(items.length?{from:position-prefix.length,items}:undefined)}
 function acceptSuggestion(item:typeof lightweightSuggestions.python[number]){const input=text.current;if(!input||!quick)return;const start=quick.from,end=input.selectionStart;const insert=item.insertText.replace(/\$\{\d+:([^}]+)\}/g,'$1').replace(/\$\{\d+\}/g,'').replace(/\$\d+/g,'');const next=input.value.slice(0,start)+insert+input.value.slice(end);props.onChange?.(next,{} as Parameters<NonNullable<EditorProps['onChange']>>[1]);setQuick(undefined);requestAnimationFrame(()=>{input.focus();input.setSelectionRange(start+insert.length,start+insert.length)})}
 const colored=(props.value?.length||0)<30000;
 useEffect(()=>{if(!ready||conserve||!online||loaded)return;const id=setTimeout(()=>setFallback(true),12000);return()=>clearTimeout(id)},[ready,conserve,online,loaded,attempt]);
 useEffect(()=>{if(text.current)text.current.scrollTop=0},[props.path]);
 if(!ready||conserve||!online||fallback){
  const value=props.value||'';
  const size=props.options?.fontSize||16;
  const lines=value.split('\n');
  const placeholder=editorLanguage==='python'?'# Type your code here':'Type your code here';
  return <div className="light-editor">
   {fallback&&!conserve&&online&&<div className="light-editor-notice"><button onClick={()=>{setFallback(false);setLoaded(false);setAttempt(v=>v+1)}}>Retry full editor</button></div>}
   <div className="light-editor-row" style={{fontSize:size,lineHeight:1.65}}>
    <div className="light-line-gutter" aria-label="Line numbers"><div style={{transform:`translateY(-${scrollTop}px)`}}>{lines.map((_,i)=><div key={i} className={errorLine===i+1?'error-line':activeLine===i+1?'current-line':''}>{i+1}</div>)}</div></div>
    <div className={'light-editor-surface '+(colored?'has-highlight':'')}>
     <div className="light-line-stripe" aria-hidden="true" style={{top:18+(activeLine-1)*size*1.65-scrollTop,height:size*1.65}}/>
     {errorLine&&errorLine<=lines.length?<div className="light-line-stripe error-line" aria-hidden="true" style={{top:18+(errorLine-1)*size*1.65-scrollTop,height:size*1.65}}/>:null}
     {matchingBrackets(value,caret).map(index=>{
      const before=value.slice(0,index).split('\n');
      const column=Array.from(before.at(-1)||'').reduce((count,character)=>count+(character==='\t'?4-count%4:1),0);
      return <span key={index} aria-hidden="true" className="light-bracket-match" style={{top:18+(before.length-1)*size*1.65-scrollTop,left:`calc(12px + ${column}ch - ${scrollLeft}px)`,height:size*1.65}}/>;
     })}
     {colored&&<pre ref={paint} aria-hidden="true" style={{fontSize:size,lineHeight:1.65}}><CodePreview code={value+'\n'}/></pre>}
     <textarea ref={text} wrap="off" aria-label="Code editor" placeholder={placeholder} readOnly={props.options?.readOnly} spellCheck={false} autoCapitalize="off" autoCorrect="off" value={value} style={{fontSize:size,lineHeight:1.65}}
      onSelect={e=>{setCaret(e.currentTarget.selectionStart);setActiveLine(e.currentTarget.value.slice(0,e.currentTarget.selectionStart).split('\n').length)}}
      onScroll={e=>{setScrollTop(e.currentTarget.scrollTop);setScrollLeft(e.currentTarget.scrollLeft);if(paint.current){paint.current.scrollTop=e.currentTarget.scrollTop;paint.current.scrollLeft=e.currentTarget.scrollLeft}}}
      onChange={e=>{updateText(e.target.value);suggest(e.target.value,e.target.selectionStart)}}
      onKeyDown={e=>{
       if(e.ctrlKey||e.metaKey||e.altKey||e.currentTarget.readOnly)return;
       if(e.key==='ArrowDown'&&quick){e.preventDefault();e.currentTarget.parentElement?.querySelector<HTMLButtonElement>('.light-suggestions button')?.focus();return}
       if(e.key==='Tab'&&quick?.items[0]){e.preventDefault();acceptSuggestion(quick.items[0]);return}
       if(e.key==='Escape')setQuick(undefined);
       const input=e.currentTarget,start=input.selectionStart,end=input.selectionEnd;
       const pair=bracketPairs;
       let insert:string;
       if(e.key==='Tab'&&!e.shiftKey)insert='    ';
       else if(e.key==='Enter'){
        const line=value.slice(0,start).split('\n').at(-1)||'';
        insert='\n'+(line.match(/^\s*/)?.[0]||'')+(editorLanguage==='python'&&line.trimEnd().endsWith(':')?'    ':'');
       }else if(pair[e.key])insert=e.key+value.slice(start,end)+pair[e.key];
       else if(Object.values(pair).includes(e.key)&&start===end&&value[start]===e.key){e.preventDefault();input.setSelectionRange(start+1,start+1);return}
       else return;
       e.preventDefault();setQuick(undefined);updateText(value.slice(0,start)+insert+value.slice(end));
       const next=start+insert.length-(pair[e.key]?1:0);
       setCaret(next);
       setActiveLine((value.slice(0,start)+insert).split('\n').length);
       requestAnimationFrame(()=>input.setSelectionRange(next,next));
      }}/>
     {quick&&<div className="light-suggestions" role="listbox" aria-label="Code suggestions">{quick.items.map(item=><button type="button" role="option" aria-selected="false" key={item.label} onMouseDown={e=>e.preventDefault()} onClick={()=>acceptSuggestion(item)}><code>{item.label}</code><span>{item.detail}</span></button>)}</div>}
    </div>
   </div>
  </div>;
 }
 const completions:Record<string,{label:string;insertText:string;documentation:string}[]>={
  python:[['print','print($1)','Show a message'],['range','range($1)','Count through numbers'],['len','len($1)','Get the length'],['input','input("$1")','Ask the learner for input'],['for loop','for ${1:item} in range(${2:5}):\n    $0','Run a loop'],['if statement','if ${1:condition}:\n    $0','Run code when a condition is true'],['def function','def ${1:name}(${2}):\n    $0','Create a reusable function'],['forward','forward($1)','Move the Turtle forward'],['backward','backward($1)','Move the Turtle backward'],['right','right($1)','Turn the Turtle clockwise'],['left','left($1)','Turn the Turtle counterclockwise'],['circle','circle($1)','Draw a Turtle circle'],['goto','goto($1, $2)','Move to a point'],['setheading','setheading($1)','Point in a direction'],['color','color("$1")','Change the Turtle pen color'],['bgcolor','bgcolor("$1")','Change the canvas color'],['pensize','pensize($1)','Change line thickness'],['penup','penup()','Move without drawing'],['pendown','pendown()','Start drawing again'],['speed','speed($1)','Change drawing speed'],['shape','shape("$1")','Choose a Turtle shape'],['begin_fill','begin_fill()','Start filling a shape'],['end_fill','end_fill()','Finish filling a shape'],['dot','dot($1)','Draw a dot'],['write','write("$1")','Write text on the canvas'],['clear','clear()','Clear the drawing'],['reset','reset()','Reset the Turtle and canvas']].map(([label,insertText,documentation])=>({label,insertText,documentation})),
  java:[['main method','public static void main(String[] args) {\n    $0\n}','Start a Java program'],['println','System.out.println($1);','Print a line'],['for loop','for (int ${1:i} = 0; ${1:i} < ${2:5}; ${1:i}++) {\n    $0\n}','Repeat an action'],['if statement','if (${1:condition}) {\n    $0\n}','Check a condition'],['class','public class ${1:Main} {\n    $0\n}','Create a class'],['method','public static ${1:void} ${2:name}(${3}) {\n    $0\n}','Create a reusable method'],['array','int[] ${1:numbers} = {${2:1, 2, 3}};','Create an integer array'],['Scanner input','Scanner scanner = new Scanner(System.in);\n$0','Read keyboard input']].map(([label,insertText,documentation])=>({label,insertText,documentation})),
  cpp:[['main function','int main() {\n    $0\n    return 0;\n}','Start a C++ program'],['cout','std::cout << $1 << "\\n";','Print text or a value'],['for loop','for (int ${1:i} = 0; ${1:i} < ${2:5}; ${1:i}++) {\n    $0\n}','Repeat an action'],['if statement','if (${1:condition}) {\n    $0\n}','Check a condition'],['function','${1:void} ${2:name}(${3}) {\n    $0\n}','Create a reusable function'],['vector','std::vector<${1:int}> ${2:items};','Create a flexible list'],['string','std::string ${1:name} = "$2";','Create text']].map(([label,insertText,documentation])=>({label,insertText,documentation})),
  c:[['main function','int main(void) {\n    $0\n    return 0;\n}','Start a C program'],['printf','printf("$1\\n");','Print text'],['scanf','scanf("%d", &${1:number});','Read a number'],['for loop','for (int ${1:i} = 0; ${1:i} < ${2:5}; ${1:i}++) {\n    $0\n}','Repeat an action'],['if statement','if (${1:condition}) {\n    $0\n}','Check a condition'],['function','${1:void} ${2:name}(${3}) {\n    $0\n}','Create a reusable function'],['array','int ${1:numbers}[${2:5}] = {$3};','Create a fixed-size list']].map(([label,insertText,documentation])=>({label,insertText,documentation}))
 };
 return <Monaco {...props} options={{...props.options,placeholder:editorLanguage==='python'?'# Type your code here':'Type your code here'}} theme={props.theme==='vs-dark'?'classcode-night':'classcode-day'} beforeMount={monaco=>{
  for(const dark of [false,true]) monaco.editor.defineTheme(dark?'classcode-night':'classcode-day',{base:dark?'vs-dark':'vs',inherit:true,rules:[{token:'keyword',foreground:dark?'3CC4C6':'0B7A7C'},{token:'string',foreground:dark?'FF8A6B':'B84F32'},{token:'number',foreground:dark?'FFC857':'805700'},{token:'comment',foreground:dark?'9AA5B4':'5B6472',fontStyle:'italic'},{token:'type',foreground:dark?'EEF1F5':'0B7A7C'},{token:'function',foreground:dark?'EEF1F5':'1D3440'},{token:'tag',foreground:dark?'A7BED8':'805700'},{token:'attribute.name',foreground:dark?'D8E0E9':'5B6472'}],colors:{'editor.background':dark?'#161C24':'#FFFFFF','editor.foreground':dark?'#EEF1F5':'#14181F','editorLineNumber.foreground':dark?'#9AA5B4':'#5B6472','editor.lineHighlightBackground':dark?'#1E2630':'#F3F0EA','editorCursor.foreground':dark?'#3CC4C6':'#0B7A7C','editor.selectionBackground':dark?'#12363A':'#D0E9E7'}});
  for(const language of ['python','java','cpp','c'])monaco.languages.registerCompletionItemProvider(language,{triggerCharacters:['.','('],provideCompletionItems:()=>{const base=completions[language]||[],extra=language==='python'?lightweightSuggestions.python.filter(item=>!base.some(current=>current.label===item.label)).map(item=>({...item,documentation:item.detail})):[];return{suggestions:[...base,...extra].map(item=>({...item,kind:monaco.languages.CompletionItemKind.Function,insertTextRules:monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet}))}}});
  props.beforeMount?.(monaco)
 }} key={attempt} onMount={(editor,monaco)=>{decorations.current=editor.createDecorationsCollection();setLoaded(true);props.onMount?.(editor,monaco)}} loading={<div className="editor-loading"><span className="loading-orbit"/><strong>Opening your editor…</strong><small>On a slow connection, a lightweight editor will appear automatically.</small><button onClick={()=>setFallback(true)}>Start typing now</button></div>}/>;
}


