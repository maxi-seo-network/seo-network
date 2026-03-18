#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SITES_DIR = __dirname.replace('/scripts', '');

const SITES = fs.readdirSync(SITES_DIR).filter(d => {
  const indexPath = path.join(SITES_DIR, d, 'index.html');
  return fs.existsSync(indexPath) && fs.statSync(indexPath).isFile();
});

const REPLACEMENTS = [
  { pattern: /style="display: grid; grid-template-columns: repeat\(auto-fit, minmax\(200px, 1fr\)\); gap: 1rem;"/g, class: 'grid-auto' },
  { pattern: /style="background: #e8f5e9; padding: 1\.5rem; border-radius: 8px; margin: 1\.5rem 0;"/g, class: 'bg-success-light' },
  { pattern: /style="margin-top: 3rem;"/g, class: 'section-spacing' },
  { pattern: /style="margin-bottom: 0;"/g, class: 'margin-bottom-0' },
  { pattern: /style="display: flex; gap: 0\.5rem;"/g, class: 'flex-gap' },
  { pattern: /style="background: #667eea; color: white; border: none; padding: 0\.5rem 1rem; border-radius: 4px; cursor: pointer;"/g, class: 'btn-primary' },
  { pattern: /style="background: transparent; color: white; border: 1px solid white; padding: 0\.5rem 1rem; border-radius: 4px; cursor: pointer;"/g, class: 'btn-outline' },
  { pattern: /style="position: fixed; bottom: 0; left: 0; right: 0; background: #333; color: white; padding: 1rem; display: none; z-index: 9999; font-size: 0\.9rem;"/g, class: 'cookie-banner' },
];

function processFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  REPLACEMENTS.forEach(({ pattern, class: className }) => {
    if (pattern.test(html)) {
      html = html.replace(pattern, `class="${className}"`);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, html);
    return true;
  }
  return false;
}

let fixed = 0;

SITES.forEach(site => {
  const indexPath = path.join(SITES_DIR, site, 'index.html');
  if (processFile(indexPath)) {
    console.log(`Fixed: ${site}/index.html`);
    fixed++;
  }
});

console.log(`\n✅ Replaced inline styles in ${fixed} index files`);
