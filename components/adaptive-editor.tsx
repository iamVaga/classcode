'use client';
import {useEffect,useRef,useState} from 'react';
import CodePreview from './code-preview';
import dynamic from 'next/dynamic';
import type {EditorProps} from '@monaco-editor/react';
import {useConnection} from './connection-provider';
const Monaco=dynamic(()=>import('@monaco-editor/react'),{ssr:false});
export default function AdaptiveEditor(props:EditorProps){
 const {conserve,online,ready}=useConnection();const [fallback,setFallback]=useState(false),[loaded,setLoaded]=useState(false),[attempt,setAttempt]=useState(0);const text=useRef<HTMLTextAreaElement>(null),paint=useRef<HTMLPreElement>(null);
 const colored=(props.value?.length||0)<30000;
 useEffect(()=>{if(!ready||conserve||loaded)return;const id=setTimeout(()=>setFallback(true),12000);return()=>clearTimeout(id)},[ready,conserve,loaded,attempt]);
 useEffect(()=>{if(text.current)text.current.scrollTop=0},[props.path]);
 if(!ready||conserve||!online||fallback)return <div className="light-editor"><div className="light-editor-notice"><span>{!online?'Offline editing':conserve?'Lightweight editor':'Editor download is taking a while. Keep coding here.'}</span>{ready&&!conserve&&online&&<button onClick={()=>{setFallback(false);setLoaded(false);setAttempt(v=>v+1)}}>Retry full editor</button>}</div><div className={'light-editor-surface '+(colored?'has-highlight':'')}>{colored&&<pre ref={paint} aria-hidden="true" style={{fontSize:props.options?.fontSize||16,lineHeight:1.65}}><CodePreview code={(props.value||'')+'\n'}/></pre>}<textarea ref={text} wrap="off" onScroll={e=>{if(paint.current){paint.current.scrollTop=e.currentTarget.scrollTop;paint.current.scrollLeft=e.currentTarget.scrollLeft}}} aria-label="Code editor" readOnly={props.options?.readOnly} spellCheck={false} autoCapitalize="off" autoCorrect="off" value={props.value||''} style={{fontSize:props.options?.fontSize||16,lineHeight:1.65}} onChange={e=>props.onChange?.(e.target.value,{} as Parameters<NonNullable<EditorProps['onChange']>>[1])} onKeyDown={e=>{if(e.key==='Tab'){e.preventDefault();const input=e.currentTarget,start=input.selectionStart,end=input.selectionEnd;const next=input.value.slice(0,start)+'    '+input.value.slice(end);props.onChange?.(next,{} as Parameters<NonNullable<EditorProps['onChange']>>[1]);requestAnimationFrame(()=>input.setSelectionRange(start+4,start+4))}}}/></div><div className="light-editor-footnote">Lightweight editing · Tab to indent · Ctrl + Enter to run</div></div>;
 const completions=[
  {label:'print',insertText:'print($1)',documentation:'Show a message in your output'},
  {label:'range',insertText:'range($1)',documentation:'Count through a sequence of numbers'},
  {label:'len',insertText:'len($1)',documentation:'Find the number of items'},
  {label:'forward',insertText:'forward($1)',documentation:'Move the Turtle forward'},
  {label:'right',insertText:'right($1)',documentation:'Turn the Turtle right'},
  {label:'circle',insertText:'circle($1)',documentation:'Draw a Turtle circle'},
  {label:'color',insertText:'color($1)',documentation:'Change the Turtle pen color'},
  {label:'goto',insertText:'goto($1, $2)',documentation:'Move the Turtle to a point'}
 ];
 return <Monaco {...props} theme={props.theme==='vs-dark'?'classcode-night':'classcode-day'} beforeMount={monaco=>{
  for(const dark of [false,true]) monaco.editor.defineTheme(dark?'classcode-night':'classcode-day',{base:dark?'vs-dark':'vs',inherit:true,rules:[{token:'keyword',foreground:dark?'C4A0FF':'9252BD'},{token:'string',foreground:dark?'7FE0B8':'147D65'},{token:'number',foreground:dark?'FFBC7E':'BA661F'},{token:'comment',foreground:dark?'8A96AC':'829093',fontStyle:'italic'},{token:'type',foreground:dark?'80C9FF':'3175B0'},{token:'tag',foreground:dark?'FF99B4':'BC4770'},{token:'attribute.name',foreground:dark?'E6CC86':'9C792A'}],colors:{'editor.background':dark?'#151B2B':'#FFFEFC','editor.foreground':dark?'#D5DEF1':'#35435B','editorLineNumber.foreground':dark?'#58667E':'#B0B9C7','editor.lineHighlightBackground':dark?'#202940':'#F4F2FA','editorCursor.foreground':'#9D73CB'}});
  monaco.languages.registerCompletionItemProvider('python',{provideCompletionItems:()=>({suggestions:completions.map(item=>({...item,kind:monaco.languages.CompletionItemKind.Function,insertTextRules:monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet}))})});
  props.beforeMount?.(monaco)
 }} key={attempt} onMount={(editor,monaco)=>{setLoaded(true);props.onMount?.(editor,monaco)}} loading={<div className="editor-loading"><span className="loading-orbit"/><strong>Opening your editor…</strong><small>On a slow connection, a lightweight editor will appear automatically.</small><button onClick={()=>setFallback(true)}>Start typing now</button></div>}/>;
}


