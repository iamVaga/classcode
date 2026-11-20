'use client';
import {useState} from 'react';
import Link from 'next/link';
export default function JoinSession(){
 const [value,setValue]=useState(''),[error,setError]=useState('');
 return <main style={{maxWidth:480,margin:'64px auto',padding:24}}><Link href="/">Back to ClassCode</Link><h1>Join a session</h1><p>Paste the code or link shared with you. Everyone in the room can edit.</p><form onSubmit={event=>{
  event.preventDefault();
  const code=value.trim().replace(/.*\/session\//,'').split(/[?#]/)[0].toLowerCase();
  if(!/^[a-f0-9]{20}$/.test(code)){setError('Enter a valid session code or link.');return}
  window.location.assign('/session/'+code);
 }}><label>Session code or link<input style={{display:'block',width:'100%',padding:12,marginBlock:12}} value={value} onChange={event=>setValue(event.target.value)} required/></label><button className="studio-primary">Join session</button>{error&&<p role="alert">{error}</p>}</form></main>;
}
