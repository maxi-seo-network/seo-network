#!/usr/bin/env node
/**
 * Standardize design across all sites
 * - Remove excessive inline styles
 * - Use CSS classes instead
 * - Consistent structure
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

function cleanInlineStyles(html) {
  // Remove common inline styles that should be in CSS
  const stylePatterns = [
    /style="font-size:\s*0\.85rem;[^"]*"/gi,
    /style="font-size:\s*0\.9rem;[^"]*"/gi,
    /style="color:\s*#[0-9a-f]{3,6};[^"]*"/gi,
    /style="margin:\s*\d+rem?\s*0;[^"]*"/gi,
    /style="padding:\s*\d+rem?;[^"]*"/gi,
    /style="background:\s*linear-gradient[^"]*"/gi,
    /style="border-radius:\s*\d+px;[^"]*"/gi,
    /style="display:\s*block[^"]*"/gi,
    /style="text-align:\s*center;[^"]*"/gi,
    /style="line-height:\s*1\.[68];[^"]*"/gi,
  ];
  
  let cleaned = html;
  
  // Replace inline styles with CSS classes
  cleaned = cleaned.replace(/style="font-size:\s*0\.85rem;\s*color:\s*#666;[^"]*"/gi, 'class="breadcrumb"');
  cleaned = cleaned.replace(/style="color:\s*#667eea;?"/gi, 'class="link-primary"');
  cleaned = cleaned.replace(/style="margin:\s*2rem\s*0;?"/gi, 'class="section-spacing"');
  cleaned = cleaned.replace(/style="background:\s*linear-gradient\([^)]*\);\s*color:\s*white;[^"]*"/gi, 'class="cta-box"');
  cleaned = cleaned.replace(/style="color:\s*white;\s*margin-top:\s*0;[^"]*"/gi, 'class="heading-light"');
  cleaned = cleaned.replace(/style="background:\s*#f8f9fa;[^"]*"/gi, 'class="section-gray"');
  cleaned = cleaned.replace(/style="padding:\s*1\.5rem;[^"]*"/gi, 'class="card-padding"');
  
  // Remove empty style attributes
  cleaned = cleaned.replace(/\s*style=""/gi, '');
  
  return cleaned;
}

let fixed = 0;

SITES.forEach(site => {
  const indexPath = path.join(SITES_DIR, site, 'index.html');
  if (!fs.existsSync(indexPath)) return;
  
  let html = fs.readFileSync(indexPath, 'utf8');
  const original = html;
  
  // Clean inline styles
  html = cleanInlineStyles(html);
  
  if (html !== original) {
    fs.writeFileSync(indexPath, html);
    console.log(`Cleaned: ${site}/index.html`);
    fixed++;
  }
});

console.log(`\n✅ Cleaned ${fixed} index pages`);