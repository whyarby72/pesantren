#!/usr/bin/env node
// GAQI/0.1.0 — read-only Actions usage evidence, measured elapsed time not billing.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://api.github.com';
export function summarizeJobs(jobs) {
  const entries = []; const groups = new Map();
  for (const j of jobs) {
    if (!j.started_at || !j.completed_at) continue;
    const duration = Math.max(0, (Date.parse(j.completed_at)-Date.parse(j.started_at))/1000);
    if (!Number.isFinite(duration)) continue;
    const key = `${j.workflow_name || 'workflow unknown'} / ${j.name || 'job'}`;
    const current = groups.get(key) || { jobs:0, seconds:0, ceilingMinutesProxy:0 };
    current.jobs++;
    current.seconds += duration;
    current.ceilingMinutesProxy += Math.ceil(duration/60);
    groups.set(key,current);
    entries.push({key, seconds:duration});
  }
  const byJob = [...groups].map(([job,data])=>({job,...data,elapsedMinutes:Number((data.seconds/60).toFixed(2))})).sort((a,b)=>b.seconds-a.seconds);
  return {observedJobCount:entries.length, elapsedMinutes:Number((entries.reduce((n,j)=>n+j.seconds,0)/60).toFixed(2)), ceilingMinutesProxy: entries.reduce((n,j)=>n+Math.ceil(j.seconds/60),0), byJob, note:'Elapsed job runtime only. Ceiling proxy IS NOT official billed minutes or cost; runner type, billing rules and discounts may differ.'};
}
export async function fetchUsage(repo, limit=30, token=process.env.GH_TOKEN || process.env.GITHUB_TOKEN) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) throw Error('Expected owner/repo');
  if (!Number.isInteger(limit) || limit<1 || limit>100) throw Error('limit must be 1–100');
  async function read(endpoint) {
    const response=await fetch(API+endpoint,{headers:{Accept:'application/vnd.github+json',...(token?{Authorization:`Bearer ${token}`}:{})}});
    if(!response.ok) throw Error(`GitHub API ${response.status} (no response-body echo)`);
    return response.json();
  }
  const runs=await read(`/repos/${repo}/actions/runs?per_page=${limit}`);
  const all=[];
  for (const run of runs.workflow_runs || []) {
    let page=1;
    do {
      const data=await read(`/repos/${repo}/actions/runs/${run.id}/jobs?per_page=100&page=${page}`);
      for (const job of data.jobs||[]) all.push({...job,workflow_name:run.name});
      if(!data.jobs || data.jobs.length<100) break;
      page++;
    } while(page<=10);
  }
  return {repo, runsQueried:runs.workflow_runs?.length ?? 0, ...summarizeJobs(all)};
}
async function main(args){
  const fixtureIndex=args.indexOf('--fixture');
  if(fixtureIndex!==-1) {
    if(!args[fixtureIndex+1])throw Error('Missing JSON fixture');
    const data=JSON.parse(readFileSync(args[fixtureIndex+1],'utf8'));
    const jobs=Array.isArray(data)?data:data.jobs;
    if(!Array.isArray(jobs)) throw Error('Fixture must be array of jobs or {jobs:[]}');
    console.log(JSON.stringify({source:'OFFLINE_FIXTURE',...summarizeJobs(jobs)},null,2));return;
  }
  const repoIndex=args.indexOf('--repo');
  if(repoIndex===-1||!args[repoIndex+1])throw Error('Usage: --repo owner/repo [--limit 30] or --fixture JSON');
  const index=args.indexOf('--limit');
  const limit=index===-1?30:Number(args[index+1]);
  console.log(JSON.stringify({source:'LIVE_GITHUB_API',...await fetchUsage(args[repoIndex+1],limit)},null,2));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  main(process.argv.slice(2)).catch(e=>{console.error('GAQI_REPORT_FAIL:',e.message);process.exitCode=1;});
}
