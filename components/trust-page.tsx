import Link from 'next/link';
import {ArrowLeft} from 'lucide-react';
import type {ReactNode} from 'react';

type Section={title:string;body:ReactNode};
export default function TrustPage({kicker,title,intro,sections}: {kicker:string;title:string;intro:string;sections:Section[]}){
 return <main className="studio-main"><article className="trust-page">
  <Link className="trust-breadcrumb" href="/"><ArrowLeft size={15}/> Back to ClassCode</Link>
  <header><span className="studio-kicker">{kicker}</span><h1>{title}</h1><p>{intro}</p></header>
  <aside className="trust-review-note"><strong>Owner review required.</strong> This page describes the current codebase and is a working draft, not legal advice or a statement that ClassCode complies with a particular law. Confirm every marked TODO and have the final policy reviewed before onboarding students.</aside>
  <div className="trust-sections">{sections.map(section=><section className="trust-section" key={section.title}><h2>{section.title}</h2>{section.body}</section>)}</div>
  <footer><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/safety">Safety</Link><Link href="/about">About</Link></footer>
 </article></main>
}
