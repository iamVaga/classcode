'use client';

import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {ArrowRight, Moon, Sun} from 'lucide-react';
import BrandMark from './brand-mark';
import CodePreview from './code-preview';
import SnippetPlayground from './snippet-playground';
import {starters, type Starter} from '@/lib/starters';

type Props = {
  fontClass: string;
  ready: boolean;
  user: string;
  dark: boolean;
  onTheme: () => void;
  onModal: (mode: string) => void;
  onOpenWorkspace: () => void;
  onTemplate: (starter: Starter) => void;
};

const tracks = [
  {name:'Python', id:'python', file:'main.py', code:'print("Hello, Fox!")', note:'Learn variables, loops and functions.'},
  {name:'Turtle', id:'turtle', file:'artwork.py', code:'pen.forward(100)', note:'Turn loops into drawings.'},
  {name:'Web', id:'web', file:'index.html', code:'<h1>My first site</h1>', note:'Make a page with HTML and CSS.'},
  {name:'PyBlock', id:'blocks', file:'Blocks → Python', code:'repeat 4 → turn 90°', note:'Snap together blocks and see the Python.', href:'/blocks'},
  {name:'Pygame Studio', id:'pygame', file:'game.py', code:'player.x += speed', note:'Write a game and add your own sprites.', href:'/pygame'},
  {name:'Java', id:'java', file:'Main.java', code:'System.out.println(42);', note:'Practice classes and typed programs.'},
  {name:'C++', id:'cpp', file:'main.cpp', code:'std::cout << score;', note:'Build small programs with the STL.'},
  {name:'C', id:'c', file:'main.c', code:'printf("%d", score);', note:'Practice functions, arrays and I/O.'},
] as const;

