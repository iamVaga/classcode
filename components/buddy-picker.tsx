'use client';
import {useEffect,useRef,useState} from 'react';
import Avatar,{buddyNames} from './avatar';

const swatches=[['Mint','#8edab1'],['Lilac','#bda6ff'],['Peach','#ffac83'],['Sky','#8acff7'],['Berry','#f79eb7'],['Lemon','#f7d974']];
const gearOptions=['none','scarf','crown'] as const;

export default function BuddyPicker({kind,color,onSave,onClose}:{kind:number;color:string;onSave:(kind:number,color:string,gear:string)=>void;onClose:()=>void}){
  const dialog=useRef<HTMLDialogElement>(null);
  const [pick,setPick]=useState(kind);
  const [tint,setTint]=useState(color);
  const [gear,setGear]=useState(document.documentElement.dataset.buddyGear||'none');
  const [error,setError]=useState('');
  useEffect(()=>{const node=dialog.current;node?.showModal();return()=>node?.close()},[]);
  return <dialog ref={dialog} className="buddy-picker" aria-labelledby="buddy-title" onCancel={onClose}>
    <header><div><small>CHARACTER STUDIO</small><h2 id="buddy-title">Choose your coding buddy</h2></div><button aria-label="Close character studio" onClick={onClose}>×</button></header>
    <div className="buddy-preview" data-buddy-gear={gear}><Avatar kind={pick} color={tint} size={80}/><div><strong>{buddyNames[pick]}</strong><p>Your buddy in the editor and on your cursor.</p></div></div>
    <fieldset><legend>Pick a character</legend><div className="buddy-grid">{buddyNames.map((name,index)=><button key={name} aria-label={name} aria-pressed={pick===index} onClick={()=>setPick(index)}><Avatar kind={index} color={tint} size={42}/><span>{name.split(' ')[0]}</span></button>)}</div></fieldset>
    <fieldset><legend>Choose a color</legend><div className="buddy-options">{swatches.map(([name,value])=><button key={value} aria-pressed={value===tint} onClick={()=>setTint(value)}><i style={{background:value}}/>{name}</button>)}</div></fieldset>
    <fieldset><legend>Dress up</legend><div className="buddy-options">{gearOptions.map(item=><button key={item} aria-pressed={gear===item} onClick={()=>setGear(item)}>{item==='none'?'No accessory':item==='scarf'?'Explorer scarf':'Star crown'}</button>)}</div></fieldset>
    {error&&<p role="alert">{error}</p>}<button className="studio-primary" onClick={()=>{try{onSave(pick,tint,gear)}catch{setError('Your browser could not save this buddy. Please try again.')}}}>Use this buddy</button>
  </dialog>;
}
