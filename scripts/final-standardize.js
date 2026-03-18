#!/usr/bin/env node
/**
 * Final standardization pass - fix remaining inconsistencies
 */

const fs = require('fs');
const path = require('path');

const SITES_DIR = __dirname.replace('/scripts', '');

const SITES = fs.readdirSync(SITES_DIR).filter(d => {
  const indexPath = path.join(SITES_DIR, d, 'index.html');
  return fs.existsSync(indexPath);
});

function processFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;
  
  // Fix double class attributes (e.g., class="breadcrumb breadcrumb")
  html = html.replace(/class="([^"]*)"\s+class="([^"]*)"/g, 'class="$1 $2"');
  
  // Fix breadcrumb duplicate classes
  html = html.replace(/class="breadcrumb breadcrumb"/g, 'class="breadcrumb"');
  
  // Replace cta-box with key-takeaways for Key Takeaways sections
  html = html.replace(/<section class="cta-box">(\s*)<h2[^>]*>🎯 Key Takeaways/g, '<section class="key-takeaways">$1<h2>🎯 Key Takeaways');
  
  // Remove heading-light class from Key Takeaways h2
  html = html.replace(/<h2 class="heading-light">🎯 Key Takeaways<\/h2>/g, '<h2>🎯 Key Takeaways</h2>');
  
  // Ensure all tables use comparison-table class
  html = html.replace(/class="table-base"/g, 'class="comparison-table"');
  html = html.replace(/class="table-base table-sm"/g, 'class="comparison-table"');
  
  // Remove empty style attributes
  html = html.replace(/\s*style=""/g, '');
  
  // Remove duplicate class in same attribute
  html = html.replace(/class="([^"]*)\s+\1([^"]*)"/g, 'class="$1$2"');
  
  if (html !== original) {
    fs.writeFileSync(filePath, html);
    return true;
  }
  return false;
}

let fixed = 0;

SITES.forEach(site => {
  const indexPath = path.join(SITES_DIR, site, 'index.html');
  if (processFile(indexPath)) {
    console.log(`Fixed: ${site}`);
    fixed++;
  }
});

console.log(`\n✅ Standardized ${fixed} sites`);