# Production mobile performance report

Measured 2026-11-08 against the local optimized production build (`http://127.0.0.1:3000/`) with Lighthouse's mobile emulation.

| Measure | Result |
| --- | ---: |
| Performance | 90/100 |
| Accessibility | 97/100 |
| Best practices | 100/100 |
| SEO | 100/100 |
| First Contentful Paint | 1.1 s |
| Largest Contentful Paint | 1.1 s |
| Cumulative Layout Shift | 0 |
| Total Blocking Time | 310 ms |
| Speed Index | 4.7 s |
| Time to Interactive | 3.3 s |

There is no comparable production baseline from before this work. An earlier dev-server score is not an apples-to-apples baseline. Lighthouse uses simulated mobile CPU/network conditions; a physical low-end Chromebook and school-network throttle pass remain to be measured.

The raw Lighthouse JSON is generated locally at `artifacts/lighthouse-mobile.json` and is intentionally not committed.
