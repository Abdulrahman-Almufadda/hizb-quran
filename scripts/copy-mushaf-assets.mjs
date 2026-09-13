// Copies the 604 authentic Mushaf page SVGs from the sibling Flutter prototype
// ("Quran Project") into assets/mushaf/. Not checked into git (see .gitignore) -
// this is a one-machine convenience since the source assets live outside this repo.
// Run with: node scripts/copy-mushaf-assets.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(projectRoot, '..', 'Quran Project', 'mushaf-pages-cleaned');
const destDir = path.join(projectRoot, 'assets', 'mushaf');

if (!fs.existsSync(sourceDir)) {
  console.error(`Source folder not found: ${sourceDir}`);
  console.error('Expected the Flutter prototype at "../Quran Project" next to this repo.');
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });

const files = fs.readdirSync(sourceDir).filter((f) => f.toLowerCase().endsWith('.svg'));
if (files.length === 0) {
  console.error(`No .svg files found in ${sourceDir}`);
  process.exit(1);
}

let copied = 0;
let skipped = 0;
for (const file of files) {
  const src = path.join(sourceDir, file);
  const dest = path.join(destDir, file);
  if (fs.existsSync(dest) && fs.statSync(dest).size === fs.statSync(src).size) {
    skipped += 1;
    continue;
  }
  fs.copyFileSync(src, dest);
  copied += 1;
}

console.log(`Mushaf assets: ${copied} copied, ${skipped} already up to date, ${files.length} total.`);
if (files.length !== 604) {
  console.warn(`Warning: expected 604 pages, found ${files.length}.`);
}
