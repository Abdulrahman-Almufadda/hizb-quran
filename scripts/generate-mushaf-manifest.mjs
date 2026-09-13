// Generates src/assets/mushafManifest.ts: a page number -> require() map.
// Metro can only bundle static assets it sees a literal require() for, so this
// codegens the 604 entries rather than hand-writing them.
// Run with: node scripts/generate-mushaf-manifest.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const mushafDir = path.join(projectRoot, 'assets', 'mushaf');
const outFile = path.join(projectRoot, 'src', 'assets', 'mushafManifest.ts');

if (!fs.existsSync(mushafDir)) {
  console.error(`Missing ${mushafDir}. Run "npm run copy:mushaf-assets" first.`);
  process.exit(1);
}

const files = fs.readdirSync(mushafDir).filter((f) => f.toLowerCase().endsWith('.svg'));
const byPage = new Map();
for (const file of files) {
  const match = file.match(/^(\d{3})/);
  if (!match) continue;
  const page = Number(match[1]);
  byPage.set(page, file);
}

const missing = [];
for (let page = 1; page <= 604; page += 1) {
  if (!byPage.has(page)) missing.push(page);
}
if (missing.length > 0) {
  console.error(`Missing pages: ${missing.join(', ')}`);
  process.exit(1);
}

const entries = Array.from(byPage.entries())
  .sort(([a], [b]) => a - b)
  .map(([page, file]) => `  ${page}: require('../../assets/mushaf/${file}'),`)
  .join('\n');

const content = `// GENERATED FILE - run \`npm run generate:mushaf-manifest\` to regenerate.
// Maps a 1-based Mushaf page number to its bundled SVG asset module.
export const mushafPageManifest: Record<number, number> = {
${entries}
};
`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, content, 'utf8');
console.log(`Wrote ${outFile} with ${byPage.size} pages.`);
