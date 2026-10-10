import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
const root = new URL('..',import.meta.url);
const read = p => readFileSync(new URL(p,root),'utf8');
test('only four canonical domains appear in navigation data',()=>{
 const m=read('lib/modules.ts');
 for(const x of ['akademik','ketahfizhan','kesantrian','keuangan'])assert.match(m,new RegExp(`key: '${x}'`));
 assert.equal((m.match(/key: '/g)||[]).length,4);
 assert.ok(!m.includes('key: \'wallet\''));
});
test('no real data placeholders or privileged actions presented as working',()=>{
 const p=read('app/page.tsx');
 assert.match(p,/data operasional/);
 assert.match(p,/Data belum tersedia/);
 assert.match(p,/autentikasi sebenarnya/);
 const m=read('app/[module]/page.tsx');
 assert.match(m,/fitur belum diaktifkan/);
 assert.match(m,/Belum tersedia pada F0/);
});
test('every sidebar main-domain href corresponds to route slug',()=>{
 assert.match(read('components/shell.tsx'),/href={`\/\$\{m.key\}`}/);
 assert.match(read('app/[module]/page.tsx'),/findModule\(key\)/);
});
test('standalone build, security headers and noindex are configured',()=>{
 assert.match(read('next.config.mjs'),/output: 'standalone'/);
 assert.match(read('next.config.mjs'),/X-Robots-Tag/);
 assert.match(read('app/layout.tsx'),/index:false,follow:false/);
});
test('no public interactive login or privileged API endpoint',()=>{
 const pages=readdirSync(new URL('app/',root));
 assert.ok(!pages.includes('api'));
 assert.ok(!read('app/page.tsx').includes('type="password"'));
});
