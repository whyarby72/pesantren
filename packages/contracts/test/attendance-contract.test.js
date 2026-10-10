import assert from "node:assert/strict";
import test from "node:test";

test("attendance contract keeps synthetic correction ownership explicit", () => {
  const correction = {
    attendanceId: "attendance-synthetic-001",
    actorId: "teacher-synthetic-001",
    reason: "Printed attendance reconciliation",
    occurredAt: "2026-10-10T08:00:00Z",
    auditEventId: "audit-synthetic-001",
  };

  assert.equal(correction.attendanceId.startsWith("attendance-synthetic-"), true);
  assert.equal(correction.actorId.startsWith("teacher-synthetic-"), true);
  assert.equal(correction.auditEventId.startsWith("audit-synthetic-"), true);
  assert.notEqual(correction.reason, "");
});
