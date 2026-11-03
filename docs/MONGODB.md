# Optional MongoDB revision history

MongoDB stores explicit archived project milestones. Supabase remains the authoritative project store, identity provider and classroom authorization service. Existing projects and live sessions are not migrated or deleted.

## Connect

1. Create a MongoDB Atlas database (or a MongoDB instance on your server). Use a database user restricted to the chosen database. Permit the deployment server's network access and use TLS for remote connections.
2. Add `MONGODB_URI` and optionally `MONGODB_DB=classcode` to `.env.local` or your deployment's server secrets. Never expose this URI with `NEXT_PUBLIC_` or commit credentials. No URI is present in this checkout, so a real database connection has not been verified.
3. Configure Supabase as described in README. Restart the app.
4. Sign in, open a cloud project, and use the History icon in the editor header. Save your work, then choose **Archive saved version**. Repeated archival of the same project/version is idempotent.

The server lazily connects with the official MongoDB driver, reuses a small connection pool, and creates a unique compound index on `project_id` and `version`. Connection failures return a safe error without exposing the connection string.

## Authorization and data flow

`GET /api/projects/:id/history` returns up to 20 revision metadata records. `?version=N` retrieves a specific revision including files. `POST` archives the authoritative saved Supabase version. Requests require a Supabase bearer token verified server-side using `auth.getUser()`. The project is re-read using that user's JWT and Supabase RLS on every request. Unauthorized/unknown projects return an unavailable response. Only the owner may archive; assigned teachers with current read access may inspect history. Direct body-supplied code, MongoDB filters and owner IDs are never accepted. The MongoDB driver is server-only.

History does not autosave on every keystroke or consume background bandwidth. No connection URI means history remains visibly unavailable, without affecting normal saves. Archives include code, so configure appropriate retention, backups, access logging, deletion workflows and deployment-level rate limits before production use. This integration does not implement a standalone MongoDB authentication/permissions system or account deletion/retention orchestration.

## Validate against a real staging database

Test anonymous requests, unrelated teacher/student access, owner archive, assigned teacher read-only archive access, relationship revocation, duplicate version requests, database outages, and secret redaction. Local builds and route checks cannot establish live database behavior without the actual MongoDB and Supabase configuration.
