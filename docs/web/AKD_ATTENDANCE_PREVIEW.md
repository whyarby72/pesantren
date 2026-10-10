# IMTAQ — Akademik → Absensi Kehadiran Jam Pelajaran

**Status:** PROPOSED · SYNTHETIC_UI_DEMO · NOT AN OFFICIAL ATTENDANCE SYSTEM

## Grounding and scope

- Canonical Requirements Discovery v0.2: `AKD-02` schedules, `AKD-03` assignments, `AKD-04` journal/attendance per KBM meeting; `ATT-01` contextual attendance, `ATT-05` SAN leave reconciliation, `ATT-06` authorized corrections. Historical `ATT-*` identifiers remain under supporting `PLATFORM/ATT`, not a fifth main domain.
- Existing working spec `PSM-AKD-ATT-MVP/0.3.0` and its academic-hour addendum carry the user's previously recorded operational instruction: **guru fills paper; assigned wali kelas transcribes digital attendance; guru has no digital attendance access**. Organizational rank Super Admin → Mudir → Waka Akademik → Wali Kelas does not imply permission inheritance.
- Reference offline prototype v0.7.6 supports combined lessons with distinct original-class rosters, draft/correction versioning and local-only simulation. This PR integrates a narrower browser-memory preview into the active IMTAQ Next.js dashboard, without importing the offline prototype's localStorage or its simulated role registry as a real authentication system.

## Acceptance in this preview

1. `/akademik/absensi` reachable from dashboard and AKD area; mobile-responsive layout.
2. Data **only** pseudonymous `SIM-xxxx` identifiers and fictional sessions. No real students/teachers; no HTTP endpoint, `localStorage`, remote database, file upload or exports.
3. Select `WALI-2B`/`WALI-3B` with explicit simulated assignment. Selecting a teacher, Waka, Mudir, Super Admin or another class denies roster display/input in this UI; it is **not actual authorization** because these are public client fixtures.
4. A single combined scheduled KBM session (`KBM-01`) keeps 2B and 3B rosters and records separate; a second lesson on the same day can have another status.
5. Missing paper or ambiguous data starts `BELUM_DICATAT`, never ALPA. `IZIN_REVIEW`/`SAKIT_REVIEW`/`TERLAMBAT_REVIEW`/`TIDAK_HADIR_REVIEW` require approved reconciliation/SOP before becoming official.
6. Record source-paper reference; correction to previously saved status requires a reason; retry with identical status is idempotent; stale revision denied; cancelled session denied; out-of-roster ID denied.
7. `SUBMITTED` locks the in-memory demo; it does **not** mark attendance `VERIFIED`, publish a report card, send messages, or persist data. Refresh erases all changes.
8. Maintain four main domains AKD/THF/SAN/FIN. The supporting attendance ledger/reconciliation is conceptual owner `PLATFORM/ATT`; no cross-owner database writes.

## Run and test

- From `apps/web`: `npm test` with Node.js 24, `npm run typecheck`, `npm run build`.
- CI workflow `IMTAQ Web Build` runs package install/build and Passenger standalone HTTP smoke, including `/akademik/absensi`; GAQI runs on a PR targeting `main`.
- Local authoring environment (Node 22): `NODE_OPTIONS=--experimental-strip-types npm test`; Next.js install/build may be unavailable offline and require GitHub CI evidence.

## Release HOLD: actual attendance

The deployed screenshot of IMTAQ F0 is a public preview. **DO NOT enter attendance of real minors on this page.** For operational deployment, require institution-approved SOP for class/meeting definition, paper handling, corrected statuses, authorized verifiers, classroom staffing and retention. Implement authenticated NestJS backend using an IAM default-deny gate at each request and worker, live AKD assignment and SAN roster/approved leave evidence, PostgreSQL transactions, durable ATT audit/history, idempotency/concurrency controls and backup/restore. Test negative IDOR, changed assignments, cancelled and combined sessions, replay and leave reconciliation on the actual server. The UI demo passes only client-side simulated policy tests.

**Rollout:** New attendance route requires a newly built standalone artifact to be reviewed and manually deployed to DomaiNesia Passenger, with backup and rollback. `main`, PR #4, private archives, Project Sources and canonical products must not be silently modified. No production data, payments or official records are involved.
