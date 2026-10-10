import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
test('AKD module and sidebar link to dedicated per-meeting attendance preview',()=>{
 assert.match(read('app/[module]/page.tsx'),/href="\/akademik\/absensi"/);
 assert.match(read('components/shell.tsx'),/href="\/akademik\/absensi"/);
 assert.match(read('app/page.tsx'),/href="\/akademik\/absensi"/);
});
test('attendance view prominently explains in-memory synthetic scope and no backend authorization',()=>{
 const p=read('app/akademik/absensi/page.tsx');
 for(const fragment of ['Pratinjau sintetis','tanpa login','tanpa database','tidak mengirim ke server','bukan autentikasi','Guru mata pelajaran'])assert.ok(p.toLowerCase().includes(fragment.toLowerCase()),fragment);
});
test('attendance view offers paper source, correction reason and submit workflow',()=>{
 const p=read('app/akademik/absensi/page.tsx');
 for(const fragment of ['Kode referensi lembar cetak','Alasan koreksi','Simpan draf sementara','Kirim draf simulasi','Kelas asal','Pertemuan / jadwal'])assert.ok(p.includes(fragment),fragment);
});
test('attendance logic is separate from API and cannot write production records',()=>{
 const p=read('lib/attendance.ts');
 assert.ok(!/fetch\(|axios|prisma|localStorage|document\.cookie|indexedDB/.test(p));
 assert.match(p,/submitted.*NOT VERIFIED|SUBMITTED is NOT VERIFIED/);
});
