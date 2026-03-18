#!/usr/bin/env node
/**
 * Replace inline styles with CSS classes across all pages
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

// Common inline style -> CSS class mappings
const STYLE_MAP = {
  'style="padding: 10px; text-align: center;"': 'class="td-center"',
  'style="padding: 12px; text-align: center;"': 'class="td-center"',
  'style="padding: 10px;"': 'class="td-base"',
  'style="padding: 12px;"': 'class="td-base"',
  'style="padding: 12px; text-align: left;"': 'class="td-left"',
  'style="padding: 10px; text-align: left;"': 'class="td-left"',
  'style="width: 100%; border-collapse: collapse; margin: 1.5rem 0;"': 'class="table-base"',
  'style="width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem;"': 'class="table-base table-sm"',
  'style="overflow-x: auto;"': 'class="table-wrap"',
  'style="margin-bottom: 1.5rem;"': 'class="mb-3"',
  'style="margin-top: 1rem;"': 'class="mt-2"',
  'style="margin-top: 2rem;"': 'class="mt-4"',
  'style="margin-top: 0;"': 'class="mt-0"',
  'style="margin: 0;"': 'class="m-0"',
  'style="font-size: 0.9rem; color: #666;"': 'class="text-small text-muted"',
  'style="background: #f0f4ff;"': 'class="bg-highlight"',
  'style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;"': 'class="grid-auto"',
};

function processFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const [inlineStyle, classReplacement] of Object.entries(STYLE_MAP)) {
    if (html.includes(inlineStyle)) {
      html = html.split(inlineStyle).join(classReplacement);
      changed = true;
    }
  }
  
  // Clean up empty style attributes
  html = html.replace(/\s*style=""/g, '');
  
  if (changed) {
    fs.writeFileSync(filePath, html);
    return true;
  }
  return false;
}

let fixedFiles = 0;
let fixedDirs = 0;

SITES.forEach(site => {
  const sitePath = path.join(SITES_DIR, site);
  if (!fs.existsSync(sitePath)) return;
  
  const files = fs.readdirSync(sitePath).filter(f => f.endsWith('.html'));
  let siteFixed = false;
  
  files.forEach(file => {
    const filePath = path.join(sitePath, file);
    if (processFile(filePath)) {
      fixedFiles++;
      siteFixed = true;
    }
  });
  
  if (siteFixed) fixedDirs++;
  console.log(`Processed ${files.length} files in ${site}`);
});

console.log(`\n✅ Replaced inline styles in ${fixedFiles} files across ${fixedDirs} sites`);