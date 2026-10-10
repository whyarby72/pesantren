'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shell } from '../../../components/shell';
import { Icon } from '../../../components/icon';
import {
  ATTENDANCE_CHOICES, MEETINGS, PRINCIPALS, TERM_ID,
  attendanceKey, emptyDemo, isAssigned, previewCounts, saveDraft,
  scopedRoster, scopeKey, submitDraft, type ClassId, type AttendanceStatus,
  type DemoState,
} from '../../../lib/attendance';
import './attendance.css';

const ROLE_LABELS: Record<string,string> = {
 'WALI-2B':'Wali Kelas 2B · demo', 'WALI-3B':'Wali Kelas 3B · demo',
 'GURU-CETAK':'Guru mapel · hanya kertas', 'WAKA':'Waka Akademik · tanpa grant input',
 'MUDIR':'Mudir · tanpa grant input', 'SUPER-ADMIN':'Super Admin · tanpa grant input'
};
const ERRORS:Record<string,string> = {
 NO_ASSIGNMENT:'Simulasi menolak input: peran, kelas, periode, atau jadwal tidak sesuai penugasan.',
 SUBMITTED_LOCKED:'Sesi yang sudah dikirim terkunci. Koreksi pascakirim menunggu SOP dan kewenangan resmi.',
 SOURCE_REF_REQUIRED:'Tuliskan kode lembar cetak, 4–40 karakter (huruf besar/angka/-/_).',
 OUTSIDE_EFFECTIVE_ROSTER:'Ada peserta yang bukan anggota kelas/periode ini.',
 INVALID_STATUS:'Status tidak dikenali.',
 STALE_REVISION:'Versi catatan sudah berubah. Muat ulang status sebelum memperbaikinya.',
 CORRECTION_REASON_REQUIRED:'Setelah catatan tersimpan, perubahan status memerlukan alasan koreksi minimal 4 karakter.',
 CANNOT_ERASE_RECORDED:'Status tersimpan tidak boleh dihapus menjadi belum dicatat.',
 INCOMPLETE_ROSTER:'Semua peserta perlu diberi status atau “Data kertas tidak jelas” sebelum mengirim draf.'
};

