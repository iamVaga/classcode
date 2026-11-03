# ClassCode Studio — design rationale

## Research and interpretation

Reviewed on 2 November 2026:

- [Cobi](https://gocobi.com): large plain-language teaching proposition, white space, strong type, separated primary/secondary actions, product-specific teaching sections. Inspected its live page visually. Applied clarity and education-first structure rather than copying its branding, hero photo, course inventory or claims.
- [G2](https://www.g2.com): search-first discovery and explicit category navigation in its publicly readable homepage. Browser inspection was blocked by a device check, so no claim is made about its current fine visual details. Applied searchable starter discovery, category filters and precise result counts. No review stars, customer counts, badges or endorsements were borrowed.
- [Codingal](https://www.codingal.com), listed in [YC's directory](https://www.ycombinator.com/companies/codingal): clear course pathways and project-based learning. Applied understandable project categories, difficulty and approximate activity time. ClassCode does not claim its scale, accreditation or curriculum.
- [Linear](https://linear.app): purpose-led hierarchy and focus on the working product. Applied direct project continuation and removal of dashboard metrics without meaningful data. This is an additional product reference, not a claim that all YC startups share a design style.

## Problems addressed

The earlier app combined a promotional banner, sample students and decorative statistics with the actual project list. Dark neon and tiny muted labels made classroom workflows harder to scan. The redesign uses a light workspace by default, an independent dark option, semantic navigation, fewer competing surfaces, actual saved projects, and a starter library that creates working code.

## Information architecture

1. Discover: brief orientation, resume latest project, search and browse starters, classroom entry point.
2. My projects: actual saved projects, category filtering, recent/alphabetic sorting and new-project action.
3. Classroom: truthful setup state explaining that shared classroom integration is still being completed. No illustrative students presented as enrolled users.
4. Notebook: existing private local notes, clear persistence status, one large writing surface.
5. Editor: existing Monaco, Python worker, Turtle canvas, web sandbox, autosave, export and file operations preserved.

## Visual system

- Paper-white background and deep plum ink; muted grape is the action color.
- Lilac, sage, warm sand and clay distinguish Turtle, web and Python starter illustrations.
- Manrope headings and DM Sans body with Arial/system fallbacks. No new font dependency was added.
- Large two-line hero, clear section headings, readable body copy, and compact metadata.
- A centered content width, 56px desktop gutters, restrained borders and 6–12px corner radii.
- Original code/CSS/SVG illustrations rather than stock photos of children, external character assets or heavy 3D media.
- Avatar cursor remains small, optional, and disabled on touch; native text cursor is preserved in editing surfaces.

## Interaction details

- Starter cards create actual Python/web projects with independent file objects; Turtle starts with runnable artwork.
- Search matches titles, descriptions and starter categories. Deferred search keeps typing responsive. `/` focuses search when outside editable controls.
- Filters update result counts and include an actionable no-results state. My projects supports recent/alphabetic sort.
- Continue opens the most recently edited saved project.
- Navigation retains in-memory application state. No page reload is needed to change sections.
- New-project and account dialogs retain existing validation and persistence behavior. Supabase-dependent features are not portrayed as configured.
- Hover movement is limited to a few pixels; reduced-motion preferences disable character animation.

## Verification and remaining limits

Build, lint, model tests and Python Turtle tests should be run after changes. Verify desktop and narrow viewport layouts, starter creation, search/filter reset, project resume and notes persistence in the browser. Shared-classroom functionality is still outside this design change; authentication/RLS end-to-end validation still requires a configured staging backend. Full screen-reader and contrast certification have not been performed. Metadata and template durations are guidance, not measured student performance.
