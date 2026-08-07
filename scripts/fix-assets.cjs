const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const SRC = path.join(DIST, 'assets', 'node_modules');
const DST = path.join(DIST, 'assets', 'vendor');
const TEXT_EXTS = new Set(['.js', '.css', '.html', '.json', '.map', '.txt', '.xml', '.svg', '.webmanifest']);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function fixAssets() {
  if (!fs.existsSync(SRC)) {
    console.log('No assets/node_modules found, nothing to do.');
    return;
  }

  let copied = 0;
  for (const file of walk(SRC)) {
    const rel = path.relative(SRC, file);
    const target = path.join(DST, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(file, target);
    copied++;
  }
  console.log(`Copied ${copied} files to assets/vendor`);

  for (const file of walk(DIST)) {
    const ext = path.extname(file).toLowerCase();
    if (!TEXT_EXTS.has(ext)) continue;
    const content = fs.readFileSync(file, 'utf8');
    if (!content.includes('/assets/node_modules/')) continue;
    const updated = content.split('/assets/node_modules/').join('/assets/vendor/');
    fs.writeFileSync(file, updated);
    console.log(`Rewrote references in ${path.relative(DIST, file)}`);
  }

  fs.rmSync(SRC, { recursive: true, force: true });
  console.log('Removed assets/node_modules');
}

fixAssets();
