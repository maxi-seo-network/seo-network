#!/usr/bin/env node
/**
 * Fix SEO issues on all pages:
 * 1. Remove noindex (CRITICAL!)
 * 2. Add proper robots meta
 * 3. Add canonical URLs
 * 4. Add Open Graph tags
 * 5. Add Schema.org markup
 */

const fs = require('fs');
const path = require('path');

const SITES_DIR = __dirname.replace('/scripts', '');
const SITES = [
  'accounting-software-freelancers',
  'ai-tools-for-realtors',
  'ai-writing-tools-authors',
  'analytics-tools-apps',
  'best-crm-for-agencies',
  'chatbot-platforms-saas',
  'email-marketing-tools-ecommerce',
  'email-verification-tools',
  'password-managers-teams',
  'project-management-software-startups',
  'seo-tools-bloggers',
  'social-media-schedulers-influencers',
  'video-editing-software-youtubers',
  'vpn-services-remote-workers',
  'web-hosting-small-business'
];

const BASE_URL = 'https://www.toolreviewshub.com';

let fixedCount = 0;

function fixSEO(html, filePath, siteName) {
  const fileName = path.basename(filePath, '.html');
  const pageUrl = fileName === 'index' 
    ? `${BASE_URL}/${siteName}/`
    : `${BASE_URL}/${siteName}/${fileName}.html`;
  
  // Extract title from h1 or filename
  const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);
  const title = titleMatch 
    ? titleMatch[1].replace(/<\/?[^>]+>/g, '').trim().slice(0, 60)
    : fileName.replace(/-/g, ' ').replace(/^best /i, '');
  
  // Extract description from first paragraph or create one
  const descMatch = html.match(/<p>(.*?)<\/p>/);
  const description = descMatch
    ? descMatch[1].replace(/<\/?[^>]+>/g, '').trim().slice(0, 155)
    : `Complete guide to ${title} in 2026. Compare features, pricing, and find the best solution for your needs.`;
  
  // Fix robots meta (CRITICAL: remove noindex)
  html = html.replace(
    /<meta name="robots" content="noindex, follow">/gi,
    '<meta name="robots" content="index, follow">'
  );
  
  // If no robots meta, add it
  if (!html.includes('name="robots"')) {
    html = html.replace(
      '<head>',
      `<head>\n  <meta name="robots" content="index, follow">`
    );
  }
  
  // Add canonical URL if missing
  if (!html.includes('rel="canonical"')) {
    html = html.replace(
      '</title>',
      `</title>\n  <link rel="canonical" href="${pageUrl}">`
    );
  }
  
  // Add Open Graph tags if missing
  if (!html.includes('property="og:')) {
    const ogTags = `
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:site_name" content="Tools Reviews Hub">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">`;
    html = html.replace('</title>', `</title>${ogTags}`);
  }
  
  // Add Schema.org Article markup if missing
  if (!html.includes('application/ld+json')) {
    const schema = `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${title.replace(/"/g, '\\"')}",
    "description": "${description.replace(/"/g, '\\"')}",
    "author": {"@type": "Organization", "name": "Tools Reviews Hub"},
    "publisher": {"@type": "Organization", "name": "Tools Reviews Hub"},
    "datePublished": "2026-03-01",
    "dateModified": "2026-03-18"
  }
  </script>`;
    html = html.replace('</head>', `${schema}\n</head>`);
  }
  
  return html;
}

// Process each site
SITES.forEach(site => {
  const sitePath = path.join(SITES_DIR, site);
  if (!fs.existsSync(sitePath)) return;
  
  const files = fs.readdirSync(sitePath).filter(f => f.endsWith('.html'));
  
  files.forEach(file => {
    const filePath = path.join(sitePath, file);
    let html = fs.readFileSync(filePath, 'utf8');
    
    const originalHtml = html;
    html = fixSEO(html, filePath, site);
    
    if (html !== originalHtml) {
      fs.writeFileSync(filePath, html);
      fixedCount++;
    }
  });
  
  console.log(`✓ Fixed ${files.length} pages in ${site}`);
});

// Also fix main index.html
const mainIndex = path.join(SITES_DIR, 'index.html');
if (fs.existsSync(mainIndex)) {
  let html = fs.readFileSync(mainIndex, 'utf8');
  if (html.includes('noindex')) {
    html = html.replace(/<meta name="robots" content="noindex, follow">/gi, '<meta name="robots" content="index, follow">');
    fs.writeFileSync(mainIndex, html);
    console.log('✓ Fixed main index.html');
    fixedCount++;
  }
}

console.log(`\n✅ Fixed SEO on ${fixedCount} pages`);
console.log('Critical fixes:');
console.log('  - Removed noindex (pages will now be indexed)');
console.log('  - Added canonical URLs');
console.log('  - Added Open Graph tags');
console.log('  - Added Schema.org markup');