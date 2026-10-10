#!/usr/bin/env node
// GAQI/0.1.0 — offline, dependency-free guardrail and conservative test selector.
import { execFileSync } from 'node:child_process';
import { readFileSync, appendFileSync, lstatSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ZERO_SHA = /^0+$/;
const SHA = /^[a-f0-9]{7,40}$/i;
const DOC_ONLY = /^(?:README\.md|docs\/(?!product-sources\/)[\w./-]+\.(?:md|txt|csv))$/;
const TS_IMPACT = /(?:^|\/)(?:package(?:-lock)?\.json|tsconfig(?:\.[\w-]+)?\.json)$|\.(?:ts|tsx|mts|cts)$/i;
const PROTECTED = /^docs\/product-sources\//;
const BAD_PATH = /(?:^|\/)(?:\.env(?:\..+)?|[^/]+\.(?:pem|key|p12|pfx)|(?:[^/]*?(?:database|student|santri)[^/]*?(?:backup|dump|export))\.(?:csv|json|sql|zip))$/i;
// Split markers avoid embedding a live-looking secret in source/test fixtures.
const SUSPICIOUS_CONTENT = [
  new RegExp('-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----'),
  new RegExp('\\bAKIA' + '[A-Z0-9]{16}\\b'),
  new RegExp('\\bgh' + '[pousr]_[A-Za-z0-9_]{20,}\\b'),
  new RegExp('\\bxox' + '[baprs]-[0-9A-Za-z-]{15,}\\b'),
  new RegExp('(?:^|\\n)\\s*(?:password|secret_key|api_key)\\s*[:=]\\s*["\\\']?[^"\\\'\\s]{12,}', 'i'),
];
function git(args) { return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 8*1024*1024 }); }
export function classify(paths, diffReliable = true) {
  const names = [...new Set(paths)].filter(Boolean);
  if (!diffReliable || names.length === 0) return { mode: 'full-fallback', tests: true, typecheck: true, reason: 'missing or untrusted change baseline' };
  if (names.some(p => PROTECTED.test(p))) return { mode: 'protected-source-change', tests: true, typecheck: true, reason: 'canonical product source requires separate review' };
  if (names.every(p => DOC_ONLY.test(p))) return { mode: 'docs-only', tests: false, typecheck: false, reason: 'documentation-only changes' };
  return { mode: 'code-or-config', tests: true, typecheck: names.some(p => TS_IMPACT.test(p)), reason: 'code/config changes' };
}
export function isProtectedChange(paths) { return paths.some(p => PROTECTED.test(p)); }
export function scanFile(path, contents) {
  if (BAD_PATH.test(path)) return 'forbidden tracked filename';
  if (contents.length > 2*1024*1024) return 'tracked file exceeds 2 MiB safety ceiling';
  if (contents.includes('\0')) return 'binary file requires manual review';
  if (SUSPICIOUS_CONTENT.some(r => r.test(contents))) return 'possible secret signature';
  return null;
}
export function getChanged() {
  const base = process.env.GAQI_BASE_SHA?.trim();
  const head = process.env.GAQI_HEAD_SHA?.trim() || 'HEAD';
  if (!base || !SHA.test(base) || ZERO_SHA.test(base) || !(head === 'HEAD' || SHA.test(head))) {
    return { paths: [], reliable: false, reason: 'missing SHA or new-branch event' };
  }
  try { return { paths: git(['diff','--name-only','--diff-filter=ACMRTUXB',base,head]).trim().split('\n').filter(Boolean), reliable: true }; }
  catch { return { paths: [], reliable: false, reason: 'git history unavailable' }; }
}
export function scanTrackedFiles(paths, getContent) {
  const errors = [];
  for (const p of paths) {
    let problem;
    try { problem = scanFile(p, getContent(p)); }
    catch { problem = 'unreadable tracked file'; }
    if (problem) errors.push({path:p, reason:problem});
  }
  return errors;
}
function main(args) {
  const cmd = args[0];
  if (cmd === 'plan') {
    const changed = getChanged();
    const result = classify(changed.paths, changed.reliable);
    const report = { gaqi: '0.1.0', ...result, changedFiles: changed.paths.length, fallbackReason: changed.reason || null };
    process.stdout.write(JSON.stringify(report)+'\n');
    const index = args.indexOf('--github-output');
    if (index >= 0) {
      if (!args[index + 1]) throw Error('missing --github-output target');
      appendFileSync(args[index+1], `tests=${result.tests}\ntypecheck=${result.typecheck}\nmode=${result.mode}\n`);
    }
    return;
  }
  if (cmd === 'security') {
    const changed = getChanged();
    if (changed.reliable && isProtectedChange(changed.paths)) {
      throw Error('Protected product-source modifications require separate human review');
    }
    const tracked = git(['ls-files', '-z']).split('\0').filter(Boolean);
    const errors = scanTrackedFiles(tracked, p => {
      const target = resolve(p);
      if (!lstatSync(target).isFile()) throw Error('not a plain file');
      return readFileSync(target, 'utf8');
    });
    if (errors.length) {
      // Do not print offending lines/values into publicly readable CI logs.
      for (const item of errors) console.error(`${item.path}: ${item.reason}`);
      throw Error(`Security preflight blocked ${errors.length} tracked file(s)`);
    }
    console.log(`GAQI_SECURITY_PASS: scanned ${tracked.length} tracked files; no recognized secret signatures or prohibited filenames`);
    console.log('Limit: this is heuristic scanning, not a PII/publication or git-history approval');
    return;
  }
  throw Error('Usage: node scripts/gaqi/ci.mjs [plan [--github-output FILE] | security]');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); } catch (e) { console.error('GAQI_FAIL:', e.message); process.exitCode = 1; }
}
