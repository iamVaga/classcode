# ClassCode design decisions

## Direction

The interface uses a warm paper foundation, quiet surfaces, deep teal actions, and restrained coral accents. The student’s code and its result stay visually dominant. The landing experience explains the product through a real interactive coding example and starter projects, then gives teachers concrete classroom workflows.

## Rationale

- **Warm neutrals and teal:** keep long coding and reading sessions comfortable while giving actions a clear, consistent signal.
- **Sentence case and compact labels:** make the product feel respectful to older students and approachable to younger learners.
- **One shared token layer:** centralize color, typography, spacing, shape, focus, shadow, and motion so future screens stay coherent.
- **Editor, preview, and console together:** let learners connect their changes to visible output without switching tools. Splitters support mouse, touch, and keyboard resizing.
- **Motion follows feedback:** transitions mark running, saving, filtering, progress, and disclosure. Reduced-motion settings remove the movement.
- **Native controls where possible:** semantic buttons, inputs, details, dialogs, and landmarks reduce custom interaction code and improve keyboard access.
- **Themes:** light and dark share the same semantic roles; students can switch themes from the workspace and style guide.

## Pages and system

- `/` — responsive student and teacher workspace overview with interactive demo, starter tracks, classroom workflow, safety details, and next action.
- `/style-guide` — interactive catalog of tokens in use, controls, cards, progress, editor/output surfaces, feedback, empty, loading, error, tooltip, dropdown, dialog, toast, and avatars.
- Workspace editor — project shell with language-aware syntax theme, save status, run/stop, autosave, resizable editor/output panes, preview and console, command palette, shortcuts, theme switch, and existing live-session integration.
- `app/design-tokens.css` — semantic light/dark color, track, typography, spacing, shape, shadow, focus, and motion variables.
- `app/design-system.css` — token-driven component and responsive rules.

## Owner-provided content still needed

- Final support/contact address and approved privacy, safety, and student-data policy text.
- Product owner’s approved age range and school/parent consent language.
- Production Google OAuth configuration and Supabase project settings before account-based authentication can be represented as production-ready.
- A confirmed isolated compiler service for Java, C, and C++; those languages currently receive editor support, while execution depends on a private sandboxed service.

## Current limits

This pass reshapes the existing app without replacing its established account, project, classroom, or live-session data flows. The style guide is a product route intended for review and is marked `noindex`. Performance and accessibility targets require measurement against the deployed environment and real student devices; a local pass cannot guarantee Lighthouse scores for every network and device.
