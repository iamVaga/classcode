# ClassCode landing page audit

Baseline: unchanged local production build, Chrome, light mode, 100% zoom, commit 25498be. Production build used host access for Google Fonts and Windows junctions. Screenshots, computed layout/axe data and selector inventory are in artifacts/landing-before-*.

| Width | Document width | Hero height | Heading | Starter columns | Observed layout shift sum |
| --- | --- | --- | --- | --- | --- |
| 360 | 360 | 1244 | 42 | 1 | 0 |
| 390 | 390 | 1245 | 43 | 1 | 0 |
| 768 | 969 | 652 | 46 | 3 | 0.000088 |
| 1024 | 1024 | 650 | 66 | 3 | 0.000064 |
| 1440 | 1440 | 665 | 72 | 3 | 0.000032 |
| 1920 | 1920 | 666 | 72 | 3 | 0 |

At phone widths the hero stacks. At tablet widths the split layout and intrinsic content widths can extend past the viewport. Large screens cap the project grid at about 1200px. The measured shift numbers are sums of no-input shift entries, while Lighthouse reports standard session-window CLS.

Lexend 400/500/600/700 serves heading and body roles. Atkinson Hyperlegible Mono serves code. The root uses next/font/google, Latin subsets, swap and preloading, with two font preload links in the measured HTML. Lexend has an adjusted fallback. Next.js reports no adjusted fallback values for Atkinson. Hero type ranges 42–72px at measured widths with 1.02 line height and −.045em tracking. Tokens define 28–36px h2, 20–24px h3 and 16–17px body, though the hero description grows to 19px. The system defines a 4px spacing grid through 128px and control/card/panel radii of 8/12/20px. Older style layers retain local values.

Light tokens use warm white #FAF8F4, ink #14181F, secondary ink #5B6472, teal #0B7678, coral #FF6B4A, success #14744D and error #B4231B. Dark uses #0E1217/#161C24 surfaces, #EEF1F5/#9AA5B4 text and #3CC4C6 teal. WCAG sRGB contrast is approximately 16.8:1 for ink on canvas, 5.6:1 for muted on canvas, 5.4:1 for white on teal, and 2.6:1 for raw coral on canvas. Coral is decorative unless accompanied by darker text. Axe in the default 390/1440 states reported one prohibited ARIA attribute on the PyBlock example and no automatic color-contrast violations. That result does not cover every possible state.

The selector inventory records 72 matching state and animation declarations, their media context and CSS. Primary/secondary actions have press scaling, primary arrows nudge, cards lift, navigation and category/demo selections change fill or underline, filter focus changes border/shadow, and global focus-visible uses a token ring. Review of the bundled keyframes found companion blink/float, auth spin, surface/dialog/backdrop entry, runtime breathe/loading turn, live pulse, hint/toast/overlay/modal/card/reveal entry, caret blink, scan line, check draw, token highlight, skeleton wash/spin, step arrival, code progress, share flow, particle burst and fade-in. Some belong to the app or style guide and are dormant on the landing page. A global reduced-motion override disables animations and transitions.

## Top 15 issues by impact

1. Tablet horizontal overflow at 768px.
2. Hero headline gives no indication this is a browser coding workspace for students.
3. Teacher live join is buried below the catalog.
4. Teacher example cannot be joined, accepted or dismissed.
5. Phone hero is 1245px tall and splits the pitch from the hands-on example.
6. Students and teachers encounter competing hero actions without a school evaluation path.
7. Hint ladder presents all clues at once and cannot demonstrate a fix.
8. Language coverage is scattered instead of shown in one track section.
9. Safety language is hedged and too far from the first decision.
10. School IT, Chromebook, account, cost and data questions lack a FAQ.
11. Overview mixes app settings, project filters, classroom actions and marketing without clear hierarchy.
12. Floating Adaptive text lacks context.
13. PyBlock example has a prohibited ARIA label.
14. Fixed and animated decorative elements compete with code and create extra visual density.
15. Social preview, classroom proof and project examples don't substantiate the live coaching positioning. Verified quotes, metrics and student work are missing.

Baseline mobile Lighthouse (13.6): performance 88, accessibility 97, best practices 100, SEO 100. Lab LCP 1.21s and CLS 0.0000013.
