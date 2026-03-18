#!/usr/bin/env node
/**
 * Add AdSense ad units to all pages
 * Places in-article ads and sidebar ads
 */

const fs = require('fs');
const path = require('path');

const SITES_DIR = __dirname.replace('/scripts', '');
const ADSENSE_PUBLISHER = 'ca-pub-2005233757983672';

// Find all index.html and article files
const subdirs = fs.readdirSync(SITES_DIR, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .filter(dirent => !['scripts', 'memory', 'trading', 'dashboard', 'build'].includes(dirent.name))
  .map(dirent => dirent.name);

let updatedCount = 0;

// Ad unit template for in-article placement
const inArticleAd = `
<!-- In-Article Ad -->
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="${ADSENSE_PUBLISHER}"
     data-ad-slot="AUTO"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
`;

// Ad unit for after first paragraph
const afterParagraphAd = `
<div style="margin: 2rem 0;">
<!-- Ad Unit -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${ADSENSE_PUBLISHER}"
     data-ad-slot="AUTO"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
</div>
`;

function processFile(filePath, isIndex = false) {
  let html = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has ad units
  if (html.includes('class="adsbygoogle"')) {
    return false;
  }
  
  // For index.html (category pages) - add ad after intro
  if (isIndex) {
    // Find the container div and add ad after header
    const containerMatch = html.match(/(<div class="container">[\s\S]*?<\/header>)/);
    if (containerMatch) {
      const insertPoint = html.indexOf('</header>') + '</header>'.length;
      html = html.slice(0, insertPoint) + afterParagraphAd + html.slice(insertPoint);
      fs.writeFileSync(filePath, html);
      return true;
    }
  }
  
  // For article pages - add ad after first paragraph
  const firstParagraphMatch = html.match(/(<p[^>]*>[\s\S]*?<\/p>)/);
  if (firstParagraphMatch) {
    // Find the end of first paragraph
    const match = html.match(/<p[^>]*>[\s\S]*?<\/p>/);
    if (match) {
      const insertPoint = html.indexOf(match[0]) + match[0].length;
      html = html.slice(0, insertPoint) + afterParagraphAd + html.slice(insertPoint);
      fs.writeFileSync(filePath, html);
      return true;
    }
  }
  
  return false;
}

// Process subdirectory index pages
console.log('Adding AdSense ad units to pages...\n');
subdirs.forEach(subdir => {
  const indexPath = path.join(SITES_DIR, subdir, 'index.html');
  if (fs.existsSync(indexPath)) {
    if (processFile(indexPath, true)) {
      updatedCount++;
      console.log(`✓ ${subdir}/index.html`);
    }
  }
  
  // Process article files in subdirectory
  const subdirPath = path.join(SITES_DIR, subdir);
  const files = fs.readdirSync(subdirPath)
    .filter(file => file.endsWith('.html') && file !== 'index.html');
  
  files.forEach(file => {
    const filePath = path.join(subdirPath, file);
    if (processFile(filePath, false)) {
      updatedCount++;
    }
  });
  
  console.log(`  Processed ${files.length} articles in ${subdir}`);
});

// Process main index.html
const mainIndex = path.join(SITES_DIR, 'index.html');
if (fs.existsSync(mainIndex)) {
  let html = fs.readFileSync(mainIndex, 'utf8');
  if (!html.includes('class="adsbygoogle"')) {
    // Add ad after header
    const insertPoint = html.indexOf('</header>') + '</header>'.length;
    html = html.slice(0, insertPoint) + afterParagraphAd + html.slice(insertPoint);
    fs.writeFileSync(mainIndex, html);
    updatedCount++;
    console.log(`✓ index.html (main)`);
  }
}

console.log(`\n✅ Added AdSense ad units to ${updatedCount} pages`);
console.log(`Publisher ID: ${ADSENSE_PUBLISHER}`);
console.log(`\nNote: Ad slots are set to AUTO. After AdSense approval, replace with actual ad unit IDs.`);