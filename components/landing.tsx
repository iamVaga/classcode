'use client';

import {useEffect, useRef, useState} from 'react';
import {ArrowDown, ArrowRight, Check, ChevronDown, Code2, GraduationCap, LockKeyhole, Moon, MousePointer2, ShieldCheck, Sun, Zap} from 'lucide-react';
import BrandMark from './brand-mark';
import CodePreview from './code-preview';
import SnippetPlayground from './snippet-playground';
import AccessibilityMenu from './accessibility-menu';
import {starters, type Starter} from '@/lib/starters';
import './landing.css';

type Props = {
  fontClass: string;
  ready: boolean;
  user: string;
  dark: boolean;
  onTheme: () => void;
  onModal: (mode: string) => void;
  onPage: (page: string) => void;
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

const questions = [
  {title:'Does ClassCode work on Chromebooks?', answer:<>ClassCode runs in the browser. Try the project types your class will use on a managed Chromebook to confirm that your school’s network allows their runtimes. <a href="/school-it">Check browser and network requirements</a>.</>},
  {title:'What does school IT need to allow?', answer:<>Python downloads its runtime on first use. Live sessions use a secure WebSocket, and Java, C++ and C use the Wandbox compiler service. <a href="/school-it">Open the school network guide</a> for exact hosts.</>},
  {title:'Do students need accounts?', answer:<>Students can create guest projects without an account and save them in the current browser. Accounts are needed for cloud storage and classroom live sessions.</>},
  {title:'What does it cost?', answer:<>You can open a guest project without an account. School pricing hasn’t been published. See <a href="/about">ClassCode’s operator and contact information</a>.</>},
  {title:'Where does student work go?', answer:<>Guest projects stay in browser storage. Account projects are stored in the cloud, and students choose when to start live sharing with an assigned teacher. See the <a href="/privacy">privacy notice</a> for storage and external services.</>},
];

export default function Landing({fontClass, ready, user, dark, onTheme, onModal, onPage, onTemplate}: Props) {
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
          <a href="#live-join">For teachers</a>
          <a href="#tracks">Coding tracks</a>
          <a href="#for-schools">For schools</a>
        </nav>
        <div className="lp-nav-actions">
          <AccessibilityMenu/>
          <button className="lp-icon-button" aria-label={dark ? 'Use light theme' : 'Use dark theme'} onClick={onTheme}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
          <button className="lp-button lp-quiet" onClick={() => onModal('account')}>{user ? 'Account' : 'Sign in'}</button>
          <button className="lp-button lp-nav-workspace" onClick={() => onPage('Overview')}>Workspace <ArrowRight size={17}/></button>
        </div>
      </div>
    </header>

    <main id="landing-content" tabIndex={-1}>
      <section className="lp-wrap lp-hero">
        <div className="lp-hero-copy">
          <div className="lp-eyebrow"><Code2 size={18}/> The classroom coding workspace</div>
          <h1><span>Students build</span>{' '}<span>real projects</span>{' '}<span>with live help</span>{' '}<span>from teachers.</span></h1>
          <p>Code in your browser with Python, Turtle, Web, Java, C++ and C. Start with PyBlock or make a game in Pygame Studio.</p>
          <div className="lp-actions">
            <button className="lp-button lp-primary" onClick={() => onModal('create')}>Start a project <ArrowRight size={19}/></button>
            <a className="lp-button" href="#live-join">Teacher demo <ArrowDown size={18}/></a>
          </div>
          <small>{user ? 'Open your workspace to pick up where you left off.' : 'Start as a guest. No account needed.'}</small>
        </div>
        <SnippetPlayground onOpen={onTemplate} landing disabled={!ready}/>
      </section>

      <div className="lp-wrap">
        <ul className="lp-trust" aria-label="ClassCode at a glance">
          <li><Zap size={18}/> Runs in your browser</li>
          <li><LockKeyhole size={18}/> Private by default</li>
          <li><GraduationCap size={20}/> Student controlled sharing</li>
        </ul>
      </div>

      <section id="live-join" className="lp-wrap lp-section lp-split" aria-labelledby="lp-teacher-title">
        <div data-lp-reveal>
          <div className="lp-eyebrow"><GraduationCap size={20}/> Live classroom</div>
          <h2 id="lp-teacher-title">Join while the code is still being written.</h2>
          <p>A student starts sharing with their assigned teacher. The teacher sees the draft as it changes and can suggest a fix for the student to accept or dismiss.</p>
          <button className="lp-button" onClick={() => user ? onPage('My students') : onModal('teacher-signup')}>{user ? 'Open my classroom' : 'Create a teacher account'} <ArrowRight size={18}/></button>
        </div>
        <TeacherDemo/>
      </section>

      <section id="hint-ladder" className="lp-band">
        <div className="lp-wrap lp-section lp-split lp-hint-layout">
          <HintDemo/>
          <div data-lp-reveal className="lp-hint-copy">
            <div className="lp-eyebrow"><Zap size={18}/> Hint ladder</div>
            <h2>Get a clue before you get the fix.</h2>
            <p>Read a nudge, zoom in on the error, or reveal a fix to try. Students choose how much help they need and can still read the original error.</p>
          </div>
        </div>
      </section>

      <section id="tracks" className="lp-wrap lp-section">
        <div className="lp-section-heading" data-lp-reveal>
          <div className="lp-eyebrow"><Code2 size={18}/> Coding tracks</div>
          <h2>From a Turtle drawing to your first game.</h2>
          <p>Try a working example and make it your own in the editor.</p>
        </div>
        <div className="lp-tracks">
          {tracks.map(track => {
            const preview = <><span className="lp-track-preview"><span>{track.file}</span><CodePreview code={track.code}/></span><span className="lp-track-body"><strong>{track.name}</strong><span>{track.note}</span><span className="lp-track-action">{'href' in track ? 'Open studio' : 'Open in editor'} <ArrowRight size={16}/></span></span></>;
            return <div key={track.id} className={'lp-track-item lp-track-' + track.id} data-lp-reveal>
              {'href' in track ? <a className="lp-track" href={track.href}>{preview}</a> :
                <button className="lp-track" disabled={!ready} onClick={() => {
                  const starter = starters.find(item => item.id === track.id);
                  if (starter) onTemplate(starter);
                }}>{preview}</button>}
            </div>;
          })}
        </div>
        {/* TODO: Add verified classroom metrics, approved teacher quotes and anonymized student projects when supplied. */}
      </section>

      <section className="lp-wrap lp-section lp-steps-section" aria-labelledby="lp-steps-title">
        <h2 id="lp-steps-title" data-lp-reveal>From example to classroom feedback.</h2>
        <ol className="lp-steps">
          <li data-lp-reveal><Code2 size={24}/><h3>Open a starter</h3><p>Choose a drawing, webpage or program you can run right away.</p></li>
          <li data-lp-reveal><Zap size={24}/><h3>Change it and run it</h3><p>Edit a line, see what changed, and ask for a hint if you get stuck.</p></li>
          <li data-lp-reveal><GraduationCap size={24}/><h3>Share a live draft</h3><p>In a linked classroom, invite your teacher to follow along and suggest a fix.</p></li>
        </ol>
      </section>

      <section id="for-schools" className="lp-wrap lp-section lp-school">
        <div className="lp-school-panel" data-lp-reveal>
          <div>
            <div className="lp-eyebrow"><ShieldCheck size={20}/> For schools</div>
            <h2>Student projects start private.</h2>
            <p>Check the sharing rules and network requirements before rolling out ClassCode in your classroom.</p>
            <div className="lp-actions">
              <a className="lp-button" href="/safety">Safety and sharing <ArrowRight size={17}/></a>
              <a className="lp-button" href="/school-it">School IT guide <ArrowRight size={17}/></a>
              <a className="lp-button" href="#school-faq">School FAQ <ArrowDown size={17}/></a>
            </div>
          </div>
          <ul>
            <li><Check size={20}/><div><strong>Private projects</strong><p>Students’ projects don’t appear in a public gallery.</p></div></li>
            <li><Check size={20}/><div><strong>Sharing students control</strong><p>Only assigned teachers can join a live draft. The student can end sharing at any time.</p></div></li>
            <li><Check size={20}/><div><strong>Guest work stays on the device</strong><p>Export guest projects before clearing browser storage or switching devices.</p></div></li>
          </ul>
        </div>
      </section>

      <section id="school-faq" className="lp-wrap lp-section lp-faq" aria-labelledby="lp-faq-title">
        <h2 id="lp-faq-title" data-lp-reveal>Classroom setup questions</h2>
        <div>{questions.map(question => <details key={question.title}><summary>{question.title}<ChevronDown size={20}/></summary><p>{question.answer}</p></details>)}</div>
      </section>

      <section className="lp-wrap lp-section">
        <div className="lp-final" data-lp-reveal>
          <h2>Write your first line in ClassCode.</h2>
          <p>Open a browser project or set up an account to teach.</p>
          <div className="lp-actions">
            <button className="lp-button lp-primary" onClick={() => onModal('create')}>Start a project <ArrowRight size={19}/></button>
            <a className="lp-button" href="/teacher-resources">Browse teacher resources <ArrowRight size={18}/></a>
          </div>
        </div>
      </section>
    </main>

    <footer className="lp-wrap lp-footer">
      <a className="lp-logo" href="#classcode"><BrandMark size={26}/>ClassCode</a>
      <nav aria-label="Product and policy links">
        <a href="/safety">Safety</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/about">About and contact</a><a href="/school-it">School IT</a><a href="/teacher-resources">Teacher resources</a>
      </nav>
    </footer>
  </div>;
}

function TeacherDemo() {
  const [stage, setStage] = useState<'ready' | 'joined' | 'accepted' | 'dismissed'>('ready');
  const joinButton = useRef<HTMLButtonElement>(null);
  const acceptButton = useRef<HTMLButtonElement>(null);
  const isJoined = stage === 'joined';
  const isDone = stage === 'accepted' || stage === 'dismissed';
  useEffect(() => {
    if (isJoined) acceptButton.current?.focus({preventScroll:true});
    if (isDone) joinButton.current?.focus({preventScroll:true});
  }, [isJoined, isDone]);
  const status = {
    ready:'Student is sharing',
    joined:'Teacher joined',
    accepted:'Suggestion accepted. The code now turns left.',
    dismissed:'Suggestion dismissed. The student’s code is unchanged.',
  }[stage];
  return <div className="lp-demo" data-lp-reveal>
    <div className="lp-demo-header"><Code2 size={17}/><strong>square.py</strong><span>Interactive demo</span></div>
    <div className="lp-demo-code">
      <pre><CodePreview code={'for side in range(4):\n    turtle.forward(100)'}/>{'\n'}<span key={stage === 'accepted' ? 'fixed' : 'draft'} className={stage === 'accepted' ? 'lp-line-good' : 'lp-line-warn'}><CodePreview code={stage === 'accepted' ? '    turtle.left(90)' : '    turtle.left(45)'}/></span></pre>
      {isJoined && <span className="lp-pointer" aria-hidden="true"><MousePointer2 size={17} fill="currentColor"/> Teacher</span>}
    </div>
    <div className="lp-demo-interaction">
      <div className="lp-demo-status" role="status"><i/>{status}</div>
      {isJoined ? <div className="lp-suggestion">
        <strong>Teacher suggestion</strong>
        <p>Try a 90° turn to make each corner square.</p>
        <div className="lp-actions">
          <button ref={acceptButton} className="lp-button lp-primary" onClick={() => setStage('accepted')}><Check size={17}/> Accept</button>
          <button className="lp-button" onClick={() => setStage('dismissed')}>Dismiss</button>
        </div>
      </div> : <button ref={joinButton} className="lp-button" onClick={() => setStage(isDone ? 'ready' : 'joined')}>{isDone ? 'Reset teacher demo' : 'Join as teacher'} <ArrowRight size={17}/></button>}
    </div>
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
    <div className="lp-demo-header"><Code2 size={17}/><strong>sum.py</strong><span>Interactive demo</span></div>
    <div className="lp-demo-code">
      <pre><CodePreview code={'total = 0\nfor number in range(5):\n    total += number'}/>{'\n'}<span key={step} className={step === 3 ? 'lp-line-good' : step >= 2 ? 'lp-line-warn' : ''}><CodePreview code={step === 3 ? 'print(total)' : 'print(totla)'}/></span></pre>
    </div>
    <div className="lp-demo-interaction">
      <div className="lp-progress" aria-hidden="true">{hintSteps.map((hint, index) => <i key={hint} className={step > index ? 'lp-progress-done' : ''}/>)}</div>
      <div className="lp-hint-feedback" role="status">
        <strong>{step === 0 ? 'NameError' : `Hint ${step} of 3`}</strong>
        <p key={step}>{step === 0 ? 'Python stopped on the last line.' : hintSteps[step - 1]}</p>
      </div>
      <button className="lp-button" onClick={() => setStep(current => (current + 1) % 4)}>{['Show a hint', 'Show next clue', 'Reveal the fix', 'Reset hint demo'][step]} <ArrowRight size={17}/></button>
    </div>
  </div>;
}
