# Changelog

## Unreleased

- Session completion audit updated after Phase 1A.1: Unit 3 Week 1 Session 1 / Session 2 authoritative membership is **27 / 28** (no duplicate versions). Unlock remains `completed === required` on API rows; `u3-w01-definition-gap` is not required.
- Added explicit 27/27 and 28/28 unlock coverage for post–Phase 1A.1 membership.

## 0.1.1

- Review fixes: safer deep-link identity rejection on first load, cleaner RPC error mapping, formative wording clarification
- Documented hosted Week 1 session completion data audit (39/40 vs package 28)
- Expanded regression coverage for incomplete deep links, 39-row sessions, non-scored averages, and score decreases

## 0.1.0

- Phase 1B standalone learner Reports SPA (Unit 3 pilot)
- Session-complete gating for lesson reports
- Sign-in, reports home, incomplete session, completed session report screens
- Uses `api.my_hub_activity_progress` only
