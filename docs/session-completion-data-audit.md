# Session completion data audit (Phase 1B review)

Date: 2026-09-10  
Scope: Unit 3 Week 1 Session 1 / Session 2 vs Phase 1A rows

## Authoritative curriculum expectation

From `unit-3-Cyber-Security-Hub/content/unit-3-cyber-security/package.json`:

| Session | Activity keys in published package |
| --- | ---: |
| Week 1 Session 1 | **28** |
| Week 1 Session 2 | **28** |

## What Phase 1A currently returns (CYBER-TEST-A learner)

| Session | Phase 1A rows | Distinct activity keys |
| --- | ---: | ---: |
| Week 1 Session 1 | **39** | **27** |
| Week 1 Session 2 | **40** | **28** |

## Why 39 / 40 is not the lesson boundary

Multiple **active required assignments** exist for the same activity key at different versions.

Session 1 multi-version keys (4 versions each: `1.0.0`, `1.1.0`, `1.2.0`, `1.3.0`):

- `u3-w01-baseline`
- `u3-w01-cia`
- `u3-w01-glossary`
- `u3-w01-incidents`

→ 4 keys × 3 extra versions = **+12** rows → 27 unique keys + 12 = **39**.

Session 2 multi-version keys (same pattern):

- `u3-w01-retrieval`
- `u3-w01-command-words`
- `u3-w01-ocr-practice`
- `u3-w01-peer-improvement`

→ 28 unique keys + 12 = **40**.

Additional gap:

- Package Session 1 includes `u3-w01-definition-gap`
- Hosted CYBER-TEST-A active assignments do **not** include that key (27 distinct keys)

## Critical product implication

If a learner completes the Unit 3 lesson as authored (one current activity per package key), the Reports SPA will **not** reliably unlock, because Phase 1A still treats older assigned versions as separate incomplete required rows.

This cannot be fixed inside the SPA without inventing non-authoritative filters.

Required follow-up (separate backend/data task):

1. Make assignment delivery expose a single current version per activity key for reporting, **or**
2. Deactivate stale version assignments for live groups, **and**
3. Align assignments with the published package session membership (including `u3-w01-definition-gap` if still required)

Until then Phase 1B merge is blocked by session completion data.
