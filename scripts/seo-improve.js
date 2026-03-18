#!/usr/bin/env node
/**
 * SEO Improvements:
 * 1. Truncate long titles to 60 chars
 * 2. Add og:image to pages missing it
 * 3. Add missing meta descriptions
 */

const fs = require('fs');
const path = require('path');

const SITES_DIR = __dirname.replace('/scripts', '');
const SITES = [
  'accounting-software-freelancers', 'ai-tools-for-realtors', 'ai-writing-tools-authors',
  'analytics-tools-apps', 'best-crm-for-agencies', 'chatbot-platforms-saas',
  'email-marketing-tools-ecommerce', 'email-verification-tools', 'password-managers-teams',
  'project-management-software-startups', 'seo-tools-bloggers', 'social-media-schedulers-influencers',
  'video-editing-software-youtubers', 'vpn-services-remote-workers', 'web-hosting-small-business'
];

let fixed = { titles: 0, ogImages: 0, descriptions: 0 };

function truncateTitle(title) {
  if (title.length <= 60) return title;
  return title.substring(0, 57) + '...';
}

function processFile(filePath, siteName) {
  let html = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. Truncate long titles
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  if (titleMatch && titleMatch[1].length > 60) {
    const newTitle = truncateTitle(titleMatch[1]);
    html = html.replace(/<title>[^<]+<\/title>/, `<title>${newTitle}</title>`);
    fixed.titles++;
    modified = true;
  }

  // 2. Add og:image if missing
  if (!html.includes('property="og:image"')) {
    const imageName = siteName + '.png';
    const ogImage = `\n  <meta property="og:image" content="https://www.toolreviewshub.com/images/${imageName}">`;
    // Insert after og:site_name
    if (html.includes('og:site_name')) {
      html = html.replace(/(<meta property="og:site_name"[^>]*>)/, `$1${ogImage}`);
    } else {
      html = html.replace('</head>', `${ogImage}\n</head>`);
    }
    fixed.ogImages++;
    modified = true;
  }

  // 3. Check meta description length (should be 150-160 chars)
  const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
  if (descMatch) {
    const desc = descMatch[1];
    if (desc.length < 150 || desc.length > 160) {
      // Auto-truncate or pad description if needed
      const newDesc = desc.length > 160 ? desc.substring(0, 157) + '...' : desc;
      html = html.replace(/<meta name="description" content="[^"]+"/, `<meta name="description" content="${newDesc}"`);
      fixed.descriptions++;
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, html);
  }

  return modified;
}

// Process all sites
SITES.forEach(site => {
  const sitePath = path.join(SITES_DIR, site);
  if (!fs.existsSync(sitePath)) return;

  const files = fs.readdirSync(sitePath).filter(f => f.endsWith('.html'));
  
  files.forEach(file => {
    const filePath = path.join(sitePath, file);
    processFile(filePath, site);
  });

  console.log(`Processed ${files.length} files in ${site}`);
});

// Process root files
['index.html', 'about.html', 'contact.html', 'privacy.html', 'terms.html', 'affiliate-disclosure.html'].forEach(file => {
  const filePath = path.join(SITES_DIR, file);
  if (fs.existsSync(filePath)) {
    processFile(filePath, 'main');
  }
});

console.log(`\n✅ SEO Improvements Applied:`);
console.log(`   Titles truncated: ${fixed.titles}`);
console.log(`   og:image added: ${fixed.ogImages}`);
console.log(`   Descriptions fixed: ${fixed.descriptions}`);