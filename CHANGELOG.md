# Changelog

## 2026-11-04 — Product, classroom, and trust review (A–D)

### A. Product clarity and onboarding

- Before: the home screen repeated ideas and made some available languages hard to discover.
- After: one student/teacher promise, a single primary project action, eight distinct project starters, and clearer guest/project messaging.
- Decision: keep the language starters honest about what runs in the current workspace; this does not add Java, C, or C++ execution support.

### B. Classroom and child-safety transparency

- Before: important account, classroom, and student-safety details were not easy to find from the workspace.
- After: the home screen points teachers to the existing classroom flow; `/privacy`, `/terms`, `/safety`, and `/about` explain current behavior and mark owner review items.
- Decision: no unsupported promise of legal compliance, a public-content reporting queue, or new classroom capability.

### C. Accessibility and responsive interaction

- Before: small text colors fell below WCAG AA contrast, the experiment was harder to use by keyboard, and the phone layout could overflow horizontally.
- After: clearer contrast, keyboard-operable experiment tabs, a 320px layout check, reduced-motion handling, and an optional character cursor that stays off by default.
- Decision: preserve the existing visual direction while making controls more legible and touch friendly.

### D. Quality, discoverability, and operations

- Before: route metadata, crawl guidance, security response headers, and repeatable browser checks were incomplete.
- After: canonical/social metadata, sitemap/robots routes, baseline response headers, and CI checks for lint, types, unit tests, production build, Playwright, axe, and Lighthouse scoring.
- Decision: browser-based Python execution remains an isolated browser runtime. This work does not claim server-side sandboxing or a completed security review.

## Test report

See [`docs/REVIEW-REPORT.md`](docs/REVIEW-REPORT.md) for the observed checks and remaining owner decisions. Lighthouse scores and hosted CI results must be recorded from the production-like CI run; this changelog does not claim unobserved scores.
