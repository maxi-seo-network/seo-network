#!/usr/bin/env node
/**
 * Standardize all index.html pages to match best-crm-for-agencies structure
 */

const fs = require('fs');
const path = require('path');

const SITES_DIR = __dirname.replace('/scripts', '');

const SITES = fs.readdirSync(SITES_DIR).filter(d => {
  const indexPath = path.join(SITES_DIR, d, 'index.html');
  return fs.existsSync(indexPath) && fs.statSync(indexPath).isFile();
});

// Standard patterns to enforce
const PATTERNS = {
  // Replace table-base with comparison-table
  'class="table-base"': 'class="comparison-table"',
  'class="table-base table-sm"': 'class="comparison-table"',
  
  // Replace section-gray with key-takeaways wrapper
  '<section class="section-gray">': '<section class="key-takeaways">',
  
  // Fix double class attributes
  'class="breadcrumb" class="breadcrumb"': 'class="breadcrumb"',
  
  // Standardize Key Takeaways structure
  '<h2 class="heading-light">🎯 Key Takeaways</h2>': '<h2>🎯 Key Takeaways</h2>',
  
  // Ensure consistent section classes
  '<section class="cta-box">': '<section class="key-takeaways">',
};

function processFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Fix double class attributes
  html = html.replace(/class="([^"]*)"\s+class="([^"]*)"/g, 'class="$1 $2"');
  
  // Replace table classes
  if (html.includes('class="table-base"')) {
    html = html.replace(/class="table-base"/g, 'class="comparison-table"');
    changed = true;
  }
  
  // Replace inline table styles
  html = html.replace(/style="width: 100%; border-collapse: collapse; margin: [^"]+"/g, 'class="comparison-table"');
  
  // Remove empty style attributes
  html = html.replace(/\s*style=""/g, '');
  
  if (html !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, html);
    return true;
  }
  return changed;
}

let fixed = 0;

SITES.forEach(site => {
  const indexPath = path.join(SITES_DIR, site, 'index.html');
  if (processFile(indexPath)) {
    console.log(`Fixed: ${site}/index.html`);
    fixed++;
  }
});

console.log(`\n✅ Standardized ${fixed} index pages`);