/**
 * Placeholder media untuk Fase 1. Gambar dibuat sendiri sebagai SVG
 * deterministik dari path — tidak ada permintaan ke internet, jadi timeline
 * tetap terlihat benar saat offline dan saat menguji PWA.
 */
const PALETTES = [
  ['#f6d5c8', '#e08a7d'], ['#f2ddf0', '#c08ac0'], ['#f7e3c4', '#d99b5c'],
  ['#f9d9d2', '#d97b86'], ['#e8ddf7', '#9b86cf'], ['#fce4d6', '#e0956b'],
];

export default defineEventHandler((event) => {
  const path = (getRouterParam(event, 'path') ?? 'x').toString();
  const seed = [...path].reduce((a, c) => a + c.charCodeAt(0), 0);
  const [from, to] = PALETTES[seed % PALETTES.length] as [string, string];
  const angle = seed % 180;
  const r1 = 30 + (seed % 40);
  const r2 = 20 + (seed % 25);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs><linearGradient id="g" gradientTransform="rotate(${angle} .5 .5)">
    <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
  </linearGradient></defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <circle cx="${200 + (seed % 400)}" cy="${180 + (seed % 200)}" r="${r1 * 2}" fill="#fff" opacity=".18"/>
  <circle cx="${120 + (seed % 500)}" cy="${400 - (seed % 150)}" r="${r2 * 2}" fill="#fff" opacity=".12"/>
</svg>`;

  setHeader(event, 'content-type', 'image/svg+xml');
  setHeader(event, 'cache-control', 'public, max-age=31536000, immutable');
  return svg;
});
