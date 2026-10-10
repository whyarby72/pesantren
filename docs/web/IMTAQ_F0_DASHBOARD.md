# IMTAQ Next.js F0 Dashboard Candidate

F0 **nonproduction** responsive dashboard for four canonical domains: AKD, THF, SAN, FIN. No accounts, real PII, payment, or business records.

- App: `apps/web`, Next.js App Router + TypeScript strict, standalone output.
- Local: `cd apps/web && npm install && npm run dev` (Node 24); open `http://localhost:3000`.
- CI: `IMTAQ Web Build` must PASS for real Next.js compile, static routes, HTTP smoke, and Passenger ZIP artifact.
- Passenger: startup root `/home/afradadm/imtaq-app` with `app.js`. Follow `apps/web/deploy/README_DEPLOY.txt`. No deployment is automatic.
- Dependency policy: Next/React pinned exactly in package; **apps/web/package-lock.json is not yet committed** due offline npm registry in the authoring environment. The GitHub CI job creates a build lock in its environment. Before promotion, export/pin reviewed lockfile and use `npm ci` (currently a RELEASE HOLD). Do not claim deterministic dependency closure from exact top-level pins alone.
- F0 ADR tenancy, IAM-wali, privacy-retention remain OPEN. PR #2 IAM and PR #3 Node24 are pending separately; avoid merging conflicting changes without deliberate rebase/regression.
