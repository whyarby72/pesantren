import test from 'node:test';
import assert from 'node:assert/strict';
import { classify, isProtectedChange, scanFile, scanTrackedFiles } from './ci.mjs';
import { summarizeJobs } from './usage-report.mjs';

test('only ordinary documentation skips workload (but not security and GAQI core)',()=>{
  assert.deepEqual(classify(['README.md','docs/how-to.md']).tests,false);
  assert.equal(classify(['README.md']).typecheck,false);
});
test('TS code requires full tests and typecheck',()=>{
  const r=classify(['packages/contracts/src/index.ts']);
  assert.equal(r.tests,true);assert.equal(r.typecheck,true);
});
test('JS, workflow and security files require tests',()=>{
  for(const f of ['src/main.js','.github/workflows/gaqi.yml','SECURITY.md','scripts/gaqi/ci.mjs']) assert.equal(classify([f]).tests,true);
});
test('workflow-only change avoids unnecessary tsc install',()=>{
  assert.equal(classify(['.github/workflows/gaqi.yml']).typecheck,false);
});
test('unknown or missing comparison fails closed',()=>{
  for(const x of [classify([],true),classify(['docs/readme.md'],false)]) {
    assert.equal(x.tests,true);assert.equal(x.typecheck,true);
  }
});
test('source documents never treated as harmless docs',()=>{
  assert.equal(isProtectedChange(['docs/product-sources/contract.md']),true);
  const c=classify(['docs/product-sources/contract.md']);assert.equal(c.mode,'protected-source-change');
});
test('raw credentials and secret filenames blocked',()=>{
  assert.match(scanFile('keys/server.pem','placeholder'),/filename/);
  assert.match(scanFile('README.md','-----BEGIN '+'OPENSSH PRIVATE KEY-----'),/secret/);
  assert.match(scanFile('sample.txt','AKIA'+'ABCDEFGHIJKLMNOP'),/secret/);
  assert.match(scanFile('sample.txt','ghp_'+'abcdefghijklmnopqrstuv'),/secret/);
});
test('normal synthetic text permitted; no secret echoed by scanner',()=>{
  assert.equal(scanFile('packages/demo.test.js', 'SIM-0001, STAF-001'),null);
  const actual=scanTrackedFiles(['a.txt'],()=> 'SAFE'); assert.equal(actual.length,0);
});
test('binary and overlarge files rejected for manual audit',()=>{
  assert.match(scanFile('thing.bin','abc\0def'),/binary/);
  assert.match(scanFile('thing.txt','x'.repeat(2*1024*1024+1)),/2 MiB/);
});
test('elapsed job runtime is distinguished from billed minutes',()=>{
  const s=summarizeJobs([{name:'ci',workflow_name:'GAQI',started_at:'2026-10-10T10:00:00Z',completed_at:'2026-10-10T10:01:03Z'}]);
  assert.equal(s.observedJobCount,1);assert.equal(s.elapsedMinutes,1.05);assert.equal(s.ceilingMinutesProxy,2);
  assert.match(s.note,/NOT official billed/i);
});
test('parallel jobs accumulate as separate runner durations',()=>{
  const job={name:'test',started_at:'2026-10-10T10:00:00Z',completed_at:'2026-10-10T10:02:00Z'};
  const s=summarizeJobs([job,{...job,name:'build'}]);assert.equal(s.elapsedMinutes,4);
});
test('malformed job timing is ignored',()=>{
  assert.equal(summarizeJobs([{name:'test',started_at:'bad',completed_at:'bad'}]).observedJobCount,0);
});
