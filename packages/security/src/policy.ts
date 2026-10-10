/**
 * PLATFORM/IAM — F0 candidate policy kernel (not an institutional permission grant).
 * All evidence must be resolved server-side from trusted owners on every request.
 * No database schema, auth provider or tenancy topology is selected here.
 */
export type Action = 'record.read' | 'record.write' | 'record.export' | 'worker.run';
export type Classification = 'STANDARD' | 'SAFEGUARD' | 'HEALTH';
export type DomainOwner = 'SAN' | 'AKD' | 'THF' | 'FIN' | 'PLATFORM';

export interface Principal {
  readonly ref: string;
  readonly kind: 'staff' | 'guardian' | 'service';
  readonly active: boolean;
  readonly sessionValid: boolean;
  readonly roles: readonly string[];
}
export interface ResourceScope {
  readonly recordRef: string;
  readonly unitRef: string;
  readonly owner: DomainOwner;
  readonly classification: Classification;
  readonly moduleId: string;
  readonly published: boolean;
}
export interface ModuleEvidence {
  readonly moduleId: string;
  readonly owner: DomainOwner;
  readonly installed: boolean;
  readonly deployed: boolean;
  readonly enabled: boolean;
}
export interface RoleGrantEvidence {
  readonly principalRef: string;
  readonly recordRef: string;
  readonly role: string;
  readonly unitRef: string;
  readonly actions: readonly Action[];
  readonly validFrom: string;
  readonly validUntil?: string;
  readonly revoked: boolean;
}
/** SAN-owned relationship claim, not an IAM-owned child record. */
export interface GuardianEvidence {
  readonly guardianRef: string;
  readonly recordRef: string;
  readonly unitRef: string;
  readonly verification: 'VERIFIED' | 'PENDING' | 'DISPUTED';
  readonly actions: readonly Action[];
  readonly validFrom: string;
  readonly validUntil?: string;
  readonly revoked: boolean;
}
export interface PolicyContext {
  readonly principal: Principal | null;
  readonly action: Action;
  readonly resource: ResourceScope;
  readonly module: ModuleEvidence | null;
  readonly roleGrants: readonly RoleGrantEvidence[];
  readonly guardianRelations: readonly GuardianEvidence[];
  readonly now: string;
}
export type DenialCode =
  | 'UNAUTHENTICATED' | 'INVALID_CONTEXT' | 'MODULE_UNAVAILABLE'
  | 'SENSITIVE_POLICY_UNDECIDED' | 'NO_AUTHORITY' | 'NOT_PUBLISHED';
export type AccessDecision =
  | { readonly allowed: true; readonly code: 'ALLOW' }
  | { readonly allowed: false; readonly code: DenialCode };

const ACTIONS = new Set<Action>(['record.read', 'record.write', 'record.export', 'worker.run']);
const OWNERS = new Set<DomainOwner>(['SAN', 'AKD', 'THF', 'FIN', 'PLATFORM']);
const CLASSES = new Set<Classification>(['STANDARD', 'SAFEGUARD', 'HEALTH']);
const nonblank = (x: unknown): x is string => typeof x === 'string' && x.trim().length > 0;
function instant(value: unknown): number | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return null;
  const result = Date.parse(value);
  return Number.isFinite(result) && new Date(result).toISOString() ===
    value ? result : null;
}
function effective(now: number, start: string, end: string | undefined, revoked: boolean): boolean {
  const from = instant(start);
  const to = end === undefined ? undefined : instant(end);
  return !revoked && from !== null && from <= now &&
    (to === undefined || (to !== null && now < to)) &&
    (to === undefined || (to !== null && to > from));
}
const deny = (code: DenialCode): AccessDecision => ({ allowed: false, code });

export function evaluateAccess(ctx: PolicyContext): AccessDecision {
  const p = ctx.principal;
  if (!p || !p.active || !p.sessionValid || !nonblank(p.ref)) return deny('UNAUTHENTICATED');
  const r = ctx.resource;
  const now = instant(ctx.now);
  if (now === null || !ACTIONS.has(ctx.action) || !r ||
      !nonblank(r.recordRef) || !nonblank(r.unitRef) || !nonblank(r.moduleId) ||
      !OWNERS.has(r.owner) || !CLASSES.has(r.classification) ||
      typeof r.published !== 'boolean' || !Array.isArray(p.roles)) return deny('INVALID_CONTEXT');
  const m = ctx.module;
  if (!m || m.moduleId !== r.moduleId || m.owner !== r.owner || !m.installed || !m.deployed || !m.enabled)
    return deny('MODULE_UNAVAILABLE');
  // No implicit privileges for health, safeguarding, or technical administrators.
  if (r.classification !== 'STANDARD') return deny('SENSITIVE_POLICY_UNDECIDED');
  if (p.kind === 'guardian') {
    // Published-only SAN guardian read. Other owners require approved owner contracts.
    if (ctx.action !== 'record.read' || r.owner !== 'SAN') return deny('NO_AUTHORITY');
    if (!r.published) return deny('NOT_PUBLISHED');
    const authorized = ctx.guardianRelations.some(g =>
      g.guardianRef === p.ref && g.recordRef === r.recordRef && g.unitRef === r.unitRef &&
      g.verification === 'VERIFIED' && g.actions.includes(ctx.action) &&
      effective(now, g.validFrom, g.validUntil, g.revoked));
    return authorized ? { allowed: true, code: 'ALLOW' } : deny('NO_AUTHORITY');
  }
  if (p.kind !== 'staff' && p.kind !== 'service') return deny('NO_AUTHORITY');
  const authorized = ctx.roleGrants.some(g =>
    g.principalRef === p.ref && g.recordRef === r.recordRef && p.roles.includes(g.role) && g.unitRef === r.unitRef &&
    g.actions.includes(ctx.action) && effective(now, g.validFrom, g.validUntil, g.revoked));
  return authorized ? { allowed: true, code: 'ALLOW' } : deny('NO_AUTHORITY');
}

/** Explicitly omit actor, record reference, unit, relationship and content. */
export interface RedactedAuditEvent {
  readonly kind: 'IAM_ACCESS_DECISION';
  readonly action: Action;
  readonly owner: DomainOwner;
  readonly classification: Classification;
  readonly outcome: 'ALLOW' | 'DENY';
  readonly reason: string;
  readonly correlationRef: string;
}
export function toRedactedAudit(ctx: PolicyContext, decision: AccessDecision, correlationRef: string): RedactedAuditEvent {
  const safeCorrelation = /^[A-Za-z0-9_-]{6,96}$/.test(correlationRef) ? correlationRef : 'UNSPECIFIED';
  return {
    kind: 'IAM_ACCESS_DECISION', action: ctx.action, owner: ctx.resource.owner,
    classification: ctx.resource.classification, outcome: decision.allowed ? 'ALLOW' : 'DENY',
    reason: decision.code, correlationRef: safeCorrelation,
  };
}
