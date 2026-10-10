import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyDemo, PRINCIPALS, MEETINGS, STUDENTS, attendanceKey, isAssigned, scopedRoster, saveDraft, submitDraft, previewCounts, DemoRuleError, scopeKey } from '../lib/attendance.ts';
const [wali2,wali3,guru,waka,mudir,admin]=PRINCIPALS;
const [combined,second,cancelled]=MEETINGS;
const base=()=>({principal:wali2,meeting:combined,classId:'2B',sourceRef:'ABS-2B-001',reason:'',changes:{'SIM-0001':'HADIR'},expectedRevisions:{'SIM-0001':0}});
const draft=()=>saveDraft(emptyDemo(),base());
const deny=(s,c,code)=>assert.throws(()=>saveDraft(s,c),e=>e instanceof DemoRuleError&&e.code===code);
test('only currently assigned wali kelas can input digitally',()=>{
 assert.equal(isAssigned(wali2,combined,'2B'),true);
 for(const principal of [wali3,guru,waka,mudir,admin,undefined]){
  assert.equal(isAssigned(principal,combined,'2B'),false);
  deny(emptyDemo(),{...base(),principal},'NO_ASSIGNMENT');
 }
});
test('senior organization rank never inherits wali kelas permission',()=>{
 for(const principal of [waka,mudir,admin])assert.equal(isAssigned(principal,combined,'2B'),false);
});
test('combined lesson preserves original classroom roster boundaries',()=>{
 assert.deepEqual(scopedRoster(combined,'2B').map(s=>s.id),['SIM-0001','SIM-0002','SIM-0003']);
 assert.deepEqual(scopedRoster(combined,'3B').map(s=>s.id),['SIM-0004','SIM-0005']);
 const first=draft();
 assert.equal(first.rows[attendanceKey(combined.id,'3B','SIM-0004')],undefined);
 deny(first,{...base(),changes:{'SIM-0004':'HADIR'},expectedRevisions:{'SIM-0004':0}},'OUTSIDE_EFFECTIVE_ROSTER');
});
test('same student can have distinct statuses in two KBM meetings same day',()=>{
 const one=draft();
 const two=saveDraft(one,{...base(),meeting:second,changes:{'SIM-0001':'PERLU_VERIFIKASI'}});
 assert.equal(two.rows[attendanceKey(combined.id,'2B','SIM-0001')].status,'HADIR');
 assert.equal(two.rows[attendanceKey(second.id,'2B','SIM-0001')].status,'PERLU_VERIFIKASI');
});
test('a cancelled meeting cannot record attendance or automatic absences',()=>{
 assert.equal(isAssigned(wali2,cancelled,'2B'),false);
 deny(emptyDemo(),{...base(),meeting:cancelled},'NO_ASSIGNMENT');
});
test('empty input stays BELUM_DICATAT and never implies ALPA',()=>{
 const s=emptyDemo();assert.deepEqual(previewCounts(s,combined,'2B'),{hadir:0,review:0,belum:3,total:3});
 const t=draft();assert.deepEqual(previewCounts(t,combined,'2B'),{hadir:1,review:0,belum:2,total:3});
});
test('paper reference is required and validated',()=>{
 deny(emptyDemo(),{...base(),sourceRef:''},'SOURCE_REF_REQUIRED');
 deny(emptyDemo(),{...base(),sourceRef:'../../private'},'SOURCE_REF_REQUIRED');
});
test('status not in proposal enumeration is denied atomically',()=>{
 deny(emptyDemo(),{...base(),changes:{'SIM-0001':'HADIR','SIM-0002':'ALPA'}},'INVALID_STATUS');
});
test('retry identical attendance is idempotent and creates no duplicate history',()=>{
 const a=draft();const b=saveDraft(a,{...base(),expectedRevisions:{'SIM-0001':1}});
 assert.equal(a,b); assert.equal(b.history.length,1);
});
test('correction requires reason and appends before/after audit entries',()=>{
 const a=draft();deny(a,{...base(),changes:{'SIM-0001':'PERLU_VERIFIKASI'},expectedRevisions:{'SIM-0001':1}},'CORRECTION_REASON_REQUIRED');
 const b=saveDraft(a,{...base(),changes:{'SIM-0001':'PERLU_VERIFIKASI'},expectedRevisions:{'SIM-0001':1},reason:'Koreksi dari lembar cetak'});
 assert.equal(b.history[1].before,'HADIR');assert.equal(b.history[1].after,'PERLU_VERIFIKASI');assert.equal(b.rows[attendanceKey('KBM-01','2B','SIM-0001')].revision,2);
});
test('stale revision is rejected without altering original state',()=>{
 const a=draft();deny(a,{...base(),changes:{'SIM-0001':'SAKIT_REVIEW'},reason:'Perbaikan di kertas'},'STALE_REVISION');
 assert.equal(a.history.length,1);
});
test('cannot erase recorded event by resetting to unrecorded',()=>{
 const a=draft();deny(a,{...base(),changes:{'SIM-0001':'BELUM_DICATAT'},expectedRevisions:{'SIM-0001':1}},'CANNOT_ERASE_RECORDED');
});
test('submit of incomplete roster is denied; submitted is never VERIFIED',()=>{
 const a=draft();assert.throws(()=>submitDraft(a,wali2,combined,'2B'),e=>e.code==='INCOMPLETE_ROSTER');
 let b=saveDraft(a,{...base(),changes:{'SIM-0002':'IZIN_REVIEW','SIM-0003':'PERLU_VERIFIKASI'},expectedRevisions:{'SIM-0002':0,'SIM-0003':0}});
 let c=submitDraft(b,wali2,combined,'2B');
 assert.equal(c.submitted[scopeKey('KBM-01','2B')],true);
 assert.equal(c.history.at(-1).action,'SUBMIT');
 assert.equal(submitDraft(c,wali2,combined,'2B'),c);
 deny(c,{...base(),changes:{'SIM-0001':'HADIR'},expectedRevisions:{'SIM-0001':1}},'SUBMITTED_LOCKED');
 assert.deepEqual(previewCounts(c,combined,'2B'),{hadir:1,review:2,belum:0,total:3});
});
test('unassigned actors cannot submit or view class through policy gate',()=>{
 const a=draft();for(const p of [wali3,guru,waka,mudir,admin])assert.throws(()=>submitDraft(a,p,combined,'2B'),e=>e.code==='NO_ASSIGNMENT');
});
test('revoked, wrong-term and inactive assignment cannot input',()=>{
 for(const assignments of [[],[{classId:'2B',termId:'WRONG',active:true}],[{classId:'2B',termId:combined.termId,active:false}]]){
  deny(emptyDemo(),{...base(),principal:{...wali2,assignments}},'NO_ASSIGNMENT');
 }
});
test('no leakage to other attendance contexts or non-roster students',()=>{
 deny(emptyDemo(),{...base(),changes:{'SIM-0999':'HADIR'},expectedRevisions:{}},'OUTSIDE_EFFECTIVE_ROSTER');
 assert.equal(STUDENTS.some(s=>s.id.startsWith('REAL-')),false);
});
