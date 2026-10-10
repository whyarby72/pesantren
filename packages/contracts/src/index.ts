export const CORE_DOMAINS = ["AKD", "THF", "SAN", "FIN"] as const;

export type CoreDomain = (typeof CORE_DOMAINS)[number];

export type AttendanceSession = {
  sessionId: string;
  academicYearId: string;
  semesterId: string;
  classIds: readonly string[];
  startsAt: string;
  durationMinutes: number;
};

export type AttendanceCorrection = {
  attendanceId: string;
  actorId: string;
  reason: string;
  occurredAt: string;
  auditEventId: string;
};
