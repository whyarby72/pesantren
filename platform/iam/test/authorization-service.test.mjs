import test from 'node:test';
import assert from 'node:assert/strict';
import {AuthorizationService} from '../src/authorization-service.ts';
const cmd={opaquePrincipalRef:'synthetic-actor-a',opaqueRecordRef:'synthetic-record-a',action:'record.read',correlationRef:'synthetic-correlation'};
const evidence={principal:{ref:cmd.opaquePrincipalRef,kind:'staff',active:true,sessionValid:true,roles:['SYNTHETIC_STAFF']},action:cmd.action,resource:{recordRef:cmd.opaqueRecordRef,unitRef:'synthetic-unit-a',owner:'SAN',classification:'STANDARD',moduleId:'core.kesantrian',published:true},module:{moduleId:'core.kesantrian',owner:'SAN',installed:true,deployed:true,enabled:true},roleGrants:[{owner:'SAN',moduleId:'core.kesantrian',principalRef:cmd.opaquePrincipalRef,recordRef:cmd.opaqueRecordRef,role:'SYNTHETIC_STAFF',unitRef:'synthetic-unit-a',actions:['record.read'],validFrom:'2026-01-01T00:00:00.000Z',revoked:false}],guardianRelations:[],now:'2026-10-10T10:00:00.000Z'};
test('fresh evidence and successful audit required before allow',async()=>{
 const entries=[];const svc=new AuthorizationService({loadFreshContext:async()=>evidence},{append:async e=>{entries.push(e)}});
 assert.equal((await svc.authorize(cmd)).allowed,true);
 assert.equal(entries.length,1);assert.equal(entries[0].outcome,'ALLOW');
});
test('audit outage must fail closed',async()=>{
 const svc=new AuthorizationService({loadFreshContext:async()=>evidence},{append:async()=>{throw Error('private storage detail')}});
 assert.deepEqual(await svc.authorize(cmd),{allowed:false,code:'INVALID_CONTEXT'});
});
test('evidence failure must fail closed and not expose error',async()=>{
 const svc=new AuthorizationService({loadFreshContext:async()=>{throw Error('SQL private detail')}},{append:async()=>{}});
 assert.deepEqual(await svc.authorize(cmd),{allowed:false,code:'INVALID_CONTEXT'});
});
test('trusted evidence must match opaque command identity, record and action',async()=>{
 for(const mismatch of [{principal:{...evidence.principal,ref:'other'}},{resource:{...evidence.resource,recordRef:'other'}},{action:'record.export'}]){
  const svc=new AuthorizationService({loadFreshContext:async()=>({...evidence,...mismatch})},{append:async()=>{}});
  assert.equal((await svc.authorize(cmd)).allowed,false);
 }
});
test('denied decision is recorded as redacted event',async()=>{
 const entries=[];const svc=new AuthorizationService({loadFreshContext:async()=>({...evidence,roleGrants:[]})},{append:async e=>{entries.push(e)}});
 const result=await svc.authorize(cmd);assert.equal(result.allowed,false);assert.equal(entries[0].outcome,'DENY');
});
