# ClassCode A–D review report

**Review date:** 2026-11-04  
**Scope:** Product clarity, classroom/safety transparency, interaction/accessibility, and quality/discoverability. AI-driven changes (E) are intentionally out of scope until A–D are accepted.

## Before and after

| Area | Before | After |
| --- | --- | --- |
| Home and starters | Repeated messaging and uneven language discoverability | One clear promise/action, eight starter cards, filter/search empty states, and accurate guest messaging |
| Teacher and student expectations | Existing classroom entry point but limited explanation near onboarding | Teacher overview and safety summary describe current capabilities and limits |
| Accessibility and phones | Some small text missed contrast guidance; interaction and 320px overflow had no automated guard | Contrast corrections, keyboard tabs, reduced-motion support, targeted axe and 320px Playwright checks |
| Trust and search | Missing policy routes and discovery metadata | Draft trust routes, canonical/social metadata, sitemap and robots route |
| Release quality | No end-to-end landing flow checks in CI | CI workflow includes lint, typecheck, unit, build, Playwright/axe, and Lighthouse mobile score checks |

## Devils-advocate review

- A clearer homepage can sound like capabilities are more complete than they are. Copy therefore describes current classroom and runtime boundaries, and languages without a compatible runtime are labeled as starters only.
- A safety page can create false assurance if it claims certification or a moderation channel. Draft pages explicitly require owner/counsel review and do not claim a reporting queue or legal compliance.
- A Google sign-in button can imply a configured provider. The sign-in check asserts that the interface presents the option without claiming the OAuth provider is configured.
- A Lighthouse gate cannot replace real-world assistive technology, device, and network testing. Those remain owner/CI follow-ups.
- Security headers and browser isolation do not prove that arbitrary code is safe. No server-side execution sandbox or completed Supabase authorization review is claimed.

## Verification

| Check | Result |
| --- | --- |
| Unit tests | **Passed** — 24/24 |
| Type checking | **Passed** — `tsc --noEmit` |
| Lint | **Passed with warning** — zero errors; one existing missing dependency warning in `components/live-session.tsx:80` |
| Production build | **Passed** — optimized Next.js production build and static route generation |
| Route smoke | **Passed** — home, four trust pages, robots, and sitemap all returned HTTP 200; security headers were present |
| Playwright + axe | **Passed** — four browser checks: experiment keyboard/result flow, sign-in options, no serious/critical landing-page axe violations, and no horizontal overflow at 320px |
| Python execution flow | **Not verified locally** — the browser test waited for the external Python runtime download and was stopped after it did not complete in this network-restricted environment. CI still runs the full test with the 180-second timeout.
| Lighthouse | **Pending CI** — CI rejects mobile category scores below 0.90; no Lighthouse scores were produced locally, so record actual CI scores before treating the budget as passed.

## Release owner decisions

See [`OWNER-DECISIONS.md`](OWNER-DECISIONS.md). In particular, legal operator/contact/retention, consent and school terms, OAuth configuration, deployed Supabase RLS checks, language runtime scope, production domain, incident support, and monitoring are still owner decisions.
