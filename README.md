# Learning Platform Reports

Standalone learner-facing **Reports SPA** for completed lesson/session performance reports.

Phase 1B pilot hub: `unit-3-cyber-security`.

## Important distinction

| Surface | Purpose |
| --- | --- |
| Existing hub **Practice progress** panel | Immediate in-hub progress while learning |
| This **Reports SPA** | Final lesson/session report after all required activities are complete |

This application does **not** replace, hide, or redirect the hub progress UI.

## Repository decision

No existing learner Reports SPA repository was reserved in the Acerosa ecosystem.

`@learning-platform/results` remains an interpretation library and is **not** converted into this SPA.

This repository (`learning-platform-reports`) is the dedicated standalone application.

## Local development

```bash
# From a sibling checkout layout:
# Projects/learning-platform-reports
# Projects/learning-platform-results

cd ../learning-platform-results && npm ci && npm run build
cd ../learning-platform-reports && npm install
npm run dev
```

Open the Vite URL and sign in with an existing learning-platform learner account.

Deep-link preparation (curriculum scope only — never learner identity):

```text
/?hub=unit-3-cyber-security
/?hub=unit-3-cyber-security&week=1&session=1
```

## Scripts

- `npm run dev` — local SPA
- `npm test` — Vitest + Node regression checks
- `npm run check` — typecheck, test, build

## Security

- Auth via existing Supabase project (publishable key only)
- Learner identity from `auth.uid()` session only
- Browser calls `api.my_hub_activity_progress` only
- No service-role credentials
- No learner ID / student number / email / auth UID in URLs

## Deployment

GitHub Pages workflow is prepared for QA validation of this standalone app.

Do **not** add hub links or announce production learner rollout from this repository alone.
