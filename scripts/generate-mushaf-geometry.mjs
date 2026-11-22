// Builds src/assets/mushafGeometry.json - per-page tap-targeting data for the Mushaf SVGs.
// Every page SVG has an "Aya_No." group holding one path per end-of-ayah marker, and a
// text group (named Quran_Text / QuranText / Layer_1 depending on the page) of glyph contours. From those we extract, per page:
//   vb:      [width, height] of the SVG viewBox
//   lines:   y-centres of the text lines
//   x:       [minX, maxX] horizontal extent of the text block
//   markers: [lineIndex, x] of each ayah-end marker, in reading order (top->bottom, right->left)
// At runtime a tap is mapped to the first marker at/after it in reading order; the global
// marker count before a page gives the ayah's index in the Quran (1..6236).
// Run with: node scripts/generate-mushaf-geometry.mjs   (needs assets/mushaf/ present)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { svgPathBbox } from 'svg-path-bbox';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outFile = path.join(root, 'src', 'assets', 'mushafGeometry.json');
const round = (v) => Math.round(v * 100) / 100;

function parsePage(page) {
  const file = path.join(root, 'assets', 'mushaf', `${String(page).padStart(3, '0')}___Hafs39__DM.svg`);
  const svg = fs.readFileSync(file, 'utf8');
  const vbMatch = /viewBox="([\d.\s-]+)"/.exec(svg).slice(1)[0].trim().split(/\s+/).map(Number);
  const stack = [];
  const markers = [];
  const glyphs = [];
  const circles = [];
  const re = /<g\b([^>]*)>|<\/g>|<path\b([^>]*?)\/>/gs;
  let m;
  while ((m = re.exec(svg))) {
    if (m[0].startsWith('</g')) stack.pop();
    else if (m[0].startsWith('<g')) stack.push(/id="([^"]*)"/.exec(m[1])?.[1] ?? '');
    else {
      const d = /\sd="([^"]*)"/.exec(m[2])?.[1];
      if (!d) continue;
      if (stack.includes('Aya_No.')) markers.push(svgPathBbox(d));
      else if (stack.some((id) => id.startsWith('Ornament'))) {
        // The ornament layer also holds one circle (~13x17) per ayah end. A few pages are
        // missing a numeral path (e.g. page 86) so circles are used to fill those gaps.
        const b = svgPathBbox(d);
        const w = b[2] - b[0];
        const h = b[3] - b[1];
        if (w >= 9 && w <= 14 && h >= 13 && h <= 18) circles.push(b);
      }
      else if (!stack.some((id) => id.startsWith('Ornament') || id.startsWith('Header'))) {
        for (const sub of d.split(/(?=M)/)) if (sub.trim()) glyphs.push(svgPathBbox(sub));
      }
    }
  }
  for (const c of circles) {
    const cx = (c[0] + c[2]) / 2;
    const cy = (c[1] + c[3]) / 2;
    const covered = markers.some((m) => Math.abs((m[0] + m[2]) / 2 - cx) < 10 && Math.abs((m[1] + m[3]) / 2 - cy) < 10);
    if (!covered) markers.push(c);
  }
  return { vb: [vbMatch[2], vbMatch[3]], markers, glyphs };
}

function lineCenters(glyphs) {
  const ys = glyphs
    .filter((g) => g[2] - g[0] >= 2.5 && g[3] - g[1] >= 3)
    .map((g) => (g[1] + g[3]) / 2)
    .sort((a, b) => a - b);
  const clusters = [];
  let cur = [ys[0]];
  for (let i = 1; i < ys.length; i += 1) {
    if (ys[i] - ys[i - 1] > 6) {
      clusters.push(cur);
      cur = [];
    }
    cur.push(ys[i]);
  }
  clusters.push(cur);
  return clusters.filter((c) => c.length >= 4).map((c) => c.reduce((a, b) => a + b, 0) / c.length);
}

const pages = {};
let total = 0;
let worst = 0;
for (let page = 1; page <= 604; page += 1) {
  const { vb, markers, glyphs } = parsePage(page);
  const lines = lineCenters(glyphs);
  const placed = markers.map((b) => {
    const cy = (b[1] + b[3]) / 2;
    const cx = (b[0] + b[2]) / 2;
    let best = 0;
    for (let i = 1; i < lines.length; i += 1) if (Math.abs(lines[i] - cy) < Math.abs(lines[best] - cy)) best = i;
    worst = Math.max(worst, Math.abs(lines[best] - cy));
    return [best, round(cx)];
  });
  placed.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  total += placed.length;
  const big = glyphs.filter((g) => g[2] - g[0] >= 2.5 && g[3] - g[1] >= 3);
  const x = [Math.min(...big.map((g) => g[0])), Math.max(...big.map((g) => g[2]))].map(round);
  pages[page] = { vb: vb.map(round), lines: lines.map(round), x, markers: placed };
}
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(pages));
console.log(`Wrote ${outFile}: ${total} markers (expect 6236), worst marker/line y offset ${round(worst)}`);
