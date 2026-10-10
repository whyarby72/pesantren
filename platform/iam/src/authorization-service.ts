import { evaluateAccess, toRedactedAudit } from '../../../packages/security/src/policy.ts';
import type { AccessDecision, PolicyContext, RedactedAuditEvent } from '../../../packages/security/src/policy.ts';

/** Implement using trusted IAM/SAN owners only; never populate from request body. */
export interface FreshEvidencePort {
  loadFreshContext(command: AuthorizedCommand): Promise<PolicyContext>;
}
/** A durable, redacted audit adapter is required before access is granted. */
export interface AuditPort {
  append(event: RedactedAuditEvent): Promise<void>;
}
export interface AuthorizedCommand {
  readonly opaquePrincipalRef: string;
  readonly opaqueRecordRef: string;
  readonly action: PolicyContext['action'];
  readonly correlationRef: string;
}

/** F0 adapter for NestJS guards/use-cases; no HTTP/JWT/session provider assumed. */
export class AuthorizationService {
  private readonly evidence: FreshEvidencePort;
  private readonly audit: AuditPort;
  constructor(evidence: FreshEvidencePort, audit: AuditPort) {
    this.evidence = evidence;
    this.audit = audit;
  }

  async authorize(command: AuthorizedCommand): Promise<AccessDecision> {
    try {
      const context = await this.evidence.loadFreshContext(command);
      // A live adapter must bind loaded evidence to this exact trusted command.
      if (!context.principal || context.principal.ref !== command.opaquePrincipalRef ||
          context.resource.recordRef !== command.opaqueRecordRef || context.action !== command.action) {
        return { allowed: false, code: 'INVALID_CONTEXT' };
      }
      const decision = evaluateAccess(context);
      await this.audit.append(toRedactedAudit(context, decision, command.correlationRef));
      return decision;
    } catch {
      // Evidence/audit outages never result in an allow or expose sensitive exception detail.
      return { allowed: false, code: 'INVALID_CONTEXT' };
    }
  }
}
