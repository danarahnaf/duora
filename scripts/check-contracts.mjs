#!/usr/bin/env node
/**
 * Verifikasi §7: setiap path di packages/contracts punya route mock yang mirror 1:1
 * di apps/web/server/api. Kalau ini lolos, cutover Fase 2 tinggal mengganti baseURL.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTRACTS = join(ROOT, 'packages', 'contracts', 'src');
const API = join(ROOT, 'apps', 'web', 'server', 'api');

const promised = new Set();
for (const name of readdirSync(CONTRACTS).filter(n => n.endsWith('.ts'))) {
  const src = readFileSync(join(CONTRACTS, name), 'utf8');
  for (const [, block] of src.matchAll(/_PATHS\s*=\s*\{([\s\S]*?)\}\s*as const/g)) {
    for (const [, p] of block.matchAll(/^\s*\w+:\s*'(\/[^']*)'/gm)) promised.add(p);
    for (const [, p] of block.matchAll(/^\s*\w+:\s*\([^)]*\)\s*=>\s*`(\/[^`]*)`/gm)) {
      promised.add(p.replace(/\$\{[^}]+\}/g, ':param'));
    }
  }
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.ts')) out.push(p);
  }
  return out;
}

const actual = new Set(
  walk(API).map((p) => {
    let rel = relative(API, p).split(sep).join('/');
    rel = rel.replace(/\.(get|post|patch|put|delete)\.ts$/, '').replace(/\.ts$/, '');
    rel = rel.replace(/\/index$/, '');
    rel = rel.replace(/\[\.\.\.\w+\]|\[\w+\]/g, ':param');
    return `/${rel}`;
  }),
);

const missing = [...promised].filter(p => !actual.has(p)).sort();
const extra = [...actual]
  .filter(p => !promised.has(p) && !p.startsWith('/mock') && !p.startsWith('/health'))
  .sort();

console.log(`${promised.size} path di contracts, ${actual.size} route di mock server\n`);
if (missing.length) {
  console.log('x Dijanjikan kontrak tapi tidak ada di mock server:');
  for (const p of missing) console.log('   ', p);
}
if (extra.length) {
  console.log('! Ada di mock server tapi tidak disebut kontrak (boleh, tapi cek lagi):');
  for (const p of extra) console.log('   ', p);
}
if (!missing.length) console.log('v Semua path kontrak punya route mock yang mirror.');
process.exit(missing.length ? 1 : 0);
