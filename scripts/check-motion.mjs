#!/usr/bin/env node
/**
 * Grep aturan §4.4 dokumen frontend. Dipanggil lewat `pnpm lint:motion`.
 * Ditulis dengan Node (bukan Python) supaya jalan di Windows tanpa setup apa pun.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'apps', 'web', 'app');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(vue|css)$/.test(name)) out.push(p);
  }
  return out;
}

const files = walk(SRC).map(p => ({ path: p, src: readFileSync(p, 'utf8') }));
const failed = [];

function report(label, hits) {
  if (hits.length) {
    console.log(`x ${label}`);
    for (const h of hits) console.log(`    ${relative(ROOT, h.path)}:${h.line}: ${h.text.trim()}`);
    failed.push(label);
  } else {
    console.log(`v ${label}`);
  }
}

function scan(label, regex) {
  const hits = [];
  for (const f of files) {
    f.src.split('\n').forEach((text, i) => {
      if (new RegExp(regex.source, regex.flags.replace('g', '')).test(text)) {
        hits.push({ path: f.path, line: i + 1, text });
      }
    });
  }
  report(label, hits);
}

scan("tanpa 'transition: all'", /transition:\s*all/);
scan('tanpa ease-in pada UI', /(transition|animation)[^;]*(?<![-\w])ease-in(?![-\w])/);
scan('tanpa scale(0) mentah', /scale\(0\)/);
scan('tanpa animasi height/padding/width', /transition:\s*(height|padding|width)\b/);
scan('blur() maksimal 20px', /blur\((?:2[1-9]|[3-9]\d|\d{3,})px\)/);

// :hover wajib berada di dalam @media (hover: hover) — buang blok itu dulu, lalu cari sisanya.
const HOVER_MEDIA = /@media[^{]*hover:\s*hover[^{]*\{/g;
const hoverHits = [];
for (const f of files) {
  let out = '';
  let i = 0;
  HOVER_MEDIA.lastIndex = 0;
  let m;
  while ((m = HOVER_MEDIA.exec(f.src))) {
    out += f.src.slice(i, m.index);
    let depth = 1;
    let j = HOVER_MEDIA.lastIndex;
    while (j < f.src.length && depth > 0) {
      if (f.src[j] === '{') depth++;
      else if (f.src[j] === '}') depth--;
      j++;
    }
    // pertahankan nomor baris
    out += f.src.slice(m.index, j).replace(/[^\n]/g, '');
    i = j;
    HOVER_MEDIA.lastIndex = j;
  }
  out += f.src.slice(i);

  out.split('\n').forEach((text, idx) => {
    if (/:hover\b/.test(text)) hoverHits.push({ path: f.path, line: idx + 1, text });
  });
}
report('hover selalu di dalam @media (hover: hover)', hoverHits);

console.log('');
if (failed.length) {
  console.log(`Ada ${failed.length} pelanggaran aturan motion.`);
  process.exit(1);
}
console.log('Semua aturan motion §4.4 lolos.');
