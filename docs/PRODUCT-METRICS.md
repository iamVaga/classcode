# Product metrics

Weekly active classes counts distinct class IDs with an assignment submission or a teacher and student present in the same live session during the UTC calendar week. Exclude test and demo classrooms. Class creation alone does not count as activity.

| Event | When to record it |
| --- | --- |
| `student_first_run_succeeded` | First successful run. Record whether it happened within five minutes of first opening the workspace. |
| `teacher_class_created` | After the class is committed to the database. |
| `assignment_created` | After an assignment is committed. |
| `assignment_submitted` | After an assignment submission succeeds. |
| `hint_level_used` | When a student opens a hint level. Record the level and deterministic error category. |
| `live_session_shared` | Once per session when the teacher and student are both present with the student’s consent. |

This defines the events and metric. Collection is pending a school privacy and consent review. Limit future payloads to event name, timestamp, internal identifiers, and the stated categorical fields. Exclude code, prompts, tracebacks, emails, nicknames, and assignment text.
