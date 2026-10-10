import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateAccess,toRedactedAudit} from '../src/policy.ts';

const NOW = '2026-10-10T10:00:00.000Z';
const principal = (kind='staff') => ({ref:'synthetic-actor-a',kind,active:true,sessionValid:true,roles:['SYNTHETIC_STAFF']});
const resource = () => ({recordRef:'synthetic-record-a',unitRef:'synthetic-unit-a',owner:'SAN',classification:'STANDARD',moduleId:'core.kesantrian',published:true});
const grant = () => ({principalRef:'synthetic-actor-a',recordRef:'synthetic-record-a',role:'SYNTHETIC_STAFF',unitRef:'synthetic-unit-a',actions:['record.read'],validFrom:'2026-01-01T00:00:00.000Z',revoked:false});
const relation = () => ({guardianRef:'synthetic-actor-a',recordRef:'synthetic-record-a',unitRef:'synthetic-unit-a',verification:'VERIFIED',actions:['record.read'],validFrom:'2026-01-01T00:00:00.000Z',revoked:false});
const context = () => ({principal:principal(),action:'record.read',resource:resource(),module:{moduleId:'core.kesantrian',owner:'SAN',installed:true,deployed:true,enabled:true},roleGrants:[grant()],guardianRelations:[],now:NOW});
const denied = x => assert.equal(evaluateAccess(x).allowed,false);

test('staff with active role+unit grant may read standard record',()=>assert.equal(evaluateAccess(context()).allowed,true));
test('unauthenticated / disabled account / session invalid always denied',()=>{
  denied({...context(),principal:null});
  denied({...context(),principal:{...principal(),active:false}});
  denied({...context(),principal:{...principal(),sessionValid:false}});
});
test('mismatched unit and role denied without hierarchy privilege',()=>{
  denied({...context(),resource:{...resource(),unitRef:'synthetic-unit-b'}});
  denied({...context(),principal:{...principal(),roles:['SUPER_ADMIN']}});
  denied({...context(),resource:{...resource(),recordRef:'synthetic-record-b'}});
});
test('missing, revoked, expired, future assignment denied',()=>{
  denied({...context(),roleGrants:[]});
  denied({...context(),roleGrants:[{...grant(),revoked:true}]});
  denied({...context(),roleGrants:[{...grant(),validUntil:'2026-10-10T10:00:00.000Z'}]});
  denied({...context(),roleGrants:[{...grant(),validFrom:'2027-01-01T00:00:00.000Z'}]});
});
test('module installed/deployed/enabled must all pass',()=>{
  for(const flag of ['installed','deployed','enabled']) denied({...context(),module:{...context().module,[flag]:false}});
  denied({...context(),module:null});
  denied({...context(),module:{...context().module,moduleId:'wrong.module'}});
  denied({...context(),module:{...context().module,owner:'FIN'}});
});
test('guardian scope only allows verified current published SAN relation',()=>{
  const good={...context(),principal:principal('guardian'),roleGrants:[],guardianRelations:[relation()]};
  assert.equal(evaluateAccess(good).allowed,true);
  denied({...good,resource:{...resource(),recordRef:'synthetic-record-b'}});
  denied({...good,guardianRelations:[{...relation(),verification:'PENDING'}]});
  denied({...good,guardianRelations:[{...relation(),verification:'DISPUTED'}]});
  denied({...good,guardianRelations:[{...relation(),revoked:true}]});
  denied({...good,guardianRelations:[{...relation(),validUntil:NOW}]});
  denied({...good,guardianRelations:[{...relation(),unitRef:'synthetic-unit-b'}]});
  denied({...good,resource:{...resource(),published:false}});
  denied({...good,action:'record.export'});
  denied({...good,action:'record.write'});
  denied({...good,resource:{...resource(),owner:'FIN'}});
});
test('sensitive SAFEGUARD/HEALTH content denied to any regular account',()=>{
  for(const classification of ['SAFEGUARD','HEALTH']){
    denied({...context(),resource:{...resource(),classification}});
    denied({...context(),principal:{...principal(),roles:['SUPER_ADMIN']},resource:{...resource(),classification}});
  }
});
test('unknown state, malformed clock, or malformed scope denied',()=>{
  denied({...context(),action:'resource.delete'});
  denied({...context(),now:'tomorrow'});
  denied({...context(),now:'2026-02-30T10:00:00.000Z'});
  denied({...context(),resource:{...resource(),owner:'OTHER'}});
  denied({...context(),resource:{...resource(),recordRef:''}});
  denied({...context(),roleGrants:[{...grant(),validUntil:'bad'}]});
});
test('audit payload excludes child ID, actor ID, unit and relationship evidence',()=>{
  const ctx=context(),ev=toRedactedAudit(ctx,evaluateAccess(ctx),'synthetic-correlation');
  const serialized=JSON.stringify(ev);
  for(const secret of [ctx.resource.recordRef,ctx.principal.ref,ctx.resource.unitRef,'validFrom']) assert.ok(!serialized.includes(secret));
  assert.equal(ev.outcome,'ALLOW');
  const suspect=toRedactedAudit(ctx,evaluateAccess(ctx),'santri@example.com');
  assert.equal(suspect.correlationRef,'UNSPECIFIED');
});
