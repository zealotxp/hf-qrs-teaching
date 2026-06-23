const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

// Clean dist
if (fs.existsSync(dist)) {
  fs.rmSync(dist, { recursive: true });
}
fs.mkdirSync(dist, { recursive: true });

// Files to copy
const files = ['index.html', 'simulation.html'];
const dirs = ['css', 'js'];

for (const file of files) {
  const src = path.join(root, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(dist, file));
    console.log(`  Copied: ${file}`);
  }
}

for (const dir of dirs) {
  const src = path.join(root, dir);
  const dest = path.join(dist, dir);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log(`  Copied: ${dir}/`);
  }
}

console.log('Build complete: dist/ is ready.');
