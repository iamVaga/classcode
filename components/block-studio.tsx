'use client';

import Link from 'next/link';
import {ArrowLeft, Blocks, Check, Play, Square} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {highlight} from '@/lib/highlight';
import TurtleCanvas, {type TurtleCommand} from './turtle-canvas';

export default function BlockStudio() {
  const host = useRef<HTMLDivElement>(null);
  const worker = useRef<Worker | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [running, setRunning] = useState(false);
  const [drawing, setDrawing] = useState<TurtleCommand[]>([]);
  const [output, setOutput] = useState<string[]>([]);
  const [status, setStatus] = useState('Ready to run');
  const [view, setView] = useState<'Code' | 'Turtle' | 'Output'>('Code');

  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;
    import('@/lib/python-blocks').then(({mountPythonBlocks}) => {
      if (cancelled || !host.current) return;
      dispose = mountPythonBlocks(host.current, (python, failed) => {
        setCode(python);
        setSaveError(failed);
      });
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoadError(true);
    });
    return () => {
      cancelled = true;
      dispose?.();
      clearTimeout(timer.current);
      worker.current?.terminate();
      worker.current = null;
    };
  }, []);

  function stop(message: string) {
    worker.current?.terminate();
    worker.current = null;
    clearTimeout(timer.current);
    setRunning(false);
    setStatus(message);
  }

  function run() {
    if (worker.current || !code.trim()) return;
    const active = new Worker('/python-worker.js');
    worker.current = active;
    setDrawing([]);
    setOutput([]);
    setRunning(true);
    setView(code.startsWith('import turtle\n') ? 'Turtle' : 'Output');
    setStatus('Starting Python…');
    timer.current = setTimeout(() => stop('Python took too long to load. Try again.'), 90000);
    active.onmessage = ({data}) => {
      if (worker.current !== active) return;
      if (data.phase) setStatus(String(data.phase));
      if (data.ready) {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => stop('Stopped after 30 seconds.'), 30000);
        setStatus('Running…');
      }
      if (Array.isArray(data.turtle)) {
        setDrawing(previous => [...previous, ...data.turtle.slice(0, 25000 - previous.length)]);
      }
      if (data.text) setOutput(previous => [...previous.slice(-199), String(data.text).slice(0, 5000)]);
      if (data.done) {
        if (data.error) setView('Output');
        stop(data.error ? 'Check the message below and try again.' : 'Run finished.');
      }
    };
    active.onerror = () => stop('Python could not load. Check your connection and try again.');
    active.postMessage({files: {'main.py': code}, code, inputs: []});
  }

  return (
    <main className="block-studio">
      <header className="block-toolbar">
        <Link href="/" aria-label="Back to ClassCode"><ArrowLeft size={18}/></Link>
        <h1><Blocks size={18} aria-hidden="true"/> PyBlock</h1>
        <div className="block-actions">
          {!loading && <span className="block-save" role="status">{!saveError && <Check size={15} aria-hidden="true"/>}{saveError ? 'Could not save blocks' : 'Saved on this device'}</span>}
          {running
            ? <button type="button" className="studio-primary" onClick={() => stop('Run stopped.')}><Square size={16}/> Stop</button>
            : <button type="button" className="studio-primary" disabled={loading || !code.trim()} onClick={run}><Play size={16}/> Run</button>}
        </div>
      </header>
      <div className="block-layout">
        <section className="block-editor-shell" aria-label="Block editor">
          <div className="block-editor-host" ref={host}/>
          {loading && <p role="status" className="block-loading">{loadError ? 'The editor could not load. Refresh to try again.' : 'Loading blocks…'}</p>}
        </section>
        <aside className="block-results" aria-label="Program results">
          <div className="block-views" role="group" aria-label="Result view">
            {(['Code', 'Turtle', 'Output'] as const).map(name => (
              <button type="button" key={name} aria-pressed={name === view} onClick={() => setView(name)}>{name}</button>
            ))}
          </div>
          {view === 'Code' && (
            <pre className="block-source" tabIndex={0} aria-label="Generated Python">
              <code>{(code.trimEnd() || '# Snap blocks together to start').split('\n').map((line, index) => (
                <span className="block-code-line" key={index}><span className="block-line-number" aria-hidden="true">{index + 1}</span>{highlight(line).map((token, i) => <span key={i} className={`block-token-${token.kind}`}>{token.text}</span>)}</span>
              ))}</code>
            </pre>
          )}
          {view === 'Turtle' && (drawing.length > 0
            ? <TurtleCanvas commands={drawing}/>
            : <p className="block-empty">Press Run to draw with Turtle.</p>)}
          {view === 'Output' && <pre className="block-console" tabIndex={0} aria-label="Python output">{output.join('\n') || 'Printed text appears here.'}</pre>}
          <p className="block-status" role="status">{status}</p>
        </aside>
      </div>
    </main>
  );
}
