import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAccess } from '../src/policy.ts';

const ctx = () => ({
  principal:{ref:'synthetic-worker-1', kind:'staff',active:true,sessionValid:true,roles:['REGISTRAR']},
  action:'record.read',
  resource:{recordRef:'synthetic-001', unitRef:'synthetic-campus', owner:'SAN',classification:'STANDARD', moduleId:'core.kesantrian',published:true},
  module:{moduleId:'core.kesantrian',owner:'SAN', installed:true, deployed:true, enabled:true},
  roleGrants:[{owner:'SAN',moduleId:'core.kesantrian',principalRef:'synthetic-worker-1',recordRef:'synthetic-001',role:'REGISTRAR',unitRef:'synthetic-campus',actions:['record.read'],validFrom:'2026-01-01T00:00:00.000Z',revoked:false}],
  guardianRelations:[], now:'2026-10-10T11:00:00.000Z'
});
const deny = x => assert.deepEqual(evaluateAccess(x).allowed,false);

test('a SAN grant cannot be reused for a FIN record with colliding scoped identifier',()=>{
 const base=ctx();
 deny({...base,resource:{...base.resource,owner:'FIN',moduleId:'core.keuangan'},module:{...base.module,owner:'FIN',moduleId:'core.keuangan'}});
});
test('a SAN grant cannot be reused across distinct SAN modules on same record ref',()=>{
 const base=ctx();
 deny({...base,resource:{...base.resource,moduleId:'core.kesantrian.archive'},module:{...base.module,moduleId:'core.kesantrian.archive'}});
});
test('absent revocation field must fail closed',()=>{
 const base=ctx(); const {revoked,...invalid}=base.roleGrants[0];
 deny({...base,roleGrants:[invalid]});
});
test('malformed active/session booleans must fail closed',()=>{
 const base=ctx(); deny({...base,principal:{...base.principal,active:'true'}});
 deny({...base,principal:{...base.principal,sessionValid:'true'}});
});
test('invalid role grant and relation containers fail closed without uncaught exception',()=>{
 const base=ctx();
 deny({...base,roleGrants:null});
 deny({...base,roleGrants:[null]});
 const guardian={...base,principal:{...base.principal,kind:'guardian'},guardianRelations:[null],roleGrants:[]};
 deny(guardian);
});

test('guardian link is never inherited by another SAN module on same record ref',()=>{
  const base=ctx();
  const guardian={...base,principal:{...base.principal,kind:'guardian'},roleGrants:[],guardianRelations:[{moduleId:'core.kesantrian',guardianRef:'synthetic-worker-1',recordRef:'synthetic-001',unitRef:'synthetic-campus',verification:'VERIFIED',actions:['record.read'],validFrom:'2026-01-01T00:00:00.000Z',revoked:false}]};
  deny({...guardian,resource:{...base.resource,moduleId:'core.kesantrian.portal'},module:{...base.module,moduleId:'core.kesantrian.portal'}});
  const {revoked,...noRevocation}=guardian.guardianRelations[0];
  deny({...guardian,guardianRelations:[noRevocation]});
});
test('high-risk write/export and worker permissions remain denied pending approved contracts',()=>{
  const base=ctx();
  for(const action of ['record.write','record.export','worker.run']) {
    deny({...base,action,roleGrants:[{...base.roleGrants[0],actions:[action]}]});
  }
});
