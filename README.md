# ClassCode

Colorful code previews are available in the interactive Idea Lab, starter cards, full editor, and lightweight Data saver editor. Idea Lab's "Make it yours" creates a project from the displayed example. An optional server-only MongoDB revision-history integration is documented in [MongoDB setup](docs/MONGODB.md); it requires a real `MONGODB_URI` and existing Supabase authentication and project permissions. No MongoDB database is configured or connected in this checkout.

The current interface is ClassCode Studio: a light, education-focused workspace with a searchable starter library, project continuation, a dedicated classroom setup page, and a private notebook. See [the design rationale](docs/DESIGN.md) for the reference research, information architecture and interaction decisions. The earlier Midnight Arcade styling is no longer active.

The coding editor now uses a full-window, Trinket-inspired layout: compact Run toolbar, file tabs, collapsed explorer, 16px default code, resizable 50/50 panes, code-only/output-only views, font controls, light/dark editor toggle, and fullscreen controls. Drag the divider or focus it and use Left/Right; double-click restores equal panes. On phones the split stacks vertically. An original book-and-spark symbol replaces the previous code-bracket logo and favicon. These changes preserve ClassCode's existing runtime capabilities rather than claiming full Trinket feature parity.

A Next.js / React / TypeScript classroom workspace. This is the first implementation, not a completed production SaaS.

## Run

Node 22.17+ recommended. Run `npm install`, `npm run dev`, and open http://localhost:3000. `npm run build`, `npm run typecheck`, `npm run lint`, and `npm test` validate the source. Dependencies are pinned in package-lock.json.

Without credentials the app explicitly runs locally. Projects, notes, and avatar choices are stored in this browser. Sample student cards are labeled illustrative. There is no fake shared classroom backend. Export projects before clearing browser data. Local storage is not a backup.

## Cloud setup

Create a Supabase project, apply `supabase/migrations/001_foundation.sql` in its SQL editor, copy `.env.example` to `.env.local`, and enter the project URL and public anon key. Never put a service-role key in a public variable. Restart Next.js. Enable email authentication and configure the allowed redirect URLs in Supabase. The account dialog supports registration, email confirmation, sign-in, and sign-out. New accounts receive teacher profiles through a database trigger. Cloud projects use authenticated Supabase queries subject to RLS and compare-and-swap version updates.

The schema includes teacher/student relationships, hashed single-use 48-hour invitations, private notes, and activity foundations. `create_invitation()` and `redeem_invitation(raw_token)` are authenticated database RPCs. Classroom now includes invitation creation/redemption, an assigned-student project roster, and teacher read-only access. Apply `002_live_sessions.sql` to enable private student-controlled live draft sharing. See [Live classroom setup](docs/LIVE-CLASSROOM.md). Without Supabase configuration these flows remain visibly unavailable. Students must not be onboarded until the real access flows and database security tests have been exercised in a staging project.

## Working features

- Searchable/filterable project list, create/rename projects, multiple files, file deletion.
- Monaco editor loaded only after opening a project; native editing shortcuts, Ctrl/Cmd+S, Ctrl/Cmd+Enter, Ctrl/Cmd+B.
- Debounced saves with confirmed status, retry, unsaved navigation protection, JSON export, optimistic cloud concurrency protection.
- Sandboxed HTML/CSS/JS preview with responsive widths, auto/manual refresh, fullscreen, console bridge, network-blocking CSP, and no same-origin iframe permission.
- Python lazily loaded in a worker, with stdout/stderr, stop, error feedback, and a 30-second limit including initialization.
- Local avatar picker, themes, private local lesson notes, responsive layouts.

## Runtime limitations and remaining work

### Adaptive performance and motion

The connection control at the bottom left offers Auto, Standard and Data saver, saved per browser. Auto uses `saveData`, effective connection type, estimated downlink and RTT when available; browsers without those hints use Standard until the user chooses Data saver. No speed-test downloads run. Offline status uses the browser's online/offline hints and does not guarantee that a service is reachable.

Data saver opens a plain-text editor without mounting Monaco, uses 900ms web-preview debounce and 1500ms save debounce, and reduces optional animation effects. Standard preview/save debounce is 300/700ms. Full editor loading falls back to editable plain text after 12 seconds, with retry. Existing code remains controlled by project state during mode changes. External Google font loading has been removed. The editor and Python runtime remain lazy-loaded.

