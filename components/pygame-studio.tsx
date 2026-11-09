'use client';

import Link from 'next/link';
import {useEffect, useRef, useState, type KeyboardEvent} from 'react';
import {ArrowLeft, Play, Square, Upload, X} from 'lucide-react';

const starter = `import asyncio
from pathlib import Path
import pygame

async def main():
    screen = pygame.display.set_mode((480, 320))
    player = pygame.Rect(220, 140, 40, 40)
    sprite_path = Path("assets/player.png")
    sprite = pygame.image.load(str(sprite_path)) if sprite_path.exists() else None
    if sprite:
        sprite = pygame.transform.scale(sprite, player.size)

    while True:
        keys = pygame.key.get_pressed()
        player.x += 4 * (keys[pygame.K_RIGHT] - keys[pygame.K_LEFT])
        player.y += 4 * (keys[pygame.K_DOWN] - keys[pygame.K_UP])
        player.clamp_ip(screen.get_rect())

        screen.fill("#172436")
        if sprite:
            screen.blit(sprite, player)
        else:
            pygame.draw.rect(screen, "#5eead4", player, border_radius=8)
        pygame.display.flip()
        await asyncio.sleep(1 / 60)

await main()
`;
const codeKey = 'classcode-pygame-code-v1';
const arrowKeys: Record<string, number> = {
  ArrowRight: 1073741903, ArrowLeft: 1073741904, ArrowDown: 1073741905, ArrowUp: 1073741906,
};
const maxAssets = 24 * 1024 * 1024;

export default function PygameStudio() {
  const [code, setCode] = useState(starter);
  const [assets, setAssets] = useState<File[]>([]);
  const [assetError, setAssetError] = useState('');
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('Ready to run');
  const [output, setOutput] = useState<string[]>([]);
  const worker = useRef<Worker | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(codeKey);
      if (saved !== null) setCode(saved);
    } catch {}
    return () => {
      clearTimeout(timer.current);
      worker.current?.terminate();
      worker.current = null;
    };
  }, []);

  function stop(message: string) {
    clearTimeout(timer.current);
    worker.current?.terminate();
    worker.current = null;
    setRunning(false);
    setStatus(message);
  }

  function sendKey(event: KeyboardEvent, down: boolean) {
    const key = arrowKeys[event.key] ?? (event.key.length === 1 ? event.key.toLowerCase().charCodeAt(0) : undefined);
    if (!worker.current || key === undefined) return;
    event.preventDefault();
    worker.current.postMessage({type: 'key', key, down});
  }

  async function run() {
    if (worker.current || !code.trim()) return;
    const active = new Worker('/pygame-worker.js');
    worker.current = active;
    setRunning(true);
    setOutput([]);
    setStatus('Preparing game…');
    const target = canvas.current;
    if (target) {
      target.getContext('2d')?.clearRect(0, 0, target.width, target.height);
      target.focus();
    }
    timer.current = setTimeout(() => stop('The game did not render. Check your code and try again.'), 90000);
    active.onmessage = ({data}) => {
      if (worker.current !== active) return;
      if (data.status) setStatus(data.status);
      if (data.ready) setStatus('Starting game…');
      if (data.text) setOutput(previous => [...previous.slice(-99), String(data.text).slice(0, 5000)]);
      if (data.frame && target) {
        clearTimeout(timer.current);
        if (target.width !== data.width) target.width = data.width;
        if (target.height !== data.height) target.height = data.height;
        target.getContext('2d')?.putImageData(new ImageData(data.frame, data.width, data.height), 0, 0);
        setStatus('Game running');
      }
      if (data.error) setOutput(previous => [...previous, data.error]);
      if (data.done) stop(data.error ? 'Check the output for the error.' : 'Game finished');
    };
    active.onerror = () => stop('Pygame could not load. Check your connection and retry.');

    try {
      const files = await Promise.all(assets.map(async file => ({name: file.name, bytes: await file.arrayBuffer()})));
      if (worker.current === active) active.postMessage({type: 'run', code, assets: files}, files.map(file => file.bytes));
    } catch {
      if (worker.current === active) stop('Could not read a project asset. Remove it and try again.');
    }
  }

  function addAssets(files: File[]) {
    const merged = new Map(assets.map(file => [file.name, file]));
    for (const file of files) merged.set(file.name, file);
    const next = [...merged.values()];
    if (next.reduce((total, file) => total + file.size, 0) > maxAssets) {
      setAssetError('Keep project assets below 24 MB in total.');
      return;
    }
    setAssetError('');
    setAssets(next);
  }

  return (
    <main className="game-studio">
      <header className="game-toolbar">
        <Link href="/" aria-label="Back to ClassCode"><ArrowLeft size={20}/></Link>
        <h1>Pygame Studio</h1>
        {running
          ? <button type="button" className="studio-primary" onClick={() => stop('Game stopped')}><Square size={16}/> Stop</button>
          : <button type="button" className="studio-primary" disabled={!code.trim()} onClick={() => void run()}><Play size={16}/> Run</button>}
      </header>
      <div className="game-layout">
        <section className="game-panel game-code">
          <h2><label htmlFor="game-source">main.py</label></h2>
          <textarea id="game-source" spellCheck={false} value={code} onChange={event => {
            setCode(event.target.value);
            try { localStorage.setItem(codeKey, event.target.value); } catch {}
          }}/>
        </section>
        <div className="game-results">
          <section className="game-panel">
            <h2>Game preview</h2>
            <canvas ref={canvas} width={480} height={320} tabIndex={0} aria-label="Game preview. Use arrow keys to move the starter player."
              onKeyDown={event => sendKey(event, true)} onKeyUp={event => sendKey(event, false)}
              onBlur={() => worker.current?.postMessage({type: 'blur'})}/>
            <p role="status">{status}</p>
          </section>
          <section className="game-panel">
            <h2>Assets</h2>
            <p>Upload a picture named <code>player.png</code> to use it in the starter. Files are available under <code>assets/</code> for this session.</p>
            <label className="game-upload"><Upload size={16}/> Upload assets
              <input type="file" multiple onChange={event => {
                addAssets(Array.from(event.target.files ?? []));
                event.target.value = '';
              }}/>
            </label>
            {assetError && <p role="alert">{assetError}</p>}
            {assets.length > 0 && <ul>{assets.map(file => <li key={file.name}>
              <code>assets/{file.name}</code>
              <button type="button" aria-label={`Remove ${file.name}`} onClick={() => {
                setAssets(previous => previous.filter(asset => asset.name !== file.name));
                setAssetError('');
              }}><X size={16}/></button>
            </li>)}</ul>}
          </section>
          {output.length > 0 && <section className="game-panel" aria-label="Python output">
            <h2>Output</h2><pre tabIndex={0}>{output.join('\n')}</pre>
          </section>}
        </div>
      </div>
    </main>
  );
}
