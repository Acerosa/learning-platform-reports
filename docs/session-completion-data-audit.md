# Session completion data audit (Phase 1B)

Updated: 2026-09-10 (after Phase 1A.1 production validation)

## Authoritative reporting membership (hosted)

Phase 1A.1 `api.my_hub_activity_progress` returns **one current assignment per
logical activity key**. Older active versions remain available to version-pinned
learner APIs but are **not** returned as required reporting rows.

CYBER-TEST-A / Unit 3 Week 1 (hosted, post–Phase 1A.1):

| Session | Current reporting rows | Distinct activity keys |
| --- | ---: | ---: |
| Week 1 Session 1 | **27** | **27** |
| Week 1 Session 2 | **28** | **28** |

Example: `u3-w01-baseline` returns a single row at the authoritative current
version (`1.3.0`). Historical assignment rows for `1.0.0`–`1.2.0` remain stored
but do not inflate required counts.

## Package vs assigned membership

Published Unit 3 package Session 1 still lists **28** keys including
`u3-w01-definition-gap`. That activity is **not** present in hosted
`learning.activities` / assignments, so it is **not** required for reporting.

Reports SPA completion therefore uses **27 / 27** for Session 1 and **28 / 28**
for Session 2. Completing every assigned Session 1 activity unlocks the Session 1
report without inventing `u3-w01-definition-gap`.

## Historical Phase 1B blocker (resolved)

Before Phase 1A.1, Phase 1A returned **39 / 40** Week 1 rows because multiple
active versions of the same key were each treated as required work. That blocked
reliable session unlock. Phase 1A.1 removed that inflation on the reporting RPC.

The SPA still completes a session only when `completed_count === required_count`
for the API rows it receives. It does not client-filter versions.
