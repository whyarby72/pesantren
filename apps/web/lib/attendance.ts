/**
 * AKD-04 / ATT-01,05,06 — synthetic, browser-memory prototype ONLY.
 * NOT an auth service, evidence store, reconciler or production attendance ledger.
 * AKD owns classes/schedules/assignments; SAN owns identity and approved leave;
 * PLATFORM/ATT owns verified attendance history after authorised reconciliation.
 */
export type DemoRole = 'WALI_KELAS' | 'GURU_CETAK' | 'WAKA_AKADEMIK' | 'MUDIR' | 'SUPER_ADMIN';
export type ClassId = '2B' | '3B';
export type AttendanceStatus = 'BELUM_DICATAT' | 'HADIR' | 'TERLAMBAT_REVIEW' | 'IZIN_REVIEW' | 'SAKIT_REVIEW' | 'TIDAK_HADIR_REVIEW' | 'PERLU_VERIFIKASI';
export type RecordedStatus = Exclude<AttendanceStatus, 'BELUM_DICATAT'>;
export type MeetingState = 'SCHEDULED' | 'CANCELLED';
export type Principal = { readonly ref: string; readonly role: DemoRole; readonly assignments: readonly { readonly classId: ClassId; readonly termId: string; readonly active: boolean }[] };
export type Meeting = { readonly id: string; readonly termId: string; readonly date: string; readonly time: string; readonly subject: string; readonly classIds: readonly ClassId[]; readonly state: MeetingState; readonly paperNote: string };
export type Student = { readonly id: string; readonly classId: ClassId; readonly termId: string; readonly alias: string };
export type AttendanceRow = { readonly key: string; readonly meetingId: string; readonly classId: ClassId; readonly studentId: string; readonly status: RecordedStatus; readonly sourceRef: string; readonly revision: number };
export type AuditChange = { readonly sequence: number; readonly action: 'TRANSCRIBE' | 'CORRECT' | 'SUBMIT'; readonly meetingId: string; readonly classId: ClassId; readonly studentId: string | null; readonly actorRef: string; readonly before: RecordedStatus | null; readonly after: RecordedStatus | null; readonly sourceRef: string; readonly reason: string };
export type DemoState = { readonly rows: Readonly<Record<string, AttendanceRow>>; readonly submitted: Readonly<Record<string, boolean>>; readonly history: readonly AuditChange[] };
export const TERM_ID = 'DEMO-2026-S1';
export const PRINCIPALS: readonly Principal[] = [
 { ref: 'WALI-2B', role: 'WALI_KELAS', assignments: [{ classId: '2B', termId: TERM_ID, active: true }] },
 { ref: 'WALI-3B', role: 'WALI_KELAS', assignments: [{ classId: '3B', termId: TERM_ID, active: true }] },
 { ref: 'GURU-CETAK', role: 'GURU_CETAK', assignments: [] },
 { ref: 'WAKA', role: 'WAKA_AKADEMIK', assignments: [] },
 { ref: 'MUDIR', role: 'MUDIR', assignments: [] },
 { ref: 'SUPER-ADMIN', role: 'SUPER_ADMIN', assignments: [] },
];
export const MEETINGS: readonly Meeting[] = [
 { id: 'KBM-01', termId: TERM_ID, date: '2026-07-06', time: '07.00–07.45', subject: 'Fiqih · sesi gabungan', classIds: ['2B','3B'], state: 'SCHEDULED', paperNote: 'Satu sesi KBM; daftar peserta tetap dipisah per kelas asal.' },
 { id: 'KBM-02', termId: TERM_ID, date: '2026-07-06', time: '08.00–08.45', subject: 'Bahasa Arab', classIds: ['2B'], state: 'SCHEDULED', paperNote: 'Pertemuan kedua pada hari yang sama.' },
 { id: 'KBM-03', termId: TERM_ID, date: '2026-07-06', time: '09.00–09.45', subject: 'Jadwal batal (contoh)', classIds: ['2B'], state: 'CANCELLED', paperNote: 'Pertemuan dibatalkan; tidak boleh menghasilkan absen otomatis.' },
 { id: 'KBM-04', termId: TERM_ID, date: '2026-07-07', time: '07.00–07.45', subject: 'Matematika', classIds: ['3B'], state: 'SCHEDULED', paperNote: 'Contoh pertemuan khusus kelas 3B.' },
];
export const STUDENTS: readonly Student[] = [
 { id: 'SIM-0001', alias: 'Peserta sintetis 01', classId: '2B', termId: TERM_ID },
 { id: 'SIM-0002', alias: 'Peserta sintetis 02', classId: '2B', termId: TERM_ID },
 { id: 'SIM-0003', alias: 'Peserta sintetis 03', classId: '2B', termId: TERM_ID },
 { id: 'SIM-0004', alias: 'Peserta sintetis 04', classId: '3B', termId: TERM_ID },
 { id: 'SIM-0005', alias: 'Peserta sintetis 05', classId: '3B', termId: TERM_ID },
];
export const ATTENDANCE_CHOICES: readonly {readonly value:AttendanceStatus;readonly label:string}[] = [
 {value:'BELUM_DICATAT',label:'Belum dicatat'},
 {value:'HADIR',label:'Hadir (input kertas)'},
 {value:'TERLAMBAT_REVIEW',label:'Terlambat · perlu review'},
 {value:'IZIN_REVIEW',label:'Izin · perlu rekonsiliasi'},
 {value:'SAKIT_REVIEW',label:'Sakit · perlu rekonsiliasi'},
 {value:'TIDAK_HADIR_REVIEW',label:'Tidak hadir · perlu verifikasi'},
 {value:'PERLU_VERIFIKASI',label:'Data kertas tidak jelas'},
];
const VALUES = new Set<AttendanceStatus>(ATTENDANCE_CHOICES.map(x=>x.value));
const isNonempty = (x: unknown): x is string => typeof x === 'string' && x.trim().length > 0;
export function emptyDemo(): DemoState { return { rows: {}, submitted: {}, history: [] }; }
export function attendanceKey(meetingId:string,classId:ClassId,studentId:string):string { return [meetingId,classId,studentId].join('::'); }
export function scopeKey(meetingId:string,classId:ClassId):string { return [meetingId,classId].join('::'); }
export function isAssigned(principal:Principal|undefined, meeting:Meeting|undefined, classId:ClassId):boolean {
 return Boolean(principal && principal.role === 'WALI_KELAS' && isNonempty(principal.ref) && meeting &&
    meeting.state === 'SCHEDULED' && meeting.classIds.includes(classId) &&
    principal.assignments.some(a=>a.active === true && a.classId === classId && a.termId === meeting.termId));
}
export function scopedRoster(meeting:Meeting|undefined,classId:ClassId):readonly Student[] {
 return meeting && meeting.classIds.includes(classId) ? STUDENTS.filter(s=>s.classId === classId && s.termId === meeting.termId) : [];
}
export class DemoRuleError extends Error { readonly code:string; constructor(code: string){ super(code); this.code=code; this.name='DemoRuleError'; } }
const fail = (code:string):never => {throw new DemoRuleError(code);};
export type DraftCommand = { readonly principal:Principal|undefined; readonly meeting:Meeting|undefined; readonly classId:ClassId; readonly sourceRef:string; readonly reason:string; readonly changes:Readonly<Record<string,AttendanceStatus>>; readonly expectedRevisions:Readonly<Record<string,number>>; };
/** Atomic in-memory transition: validate the entire batch before committing any row/event. */
export function saveDraft(state:DemoState,cmd:DraftCommand):DemoState {
 const {principal,meeting,classId,sourceRef,reason,changes,expectedRevisions}=cmd;
 if(!isAssigned(principal,meeting,classId) || !meeting || !principal) return fail('NO_ASSIGNMENT');
 if(state.submitted[scopeKey(meeting.id,classId)]) return fail('SUBMITTED_LOCKED');
 if(!/^[A-Z0-9][A-Z0-9_-]{3,39}$/.test(sourceRef.trim())) return fail('SOURCE_REF_REQUIRED');
 const roster=scopedRoster(meeting,classId);
 const allowed=new Set(roster.map(s=>s.id));
 if(!changes || typeof changes!=='object' || Array.isArray(changes) ||
    Object.keys(changes).some(id=>!allowed.has(id))) return fail('OUTSIDE_EFFECTIVE_ROSTER');
 let nextRows:Record<string,AttendanceRow>={...state.rows};
 const toAppend:AuditChange[]=[];
 for(const [studentId,status] of Object.entries(changes)){
   if(!VALUES.has(status)) return fail('INVALID_STATUS');
   const key=attendanceKey(meeting.id,classId,studentId),current=state.rows[key];
   if((expectedRevisions[studentId]??0)!==(current?.revision??0)) return fail('STALE_REVISION');
   if(status==='BELUM_DICATAT') {
     if(current) return fail('CANNOT_ERASE_RECORDED');
     continue;
   }
   if(current?.status===status) continue; // Duplicate request is idempotent.
   if(current && (!isNonempty(reason) || reason.trim().length<4)) return fail('CORRECTION_REASON_REQUIRED');
   const nextRevision=(current?.revision??0)+1;
   nextRows[key]={key,meetingId:meeting.id,classId,studentId,status,sourceRef:sourceRef.trim(),revision:nextRevision};
   toAppend.push({sequence:state.history.length+toAppend.length+1,action:current?'CORRECT':'TRANSCRIBE',meetingId:meeting.id,classId,studentId,actorRef:principal.ref,before:current?.status??null,after:status,sourceRef:sourceRef.trim(),reason:current?reason.trim():''});
 }
 if(toAppend.length===0)return state;
 return { rows:nextRows, submitted:state.submitted, history:[...state.history,...toAppend] };
}
/** SUBMITTED is NOT VERIFIED; no output from this reference is official attendance. */
export function submitDraft(state:DemoState, principal:Principal|undefined, meeting:Meeting|undefined, classId:ClassId):DemoState {
 if(!isAssigned(principal,meeting,classId)||!principal||!meeting) return fail('NO_ASSIGNMENT');
 const scope=scopeKey(meeting.id,classId);
 if(state.submitted[scope])return state;
 const roster=scopedRoster(meeting,classId);
 if(!roster.length || roster.some(s=>!state.rows[attendanceKey(meeting.id,classId,s.id)]))return fail('INCOMPLETE_ROSTER');
 return { rows:state.rows,submitted:{...state.submitted,[scope]:true},history:[...state.history,{sequence:state.history.length+1,action:'SUBMIT',meetingId:meeting.id,classId,studentId:null,actorRef:principal.ref,before:null,after:null,sourceRef:'PAPER_REFERENCE_ON_ROWS',reason:''}] };
}
/** A non-official preview; unresolved entries NEVER count as ALPA. */
export function previewCounts(state:DemoState,meeting:Meeting|undefined,classId:ClassId){
 const roster=scopedRoster(meeting,classId);
 let hadir=0,review=0,belum=0;
 for(const s of roster){ const status=state.rows[attendanceKey(meeting!.id,classId,s.id)]?.status;
  if(status==='HADIR')hadir++;else if(status)review++;else belum++;
 }
 return {hadir,review,belum,total:roster.length};
}
