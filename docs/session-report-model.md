# Session report model (Phase 1B)

## Session grouping

Activities come from `api.my_hub_activity_progress(p_hub_code)`.

A reportable session key is:

```text
hub_code + week_number + session_number
```

Optional `week_key` is retained for display when present.

Rows missing `week_number` or `session_number` are **unscoped** and never treated as a lesson report.

## Session completion

```text
required_activity_count = number of Phase 1A rows in the session
completed_activity_count = rows where completed = true
session_complete =
  required_activity_count > 0
  AND completed_activity_count = required_activity_count
```

Completion is independent of score. Low scores still produce a report once every required activity is completed.

Phase 1A returns current hub-bound assignments for the authenticated learner. For Unit 3, hosted delivery metadata currently marks those assignments required; the SPA treats every returned session row as a required current assignment for that learner.

## Unit 3 Week 1 reliability

Hosted inspection (read-only) for group `CYBER-TEST-A`:

- Week 1 Session 1: 39 activities, all with week+session metadata
- Week 1 Session 2: 40 activities, all with week+session metadata
- All active Unit 3 assignments inspected: 0 missing week/session metadata

`hub + week + session` is sufficient for the Unit 3 pilot.

## Overall performance

Unweighted mean of `latest_percentage` across **scored** completed activities in the session.

- Uses latest completed performance (not best, not attempt-weighted)
- Excludes activities with no meaningful numeric score (`latest_percentage` null or `max_score <= 0`)

## Strengths / areas to review

Uses Results library default bands from `buildDiagnostics`:

- Strength: latest percentage ≥ 80
- Review: latest percentage ≤ 50

Labels are **activity titles**, not formal topic/skill claims.

## Improvement

Shown only when `attempt_count > 1` and `improvement_percentage_points` is present.