Python now reuses its initialized worker across completed runs. Each execution gets a fresh globals dictionary, removes previous project files and reloads project/Turtle modules; imported third-party and standard-library state may persist until Stop or reopening the workspace. Stop and execution timeout terminate the worker. Startup gets a separate 90-second budget (180 seconds in Data saver); code execution is still limited to 30 seconds after initialization. A first Python load requires connectivity; a warmed worker can keep running while the loaded page is offline. There is no service-worker/offline reload guarantee. Cloud save failures stay visible, with another save attempt when the browser reports reconnection.

Microanimations use CSS transform/opacity for short entry, press, hover, active-tab and runtime feedback. Reduced-motion preferences disable animations. No animation library or new remote media was added. Performance improvements are architectural; bandwidth/latency benchmarks across real network conditions have not been measured.

### Browser Turtle and character update

The app now includes an original browser Turtle drawing compatibility module at `public/turtle.py`. Standard `import turtle`, `from turtle import *`, `Turtle()`, and `Screen()` work for common drawing exercises: forward/backward, turns, positions, pen control, circles, colors/RGB, fills, dots, text, multiple turtles, backgrounds, clear, and title. Output is drawn on a canvas through bounded worker message batches (25,000 operations per run). `done()` flushes drawing without blocking; speed/tracer settings draw in batches rather than reproducing desktop animation timing. The Python output panel includes a replace-with-confirmation Turtle starter. Keyboard/mouse callbacks, custom registered shapes, desktop dialogs, Tk APIs, fractional screen sizing, and event-driven Turtle games are not supported. Unsupported object methods raise explicit errors. Run `python tests/test_turtle.py` for six drawing regression tests.

The visual theme is now Midnight Arcade (navy/violet/cyan), with twelve distinct original SVG characters. The selected character replaces the pointer at 29px on fine-pointer devices; text editing retains a standard caret. The fixed Avatar cursor button toggles this behavior and remembers the preference. Touch devices retain native behavior, and character animations respect reduced-motion settings.

Python uses Pyodide 0.27.7 from jsDelivr. Network access is needed on first run. Packages are limited to the Pyodide runtime; package install, terminal input, native extensions, server sockets, and general Tk/desktop graphics are not implemented. Browser Turtle drawing is supported as described above. The worker is terminated to stop loops. A worker is not a full hostile-code security boundary: run only your own or trusted classroom Python until a separate execution origin is introduced. HTML previews block external resources intentionally; an iframe can still navigate itself and a hostile infinite JS loop may affect browser responsiveness. Dedicated-origin preview hosting is recommended before production.

Not yet complete: live two-account integration/security validation, server-side APIs and rate limits beyond the invitation RPC, normalized per-file storage, account/project deletion UI, account-linked avatars and notes, activity emission, Yjs co-editing, focus trapping in all dialogs, and comprehensive accessibility review. Live presence and draft viewing require Supabase private Realtime setup; they cannot run in local-only mode. Authentication uses Supabase's browser SDK; production session hardening and restrictive app-level security headers require deployment review.

The current tests verify project isolation, starter configuration, preview generation and schema invariants. They do not establish live RLS correctness. Before rollout, run a staging matrix with two teachers and two students: anonymous read/write denied; unrelated student and teacher read/write denied; related teacher read allowed but write denied; owner CRUD allowed; replay/expiry of invitations rejected; concurrent writes reject stale versions. Add browser end-to-end tests for auth, invitation, execution, persistence, and error recovery. No database integration tests can run without a Supabase instance.

Performance checks: use production `npm run build && npm start`, Chrome with 4x CPU slowdown/Fast 3G, cold cache then warm cache. Record navigation, editor load and first Python run separately. Check typing responsiveness during a 30-second Python loop. Check the Network panel to confirm Monaco and Pyodide aren't fetched on dashboard load. No benchmark results are claimed.

For Vercel, import this Next.js repository, configure the two environment variables and use the default Next.js build settings. Nothing has been deployed.

## Validation in this workspace

Production build, TypeScript checking, ESLint, and all five automated tests passed. The local server returned HTTP 200. Live authentication, RLS and browser interaction tests have not been verified. Installed DOMPurify was patched to 3.4.17 and enforced for nested dependencies; the audit now reports 16 moderate advisories through minimatch in development tooling, with no high or critical installed-dependency advisories. The suggested forced ESLint downgrade is not compatible with this setup. Monaco's default CDN loader is independent of npm dependency overrides and needs production asset/version review. Do not treat the passing build as production security approval.
