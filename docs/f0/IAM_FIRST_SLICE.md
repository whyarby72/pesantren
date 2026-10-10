# F0 candidate — IAM deny-by-default policy kernel (nonproduction)

**Scope:** `F0-01/F0-02`, candidate `PSM-PLATFORM-IAM-001`. **Status:** PROPOSED until reviewed. `SUP-01`, `SAN-02`, `SUP-02`, `SUP-04` are traced to canonical Requirements Ownership Register v0.2; detailed operational policies remain undecided.

## Ownership and trust boundary

- `packages/security/src/policy.ts`: pure policy decision. No DB, HTTP, secrets or real PII. All role grants are *evidence* bound to a specific principal, record, domain owner, module, role, unit, action and effective interval; not automatically conferred by a title such as SUPER_ADMIN.
- `platform/iam/src/authorization-service.ts`: orchestration port for fresh **IAM grants** and **SAN-owned guardian evidence**, plus redacted audit writer. Do **not** accept this evidence from clients. Re-query before each authorized action, including exports and workers; all authorized domain use-cases must check the result before side effects.
- `PLATFORM/AUDIT`: later durable sink; the interface is NOT proof of immutable storage. Its failure makes this reference service deny (fail closed).
- Module evidence is a snapshot provided by a protected trusted Module Manager. A disabled/uninstalled/undeployed module or mismatched domain owner yields deny; IAM/AUDIT are not user-disableable.
- No owner-crossing table access, domain mutation, or database migration in this patch.

## Testing

- `npm test` (Node 22 with TypeScript strip-types enabled) runs the synthetic positive/negative cases. `npm run typecheck` covers `packages` and `platform` in strict TS mode.
- Cases: IAM-01 unauthenticated; IAM-02 wrong unit; IAM-03 guessed record; IAM-04 revoked relation; IAM-05 expired/unverified guardian; IAM-06 sensitive records; IAM-07 disabled module; IAM-08 synthetic valid read. Also audit outage, stale command binding, and redaction.
- Tests prove the **pure policy and simulated ports only**. NestJS HTTP runtime, authentic sessions, real PostgreSQL concurrency, audit durability, RLS/DB grants, production topology and realistic sensitive UAT are `NOT_RUN`.

## Deliberate HOLD boundaries / next slice

Before a real NestJS guard and PostgreSQL persistence integration: resolve/accept ADR-F0-TENANCY, ADR-F0-IAM-WALI and ADR-F0-PRIVACY-RETENTION (institution vs unit; authentication/session; legal guardian approval/scope; retention/audit), then select approved ORM or SQL migrations. Integrate NestJS as a transport adapter with runtime input validation; prevent clients from constructing evidence. Run real PostgreSQL negative IDOR tests, transaction/revocation tests and backup/restore rehearsal. No production permission grants, personal data, plugin execution, rapor publication or payment is authorized.

**Rollback:** revert this unmerged PR; it contains no irreversible schema/data changes. **Branch/release:** PR review and GitHub GAQI checks required, no auto-merge.

## Security review 2026-10-10

The F0 reference grants only record.read. Write, export and worker actions remain denied until action-specific policies are approved. Role evidence is bound to owner and module as well as record and unit. A guardian relationship is also module-bound. Missing revocation state and invalid runtime evidence fail closed. Seven new adversarial fixtures cover these safeguards. No production authentication, tenant resolution, persistent audit or database access is included; those remain HOLD.
