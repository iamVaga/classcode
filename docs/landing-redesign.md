# ClassCode landing page design and verification

The landing page leads with the student outcome and puts the classroom walkthrough directly beneath the trust strip. The hero and track actions use the existing editor, guest project, and account flows. Workspace opens the existing project and classroom navigation. The teacher and hint examples use illustrative code, with no student data or realtime connection in the demos.

## Typography

- Lexend gives headings distinct letterforms and echoes the typography already in the workspace.
- Geist gives longer copy and controls a quieter rhythm at small sizes.
- Atkinson Hyperlegible Mono distinguishes similar characters in code. The landing page disables ligatures.

Next.js serves the fonts from the same origin and preloads the Latin subsets with swap. Warm white and deep green carry the marketing surface. Dark navy isolates executable-looking examples, and amber marks supporting detail. The dark theme uses the same hierarchy with lighter text and mint accents. Interactions animate transform and opacity, avoid autoplay loops and respect reduced motion and the data saver preference.

## Content to supply

- TODO Teacher quotes. Provide the approved wording, attribution and publication permission.
- TODO Classroom statistics. Provide the measured value, sample, time period, source and approval to publish.
- TODO Student work gallery. Provide anonymized examples with permission to show the work. The current track examples are starter projects.
- TODO School purchasing. Confirm guest and school pricing, a monitored sales/support and privacy contact, the legal operator and any administrator-facing data retention terms.

Base contrast ratios are 15.29:1 for light text foreground on the canvas, 6.95:1 for secondary text on the canvas, 6.51:1 for white on the green primary action, 10.03:1 for dark-mode secondary text on the canvas and 11.71:1 for dark ink on the mint primary action. These are calculated token pairs; the browser checks cover the rendered states listed in the reports.

## Verification artifacts

| Artifact | Before | After |
| --- | --- | --- |
| Mobile screenshot, 390px | [Before](../artifacts/landing-before-390.png) | [After](../artifacts/landing-after-390.png) |
| Desktop screenshot, 1440px | [Before](../artifacts/landing-before-1440.png) | [After](../artifacts/landing-after-1440.png) |
| Mobile Lighthouse | [Before](../artifacts/landing-before-lighthouse.json) | [After](../artifacts/landing-after-lighthouse-mobile.json) |
| Desktop Lighthouse | [Before](../artifacts/landing-before-lighthouse-desktop.json) | [After](../artifacts/landing-after-lighthouse-desktop.json) |
| Viewport, fonts, shift entries and axe data | [Before](../artifacts/landing-before-layout.json) | [After](../artifacts/landing-after-layout.json) |

The [baseline audit](landing-audit.md) lists the top 15 issues. The [baseline CSS inventory](../artifacts/landing-before-css.json) captures selectors relevant to the default rendering. The desktop baseline uses the same original source compiled with Webpack in an isolated local directory. The mobile baseline and redesigned build use Turbopack. Lab performance varies with host CPU load and does not represent field data.

| Lighthouse profile | Performance before → after | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Mobile | 88 → 88 median (88, 92, 88) | 97 → 100 | 100 → 100 | 100 → 100 |
| Desktop | 99 → 100 | 97 → 100 | 100 → 100 | 100 → 100 |

Final mobile LCP was about 1.15 seconds in the primary report. Final mobile performance did not meet the 95 target. The intermediate candidate reached 97 on a quiet run, but the final scores varied and should not be represented by the earlier result. See [second mobile run](../artifacts/landing-after-mobile-run-2.json) and [third mobile run](../artifacts/landing-after-mobile-run-3.json). Lighthouse reported zero CLS in the final mobile and desktop runs. Unthrottled viewport measurements saw small nonzero sums up to 0.0011, so zero layout shift is a lab observation rather than a guarantee.

Chrome measured document widths of 360, 390, 768, 1024, 1440 and 1920 at the matching viewport widths. Axe reported no violations for the captured 390px and 1440px default states. These automated checks do not establish full WCAG conformance. The production build, targeted lint and TypeScript checks passed. The functional pass included 47 unit tests and 16 Playwright tests, including keyboard tab navigation, accept/dismiss, hint progression and existing guest editor flows. The final route smoke check returned HTTP 200 for all eight preserved routes and the OG image. The teacher demo test uses sample data. It does not log into a real classroom or create student records.
