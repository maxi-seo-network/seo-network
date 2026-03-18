#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SITES_DIR = __dirname.replace('/scripts', '');

const SITES = fs.readdirSync(SITES_DIR).filter(d => {
  const indexPath = path.join(SITES_DIR, d, 'index.html');
  return fs.existsSync(indexPath) && fs.statSync(indexPath).isFile();
});

const REPLACEMENTS = [
  // Nav breadcrumb
  { pattern: /style="font-size: 0\.9rem; margin-bottom: 1\.5rem; color: #666;"/g, class: 'nav-breadcrumb' },
  { pattern: /style="color: #333;"/g, class: 'text-gray' },
  { pattern: /style="margin: 0; padding-left: 1\.5rem; line-height: 1\.8;"/g, class: 'list-styled' },
  { pattern: /style="margin: 0; padding-left: 1\.5rem; column-count: 2; column-gap: 2rem;"/g, class: 'list-columns' },
  { pattern: /style="padding: 12px; text-align: left; border: 1px solid #5567d5;"/g, class: 'th-primary' },
  { pattern: /style="padding: 10px; text-align: left; border: 1px solid #5567d5;"/g, class: 'th-feature' },
  { pattern: /style="padding: 10px; text-align: center; border: 1px solid #ddd; background: #fff3e0;"/g, class: 'td-highlight' },
  { pattern: /style="margin-top: 1rem; font-size: 0\.85rem; color: #666;"/g, class: 'text-muted' },
  { pattern: /style="color: inherit; text-decoration: underline;"/g, class: 'link-underlined' },
  { pattern: /style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;"/g, class: 'container-flex' },
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
