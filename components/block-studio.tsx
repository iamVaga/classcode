'use client';

import Link from 'next/link';
import {ArrowLeft, Play, Square} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
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
      if (data.done) stop(data.error ? 'Check the message below and try again.' : 'Run finished.');
    };
    active.onerror = () => stop('Python could not load. Check your connection and try again.');
    active.postMessage({files: {'main.py': code}, code, inputs: []});
  }

  return (
    <main className="block-studio">
      <header className="block-toolbar">
        <Link href="/" aria-label="Back to ClassCode"><ArrowLeft size={20}/> ClassCode</Link>
        <h1>PyBlock</h1>
        <div className="block-actions">
          <span role="status">{loading ? '' : saveError ? 'Could not save blocks' : 'Saved on this device'}</span>
          {running
            ? <button type="button" className="studio-primary" onClick={() => stop('Run stopped.')}><Square size={16}/> Stop</button>
            : <button type="button" className="studio-primary" disabled={loading || !code.trim()} onClick={run}><Play size={16}/> Run</button>}
        </div>
      </header>
      <p className="block-instruction">Run the starter to draw a square. Then change the steps or snap on another block.</p>
      <div className="block-layout">
        <section className="block-panel" aria-label="Block editor">
          <h2>Blocks</h2>
          <div className="block-editor-shell">
            <div className="block-editor-host" ref={host}/>
            {loading && <p role="status" className="block-loading">{loadError ? 'The editor could not load. Refresh to try again.' : 'Loading blocks…'}</p>}
          </div>
        </section>
        <div className="block-results">
          <section className="block-panel" aria-label="Turtle preview">
            <h2>Turtle preview</h2>
            {drawing.length > 0 ? <TurtleCanvas commands={drawing}/> : <p className="block-empty">Your drawing will appear here.</p>}
          </section>
          <section className="block-panel" aria-label="Python output">
            <h2>Output</h2>
            <p className="block-empty" role="status">{status}</p>
            {output.length > 0 && <pre tabIndex={0}>{output.join('\n')}</pre>}
          </section>
          <details className="block-panel block-source">
            <summary>Generated Python</summary>
            <pre tabIndex={0}>{code || '# Add a block to generate Python'}</pre>
          </details>
        </div>
      </div>
    </main>
  );
}
