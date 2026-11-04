# Owner decisions before public launch

These decisions need the product owner or the relevant school/operator. The current UI and draft policy pages identify unresolved information instead of inventing it.

## Organization and legal details

- Confirm the legal operator name, mailing address, privacy contact, and support contact.
- Confirm intended countries/regions, student age range, guardian/teacher consent flow, and school contracting requirements.
- Have counsel review the privacy notice and terms for the actual operating model. Do not describe the product as COPPA-, FERPA-, or GDPR-compliant until that review and required controls are complete.
- Set actual account, project, classroom, and backup retention/deletion periods; document how an account or school requests deletion.

## Identity and school access

- Configure the real Google OAuth client, callback URLs, verified application name, and allowed redirect origins before advertising Google sign-in.
- Decide whether younger students can use a teacher-provisioned identity without personal email.
- Confirm Supabase project region, Auth settings, rate limits, redirect allowlist, row-level security on every student/classroom table, invitation expiry/revocation, and account deletion behavior.
- Review whether auth refresh tokens must be HttpOnly in the deployment architecture. The browser Supabase client/realtime model can require readable session state; use a server facade if HttpOnly cookies are a hard requirement.
- Complete two-account tests (teacher and student) against deployed policies: invite, join, edit, submit, revoke, and verify a different class cannot read or modify data.

## Runtime and classroom safety

- Decide whether arbitrary project code will remain browser-local or move to a server runtime. If server-side execution is introduced, require an isolated, resource-limited execution service on a separate origin before enabling it for students.
- Confirm the actual support path for harmful content, account abuse, and classroom incidents. No public sharing/reporting queue is represented as operational today.
- Decide whether C, C++, and Java should be starter-only or should run through a maintained compiler service. The current starters are examples; they do not make those languages executable in this Python/web runtime.

## Operations and launch

- Choose and configure a production support/error-monitoring destination; no monitoring vendor or alert route is assumed here.
- Confirm the canonical public domain and update metadata, sitemap, OAuth redirect URLs, and provider allowlists together.
- Review privacy/data flow and security headers against the final domain, embeds, and integrations.
- Test on real school-managed devices, touch screens, assistive technology, low-bandwidth connections, and the oldest supported browser.
- Set a named owner and review date for these decisions before inviting real students.
