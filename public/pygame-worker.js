/* global loadPyodide */
const runtimeUrl = 'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/';
const keys = new Set();
let started = false;

self.onmessage = async ({data}) => {
  if (data.type === 'key') {
    if (data.down) keys.add(data.key);
    else keys.delete(data.key);
    return;
  }
  if (data.type === 'blur') {
    keys.clear();
    return;
  }
  if (data.type !== 'run' || started) return;
  started = true;

  try {
    self.postMessage({status: 'Loading Pygame…'});
    importScripts(runtimeUrl + 'pyodide.js');
    const python = await loadPyodide({indexURL: runtimeUrl});
    await python.loadPackage('pygame-ce');
    python.setStdout({batched: text => self.postMessage({text})});
    python.setStderr({batched: text => self.postMessage({text})});
    python.FS.mkdir('assets');
    for (const {name, bytes} of data.assets) {
      if (!name || /[/\\]/.test(name) || name === '.' || name === '..') continue;
      python.FS.writeFile('assets/' + name, new Uint8Array(bytes));
    }

    python.registerJsModule('_classcode_game', {
      pressed: key => keys.has(key),
      present: (width, height, pixels) => {
        const buffer = pixels.getBuffer('u8');
        try {
          const frame = new Uint8ClampedArray(buffer.data);
          self.postMessage({width, height, frame}, [frame.buffer]);
        } finally {
          buffer.release();
        }
      },
    });
    python.runPython(`
import pygame
from _classcode_game import pressed, present

_screen = None

def _set_mode(size, *args, **kwargs):
    global _screen
    width, height = size
    if not (1 <= width <= 800 and 1 <= height <= 600):
        raise ValueError("Choose a game size up to 800 × 600.")
    _screen = pygame.Surface(size)
    return _screen

def _flip(*args):
    if _screen is not None:
        present(*_screen.get_size(), memoryview(pygame.image.tostring(_screen, "RGBA")))

class _BrowserKeys:
    def __getitem__(self, key):
        return pressed(key)

pygame.display.set_mode = _set_mode
pygame.display.get_surface = lambda: _screen
pygame.display.flip = _flip
pygame.display.update = _flip
pygame.display.set_caption = lambda *args: None
pygame.key.get_pressed = _BrowserKeys
`);
    self.postMessage({ready: true});
    const scope = python.toPy({__name__: '__main__', __file__: 'main.py'});
    try {
      await python.runPythonAsync(data.code, {globals: scope});
    } finally {
      scope.destroy();
    }
    self.postMessage({done: true});
  } catch (error) {
    self.postMessage({done: true, error: String(error)});
  }
};