export default function AcademicAttendancePreview() {
 const [actorRef,setActorRef]=useState('WALI-2B');
 const [classId,setClassId]=useState<ClassId>('2B');
 const [meetingId,setMeetingId]=useState('KBM-01');
 const [paperRef,setPaperRef]=useState('ABS-2B-001');
 const [reason,setReason]=useState('');
 const [pending,setPending]=useState<Record<string,AttendanceStatus>>({});
 const [demo,setDemo]=useState<DemoState>(emptyDemo);
 const [message,setMessage]=useState('Pilih status berdasarkan lembar cetak fiktif, lalu simpan draf.');
 const [noticeTone,setNoticeTone]=useState<'normal'|'error'|'success'>('normal');
 const actor=PRINCIPALS.find(p=>p.ref===actorRef);
 const meeting=MEETINGS.find(m=>m.id===meetingId);
 const allowed=isAssigned(actor,meeting,classId);
 const roster=allowed?scopedRoster(meeting,classId):[];
 const summary=allowed?previewCounts(demo,meeting,classId):null;
 const submitted=Boolean(meeting && demo.submitted[scopeKey(meeting.id,classId)]);
 const scopeMeetings=MEETINGS.filter(m=>m.classIds.includes(classId));
 const events=meeting?demo.history.filter(h=>h.meetingId===meeting.id&&h.classId===classId).slice(-5).reverse():[];
 const getSelection=(id:string):AttendanceStatus=>pending[attendanceKey(meetingId,classId,id)]??demo.rows[attendanceKey(meetingId,classId,id)]?.status??'BELUM_DICATAT';
 const hasUnsaved=roster.some(r=>getSelection(r.id)!==(demo.rows[attendanceKey(meetingId,classId,r.id)]?.status??'BELUM_DICATAT'));
 const showMessage=(body:string,tone:'normal'|'error'|'success')=>{setMessage(body);setNoticeTone(tone);};
 function handleSave(){
  if(!meeting){showMessage('Pilih pertemuan yang tersedia.','error');return;}
  const changes:Record<string,AttendanceStatus>={}; const expectedRevisions:Record<string,number>={};
  for(const person of roster){
    const key=attendanceKey(meeting.id,classId,person.id);
    const status=getSelection(person.id);
    if(status!==(demo.rows[key]?.status??'BELUM_DICATAT')) {
      changes[person.id]=status;expectedRevisions[person.id]=demo.rows[key]?.revision??0;
    }
  }
  if(Object.keys(changes).length===0){showMessage('Tidak ada perubahan baru untuk disimpan.','normal');return;}
  try {
   const updated=saveDraft(demo,{principal:actor,meeting,classId,changes,expectedRevisions,sourceRef:paperRef.trim(),reason});
   setDemo(updated);
   setPending(prev=>{const copy={...prev};for(const id of Object.keys(changes))delete copy[attendanceKey(meeting.id,classId,id)];return copy;});
   setReason('');showMessage('Draf simulasi tersimpan di memori halaman ini saja. Belum dikirim ke server.','success');
  } catch(e){const code=e instanceof Error?e.message:'INVALID_STATUS';showMessage(ERRORS[code]??'Input ditolak oleh aturan simulasi.','error');}
 }
 function handleSubmit(){
  try{
   if(hasUnsaved){showMessage('Simpan perubahan draf dahulu sebelum mengirim.','error');return;}
   const updated=submitDraft(demo,actor,meeting,classId);
   setDemo(updated);showMessage('Draf simulasi ditandai SUBMITTED dan terkunci. BUKAN absensi terverifikasi.','success');
  }catch(e){const code=e instanceof Error?e.message:'NO_ASSIGNMENT';showMessage(ERRORS[code]??'Pengiriman simulasi ditolak.','error');}
 }
 function switchClass(value:ClassId){
  setClassId(value);setMeetingId(value==='2B'?'KBM-01':'KBM-01');
  setPaperRef(value==='2B'?'ABS-2B-001':'ABS-3B-001');showMessage('Pilih sesi dan cocokkan dengan lembar cetak.','normal');
 }
 return <Shell active="akademik">
  <div className="attendance-page">
   <div className="at-breadcrumb"><Link href="/akademik">Akademik</Link><span>›</span><strong>Absensi kehadiran</strong></div>
   <div className="at-header"><div><div className="page-eyebrow"><span className="eyebrow-dot"/> AKD-04 · ATT-01/05/06</div><h1>Absensi Kehadiran Akademik</h1><p>Transkripsi absensi jam pelajaran dari lembar cetak guru oleh wali kelas yang ditugaskan.</p></div><span className="at-preview-tag">Pratinjau sintetis · Tidak resmi</span></div>
   <div className="at-disclaimer" role="note"><Icon name="shield" size={21}/><div><strong>Simulasi tanpa login, tanpa database, tanpa penyimpanan permanen.</strong><p>Semua identitas di halaman ini fiktif. Peran yang dipilih bukan autentikasi. Jangan masukkan nama santri, nomor identitas, keterangan medis, atau data pribadi nyata.</p></div></div>
   <div className="at-steps" aria-label="Alur absensi akademik"><div><span>01</span> Guru mengisi lembar cetak</div><div><span>02</span> Wali kelas input digital</div><div><span>03</span> Draft / Submitted</div><div><span>04</span> Rekonsiliasi resmi <em>belum tersedia</em></div></div>
   <section className="at-panel at-selectors" aria-label="Konteks input">
    <div className="at-section-head"><div><span className="section-kicker">01 · PILIH KONTEKS</span><h2>Kelas dan pertemuan KBM</h2></div><span className="at-term">Semester demo: {TERM_ID}</span></div>
    <div className="at-selector-grid">
     <label>Peran simulasi <small>(bukan login)</small><select value={actorRef} onChange={e=>{setActorRef(e.target.value);showMessage('Penugasan digital dievaluasi ulang.','normal');}}>{PRINCIPALS.map(p=><option key={p.ref} value={p.ref}>{ROLE_LABELS[p.ref]}</option>)}</select></label>
     <label>Kelas asal<select value={classId} onChange={e=>switchClass(e.target.value as ClassId)}><option value="2B">Kelas 2B</option><option value="3B">Kelas 3B</option></select></label>
     <label>Pertemuan / jadwal<select value={meetingId} onChange={e=>{setMeetingId(e.target.value);showMessage('Pertemuan berganti. Periksa lembar cetak.','normal');}}>{scopeMeetings.map(m=><option key={m.id} value={m.id}>{m.date} · {m.time} · {m.subject}</option>)}</select></label>
    </div>
    {meeting&&<div className="at-meeting-summary"><div><strong>{meeting.subject}</strong><span>{meeting.date} · {meeting.time} · Kelas {meeting.classIds.join(' + ')}</span></div><span className={`at-chip ${meeting.state==='CANCELLED'?'at-chip-red':'at-chip-green'}`}>{meeting.state==='CANCELLED'?'Sesi dibatalkan':'Jadwal simulasi'}</span></div>}
    {meeting?.classIds.length===2&&<p className="at-helper">Jadwal gabungan: pertemuan yang sama dipakai kelas 2B dan 3B, tetapi roster dan catatan tetap dipisahkan berdasarkan kelas asal.</p>}
   </section>
   {!allowed?<div className="at-panel at-denied" role="alert"><Icon name="lock" size={29}/><div><h2>Input digital tidak tersedia untuk konteks ini</h2><p>Hanya wali kelas yang mempunyai penugasan aktif pada kelas dan periode ini dapat menginput. Guru mata pelajaran tetap memakai lembar cetak. Waka, Mudir, dan Super Admin tidak otomatis mewarisi izin input.</p><strong>Ini ilustrasi pembatasan; keamanan sesungguhnya harus ditegakkan oleh backend IAM.</strong></div></div>:
   <div className="at-workspace"><div className="at-primary">
    <section className="at-panel"><div className="at-section-head"><div><span className="section-kicker">02 · TRANSKRIPSI DARI KERTAS</span><h2>Daftar kehadiran kelas {classId}</h2></div><span className={`at-chip ${submitted?'at-chip-gold':'at-chip-soft'}`}>{submitted?'SUBMITTED · BELUM VERIFIED':'DRAFT · LOKAL'}</span></div>
    <div className="at-paper-row"><label>Kode referensi lembar cetak <input type="text" spellCheck={false} autoCapitalize="characters" maxLength={40} value={paperRef} disabled={submitted} onChange={e=>setPaperRef(e.target.value.toUpperCase())} placeholder="ABS-2B-001"/></label><span>{meeting?.paperNote}</span></div>
    <div className="at-table-scroll"><table className="at-table"><thead><tr><th scope="col">Peserta demo</th><th scope="col">Keterangan dari kertas</th><th scope="col">Riwayat</th></tr></thead><tbody>{roster.map((student,index)=>{
      const key=attendanceKey(meetingId,classId,student.id), row=demo.rows[key];
      return <tr key={student.id}><td><div className="at-student"><span className="at-student-number">{String(index+1).padStart(2,'0')}</span><div><strong>{student.alias}</strong><small>{student.id} · Kelas {classId}</small></div></div></td><td><label className="at-row-label" htmlFor={`status-${student.id}`}>Kehadiran {student.alias}</label><select id={`status-${student.id}`} value={getSelection(student.id)} disabled={submitted} onChange={e=>setPending(prev=>({...prev,[key]:e.target.value as AttendanceStatus}))}>{ATTENDANCE_CHOICES.map(option=><option key={option.value} value={option.value} disabled={Boolean(row)&&option.value==='BELUM_DICATAT'}>{option.label}</option>)}</select></td><td><span className="at-revision">{row?`v${row.revision} · Draft`:'Belum dicatat'}</span></td></tr>;
    })}</tbody></table></div>
    <p className="at-inline-warning">Tidak hadir, terlambat, izin, dan sakit pada tahap ini hanya <strong>perlu verifikasi/rekonsiliasi</strong>. Tidak ada penetapan alpa otomatis.</p>
    <label className="at-reason">Alasan koreksi <small>(wajib bila mengubah status yang pernah tersimpan)</small><input type="text" value={reason} disabled={submitted} maxLength={140} onChange={e=>setReason(e.target.value)} placeholder="Contoh: Koreksi sesuai lembar cetak"/></label>
    <div className="at-actions"><button className="at-primary-button" type="button" onClick={handleSave} disabled={submitted}>Simpan draf sementara</button><button className="at-outline-button" type="button" onClick={handleSubmit} disabled={submitted}>Kirim draf simulasi</button></div>
    <div className={`at-message ${noticeTone==='error'?'at-message-error':noticeTone==='success'?'at-message-success':''}`} role="status" aria-live="polite">{message}</div>
    <p className="at-local-note">Data demo hanya disimpan di memori tab ini dan akan hilang saat refresh. Tombol kirim <strong>tidak mengirim ke server</strong> dan tidak membuat kehadiran resmi.</p>
    </section>
   </div><aside className="at-aside">
    <section className="at-panel"><span className="section-kicker">03 · RINGKASAN DRAFT</span><h2>Rekap pertemuan</h2><div className="at-count-grid"><div><strong>{summary?.total??0}</strong><small>Peserta fiktif</small></div><div><strong>{summary?.hadir??0}</strong><small>Input hadir</small></div><div><strong>{summary?.review??0}</strong><small>Perlu review</small></div><div><strong>{summary?.belum??0}</strong><small>Belum dicatat</small></div></div><p className="at-card-note">Bukan hasil verifikasi ATT dan tidak boleh digunakan untuk rapor, sanksi, atau pengambilan keputusan.</p></section>
    <section className="at-panel"><span className="section-kicker">04 · JEJAK PERUBAHAN</span><h2>Riwayat simulasi</h2>{events.length?<ol className="at-history">{events.map(e=><li key={e.sequence}><span className="at-history-dot"/><div><strong>{e.action==='SUBMIT'?'Draft dikirim':e.action==='CORRECT'?'Koreksi status':'Transkripsi awal'}</strong><small>#{e.sequence} · {e.studentId??`Kelas ${e.classId}`} · {e.actorRef}</small><p>{e.before?`${e.before} → `:''}{e.after??'SUBMITTED'}</p>{e.reason&&<span>Alasan: {e.reason}</span>}</div></li>)}</ol>:<p className="at-empty-history">Belum ada perubahan tersimpan pada pertemuan ini.</p>}<p className="at-card-note">Jejak ini hanya berada di memori browser, bukan audit persisten.</p></section>
   </aside></div>}
   <div className="at-endnote"><Icon name="info" size={18}/><div><strong>Persyaratan sebelum absensi operasional</strong><p>Perlu autentikasi nyata, otorisasi server berdasarkan penugasan, database PostgreSQL, audit persisten, rekonsiliasi izin SAN, SOP koreksi dan verifikasi, serta uji concurrency dan recovery. Pengguna riil tidak dapat diaktifkan melalui halaman demo ini.</p></div></div>
  </div>
 </Shell>;
}
