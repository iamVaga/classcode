'use client';
import {FormEvent,useEffect,useState} from 'react';
import {ArrowLeft,ArrowRight,CheckCircle2,Eye,EyeOff,KeyRound,LoaderCircle,LockKeyhole,LogOut,Mail,ShieldCheck,Sparkles} from 'lucide-react';
import {configured,db} from '@/lib/supabase';

type Mode='signin'|'signup'|'forgot'|'recovery';
export default function AuthForm({user,recovery,onAuthenticated,onSignOut,onClose,onRecoveryComplete}:{user:string;recovery:boolean;onAuthenticated:(id:string,email:string)=>Promise<void>;onSignOut:()=>Promise<void>;onClose:()=>void;onRecoveryComplete:()=>void}){
 const [mode,setMode]=useState<Mode>(recovery?'recovery':'signin');
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [visible,setVisible]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 useEffect(()=>{if(recovery){setMode('recovery');setError('');setMessage('Choose a new password for your account.')}},[recovery]);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setError('');setMessage('');if(!configured||!db){setError('Accounts are temporarily unavailable. Your saved projects on this device are safe.');return}setBusy(true);try{
  if(mode==='forgot'){
   const {error}=await db.auth.resetPasswordForEmail(email.trim());if(error)throw error;setMessage(`Password reset link sent to ${email.trim()}. Check your inbox, then return here to choose a new password.`);return;
  }
  if(mode==='recovery'){
   const {data,error}=await db.auth.updateUser({password});if(error)throw error;if(!data.user)throw new Error('Your reset session expired. Request a fresh password reset link.');onRecoveryComplete();await onAuthenticated(data.user.id,data.user.email||email.trim());return;
  }
  if(mode==='signup'){
   const {data,error}=await db.auth.signUp({email:email.trim(),password});if(error)throw error;if(data.session&&data.user){await onAuthenticated(data.user.id,data.user.email||email.trim());return;}setMode('signin');setPassword('');setMessage(`Account started. Check ${email.trim()} for the confirmation link, then sign in.`);return;
  }
  const {data,error}=await db.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;if(!data.session||!data.user)throw new Error('We couldn’t start your session. Please try again.');await onAuthenticated(data.user.id,data.user.email||email.trim());
 }catch(e){setError(e instanceof Error?e.message:'Something went wrong. Please try again.')}finally{setBusy(false)}}
 async function googleSignIn(){setError('');setMessage('');if(!configured||!db){setError('Accounts are temporarily unavailable. Your saved projects on this device are safe.');return}setBusy(true);try{const {error}=await db.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin,queryParams:{prompt:'select_account'}}});if(error)throw error}catch(e){const reason=e instanceof Error?e.message:'';setError(/provider.*not enabled|unsupported provider/i.test(reason)?'Google sign-in needs to be enabled in the ClassCode account settings. You can sign in with email below.':reason||'Google sign-in could not start. Please try again.');setBusy(false)}}
 const title=mode==='signup'?'Create your account':mode==='forgot'?'Reset your password':mode==='recovery'?'Choose a new password':'Welcome back';
 const description=mode==='signup'?'Save projects across devices and bring your classroom together.':mode==='forgot'?'We’ll email you a secure link to get back into your account.':mode==='recovery'?'Use a new password you haven’t used before.':'Sign in to open your projects and classroom.';
 if(user)return <div className="auth-content"><div className="auth-icon signed"><CheckCircle2 size={22}/></div><span className="auth-eyebrow">CLASSCODE ACCOUNT</span><h2>You’re signed in</h2><p>Your classroom is ready whenever you are.</p><div className="auth-account"><span className="auth-account-mark">{user.charAt(0).toUpperCase()}</span><span><strong>{user}</strong><small>ClassCode account</small></span><ShieldCheck size={18}/></div><button className="primary full auth-submit" onClick={onClose}>Continue to ClassCode <ArrowRight size={16}/></button><button className="auth-signout" disabled={busy} onClick={()=>void onSignOut()}><LogOut size={15}/>Sign out</button></div>;
 return <div className="auth-content"><div className="auth-heading"><div className="auth-icon">{mode==='forgot'||mode==='recovery'?<KeyRound size={21}/>:mode==='signup'?<Sparkles size={21}/>:<LockKeyhole size={21}/>}</div><button type="button" className="auth-close" aria-label="Close sign in" onClick={onClose}>×</button></div><span className="auth-eyebrow">CLASSCODE ACCOUNT</span><h2>{title}</h2><p>{description}</p>
  {mode!=='forgot'&&mode!=='recovery'&&<div className="auth-tabs" role="tablist" aria-label="Account action"><button type="button" role="tab" aria-selected={mode==='signin'} className={mode==='signin'?'active':''} onClick={()=>{setMode('signin');setError('');setMessage('')}}>Sign in</button><button type="button" role="tab" aria-selected={mode==='signup'} className={mode==='signup'?'active':''} onClick={()=>{setMode('signup');setError('');setMessage('')}}>Create account</button></div>}
  {(mode==='signin'||mode==='signup')&&<><button type="button" className="auth-google" onClick={()=>void googleSignIn()} disabled={busy||!configured}><GoogleMark/><span>Continue with Google</span>{busy&&<LoaderCircle size={15} className="auth-spinner"/>}</button><div className="auth-divider"><span>or continue with email</span></div></>}
  <form onSubmit={e=>void submit(e)} noValidate={false}>
   <label className="form-label">Email address<div className="auth-input-wrap"><Mail size={16}/><input autoFocus type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@school.com"/></div></label>
   {mode!=='forgot'&&<label className="form-label">{mode==='recovery'?'New password':'Password'}<div className="auth-input-wrap"><LockKeyhole size={16}/><input type={visible?'text':'password'} autoComplete={mode==='signup'?'new-password':mode==='recovery'?'new-password':'current-password'} required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/><button type="button" className="password-toggle" aria-label={visible?'Hide password':'Show password'} onClick={()=>setVisible(v=>!v)}>{visible?<EyeOff size={16}/>:<Eye size={16}/>}</button></div><small className="auth-field-hint">Use at least 8 characters.</small></label>}
   {mode==='signin'&&<button type="button" className="auth-forgot" onClick={()=>{setMode('forgot');setError('');setMessage('')}}>Forgot password?</button>}
   {error&&<div className="auth-feedback error" role="alert">{error}</div>}{message&&<div className="auth-feedback success" role="status"><CheckCircle2 size={16}/><span>{message}</span></div>}
   <button className="primary full auth-submit" type="submit" disabled={busy||!configured}>{busy?<><LoaderCircle size={16} className="auth-spinner"/>{mode==='signup'?'Creating account…':mode==='forgot'?'Sending reset link…':mode==='recovery'?'Updating password…':'Signing in…'}</>:mode==='signup'?'Create account':mode==='forgot'?'Send reset link':mode==='recovery'?'Update password':'Sign in'}{!busy&&<ArrowRight size={16}/>}</button>
  </form>
  {!configured&&<div className="auth-feedback error" role="status">Cloud sign-in is not configured on this deployment. Your local projects remain available.</div>}
  {mode==='forgot'&&<button className="auth-back" onClick={()=>{setMode('signin');setError('');setMessage('')}}><ArrowLeft size={14}/>Back to sign in</button>}
  {mode==='recovery'&&<button className="auth-back" onClick={()=>{onRecoveryComplete();setMode('signin');setError('');setMessage('')}}><ArrowLeft size={14}/>Cancel password reset</button>}
  {mode==='signup'&&<small className="auth-privacy"><ShieldCheck size={13}/>Your work is private to you and your assigned classroom.</small>}
 </div>
}
function GoogleMark(){return <svg className="google-mark" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 38.05 46.98 31.92 46.98 24.55z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.88.93 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.45-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>}
