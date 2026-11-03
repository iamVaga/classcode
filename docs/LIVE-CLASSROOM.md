# Teacher live view

## Enable

1. Configure Supabase with the public URL/anon key from `.env.example`. No backend credentials are present in this checkout.
2. Apply `001_foundation.sql`, then `002_live_sessions.sql`. Enable private Realtime channels and disable public channel access in Supabase Realtime settings. Review/remove any broader existing `realtime.messages` policies; Postgres combines permissive policies with OR.
3. Create a teacher account. In Classroom, create an invitation and share the code directly with your student. No email is sent by ClassCode.
4. Student registers/signs in and redeems the code in Classroom. The invitation RPC converts a new account to a student and links it to the teacher. Accounts already teaching students cannot redeem student invitations.
5. Student opens a cloud project and chooses Live session → Start sharing. The teacher opens the student's project from Classroom and chooses Join student workspace.

Teacher viewing is read-only in both Monaco and the lightweight editor. Teachers can select files and run a local copy without writing to student storage. Student saves use version checks independently of ephemeral draft messages. This is live observation, not shared editing, and does not require a text CRDT. Co-editing would require a separate authenticated CRDT integration.

## Protocol

Private room topic is `project:<uuid>`. Server policies verify project ownership or an existing teacher/student relationship; knowing a room name provides no access. Only the project owner can send draft broadcasts. Both authorized roles can send presence. UI counts indicate connected authorized room participants; client presence metadata is not an independent identity proof.

Drafts are debounced by 500ms, bounded at 200 KB/50 files, sequenced per sender session, and periodically resent every 15 seconds for recovery. Joining/presence sync sends the latest snapshot. Only a student who explicitly started sharing publishes code. Stop/leave disconnects and notifies observers where possible. Channel errors are visible. This is eventual live viewing; it is not a guarantee of delivery of every keystroke.

Realtime authorizes at channel join, rather than re-running relational policies for every message. Connected clients recheck project access every 30 seconds and disconnect on failure. Close sessions before revoking assignments; strict instantaneous revocation requires a server-controlled transport. Network failures can leave the teacher's last visible draft on screen. Clearing a teacher's already-received data is not possible.

## Verification

Build/type/lint and local payload/observer/policy regression tests can run without credentials. A real two-account/cross-device test cannot run until Supabase is configured. Before rollout, use two teachers and two students to test:

- Assigned teacher can read/join; unrelated teacher/student/anonymous users cannot read or join guessed room names.
- Only owner can broadcast drafts and save project changes; teacher broadcast attempts and direct writes are rejected.
- Student start/stop, late teacher join, presence, refresh, reconnection, revoked relationship, and stale-save conflicts.
- Invitation expiry, reuse, self-redemption and rate limit.
- Both full and Data saver editors remain read-only for teachers.

No simulated backend or public collaboration room is used when credentials are absent. Production student onboarding and consent review remain required as described in the project brief.