export default function Landing({fontClass, ready, user, dark, onTheme, onModal, onOpenWorkspace, onTemplate}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const update = () => header.current?.classList.toggle('lp-scrolled', window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, {passive:true});
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('lp-revealed');
        observer?.unobserve(entry.target);
      }
    }, {threshold:0.12});
    root.current?.querySelectorAll('[data-lp-reveal]').forEach(element => observer?.observe(element));
    return () => {
      window.removeEventListener('scroll', update);
      observer?.disconnect();
    };
  }, []);

  return <div className={'lp ' + fontClass} ref={root} id="classcode">
    <a className="lp-skip lp-button" href="#landing-content">Skip to content</a>
    <header className="lp-nav" ref={header}>
      <div className="lp-wrap lp-nav-inner">
        <a className="lp-logo" href="#classcode"><BrandMark size={31}/>ClassCode</a>
        <nav aria-label="Main navigation">
          <a href="#tracks">What can I make?</a>
          <a href="#hint-ladder">Live help</a>
          <a href="#for-schools">For schools</a>
        </nav>
        <div className="lp-nav-actions">
          <Link className="lp-button lp-quiet" href="/session">Join session</Link>
          <button className="lp-button lp-theme-toggle" aria-label={dark?'Light mode':'Dark mode'} onClick={onTheme}>{dark?<Sun size={17}/>:<Moon size={17}/>}<span>{dark?'Light mode':'Dark mode'}</span></button>
          <button className="lp-button lp-nav-workspace" onClick={onOpenWorkspace}>Open workspace</button>
        </div>
      </div>
    </header>

    <main id="landing-content" tabIndex={-1}>
      <section className="lp-wrap lp-hero">
        <div className="lp-hero-copy">
          <div className="lp-eyebrow">Code right in your browser</div>
          <h1><span>Make real</span><span>projects. <em>Get</em></span><span><em>help from your</em></span><span><em>teacher</em> while</span><span>you code.</span></h1>
          <p>Draw with Turtle, build a webpage, snap blocks together or make your own game. Stuck? Ask for a hint, or invite your teacher to jump in.</p>
          <div className="lp-actions">
            <button className="lp-button lp-primary" onClick={() => onModal('create')}>Start a project <ArrowRight size={19}/></button>
            <a className="lp-button" href="#hint-ladder">See live help</a>
          </div>
          <ul className="lp-trust" aria-label="ClassCode at a glance">
            <li>{user ? 'Open your workspace to pick up where you left off.' : 'No account needed to start'}</li>
            <li>Runs in your browser</li>
            <li>Your projects are private</li>
          </ul>
        </div>
        <SnippetPlayground onOpen={onTemplate} landing disabled={!ready}/>
      </section>

      <section id="tracks" className="lp-wrap lp-section">
        <div className="lp-section-heading" data-lp-reveal>
          <div className="lp-eyebrow">What can I make?</div>
          <h2>From a Turtle drawing to your first game.</h2>
          <p>Pick a starter, change it and press Run. That is how every coder begins.</p>
        </div>
        <div className="lp-tracks">
          {tracks.map(track => {
            const preview = <span className="lp-track-body">
              <strong>{track.name}</strong>
              <span>{track.note}</span>
              <span className="lp-track-preview"><CodePreview code={track.code}/></span>
              <span className="lp-track-action">{'href' in track ? 'Open studio' : 'Open in editor'}</span>
            </span>;
            return <div key={track.id} className={'lp-track-item lp-track-' + track.id} data-lp-reveal>
              {'href' in track ? <a className="lp-track" href={track.href}>{preview}</a> :
                <button className="lp-track" disabled={!ready} onClick={() => {
                  const starter = starters.find(item => item.id === track.id);
                  if (starter) onTemplate(starter);
                }}>{preview}</button>}
            </div>;
          })}
        </div>
      </section>

      <section id="hint-ladder" className="lp-band">
        <div className="lp-wrap lp-section lp-split lp-hint-layout">
          <div data-lp-reveal className="lp-hint-copy">
            <div className="lp-eyebrow">Hints that help you think</div>
            <h2>Get a clue before you get the answer.</h2>
            <p>Take a small nudge, zoom in on the problem, or peek at a fix to try. You decide how much help you want, and you can still read the original error.</p>
            <p><strong>Want a person?</strong> Share your draft and your assigned teacher can watch it change live and suggest a fix. You choose to accept it or say no thanks, and you can stop sharing any time.</p>
          </div>
          <HintDemo/>
        </div>
      </section>

      <section className="lp-wrap lp-section lp-steps-section" aria-labelledby="lp-steps-title">
        <h2 id="lp-steps-title" data-lp-reveal>Three steps to your first project.</h2>
        <ol className="lp-steps">
          <li data-lp-reveal><span className="lp-step-number">1</span><h3>Open a starter</h3><p>Choose a drawing, webpage or program you can run right away.</p></li>
          <li data-lp-reveal><span className="lp-step-number">2</span><h3>Change it and run it</h3><p>Edit a line, see what changed, and ask for a hint if you get stuck.</p></li>
          <li data-lp-reveal><span className="lp-step-number">3</span><h3>Share a live draft</h3><p>In a linked classroom, invite your teacher to follow along and suggest a fix.</p></li>
        </ol>
      </section>

      <section id="for-schools" className="lp-wrap lp-section lp-school">
        <div className="lp-school-panel" data-lp-reveal>
          <div>
            <div className="lp-eyebrow">For teachers and parents</div>
            <h2>Student projects start private.</h2>
            <p>Check the sharing rules and network needs before you use ClassCode in a classroom.</p>
          </div>
          <ul>
            <li><div><strong>Private projects</strong><p>Student projects do not appear in a public gallery.</p></div></li>
            <li><div><strong>Sharing students control</strong><p>Only assigned teachers can join a classroom draft. The student can end sharing at any time.</p></div></li>
            <li><div><strong>Guest work stays on the device</strong><p>Export guest projects before clearing browser storage or switching devices.</p></div></li>
          </ul>
          <div className="lp-actions">
            <Link className="lp-button" href="/safety">Safety and sharing</Link>
            <Link className="lp-button" href="/school-it">School IT guide</Link>
            <Link className="lp-button" href="/teacher-resources">Teacher resources</Link>
          </div>
        </div>
      </section>

      <section className="lp-wrap lp-section">
        <div className="lp-final" data-lp-reveal>
          <h2>Ready to write your first line?</h2>
          <p>Jump in as a guest. There is nothing to sign up for.</p>
          <div className="lp-actions">
            <button className="lp-button lp-primary" onClick={() => onModal('create')}>Start a project</button>
          </div>
        </div>
      </section>
    </main>

    <footer className="lp-wrap lp-footer">
      <a className="lp-logo" href="#classcode">ClassCode</a>
      <nav aria-label="Product and policy links">
        <a href="/safety">Safety</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/about">About and contact</a>
      </nav>
    </footer>
  </div>;
}

const hintSteps = [
  'Python doesn’t recognize a name on the last line.',
  'Compare totla on line 4 with total on line 1.',
  'Change totla to total. The program prints 10.',
];

function HintDemo() {
  const [step, setStep] = useState(0);
  return <div className="lp-demo lp-hint-demo" data-lp-reveal>
    <div className="lp-demo-header"><strong>sum.py</strong><span className="teacher-watching">Your teacher is watching</span></div>
    <div className="lp-demo-code">
      <pre><CodePreview code={'total = 0\nfor number in range(5):\n    total += number'}/>{'\n'}<span key={step} className={step === 3 ? 'lp-line-good' : step > 0 ? 'lp-line-warn' : ''}><CodePreview code={step === 3 ? 'print(total)' : 'print(totla)'}/></span></pre>
    </div>
    <div className="lp-demo-interaction">
      <div className="friendly-error" role="status">
        <strong>{step === 0 ? 'Oops! Python got stuck on line 4.' : `Hint ${step} of 3`}</strong>
        <span>{step === 0 ? 'Something is not right. Ask for a hint when you are ready.' : hintSteps[step - 1]}</span>
      </div>
      <div className="hint-actions" aria-label="Choose how much help to see">
        {['A nudge','Zoom in','Try a fix'].map((label,index)=><button key={label} aria-pressed={step===index+1} onClick={()=>setStep(step===index+1?0:index+1)}>{label}</button>)}
      </div>
    </div>
  </div>;
}
