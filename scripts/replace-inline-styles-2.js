#!/usr/bin/env node
/**
 * Replace remaining inline table styles with CSS classes
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

// Additional inline style -> CSS class mappings
const STYLE_MAP = {
  // Table cells with borders
  'style="padding: 10px; text-align: center; border: 1px solid #ddd;"': 'class="td-center td-border"',
  'style="padding: 12px; text-align: center; border: 1px solid #ddd;"': 'class="td-center td-border"',
  'style="padding: 12px; border: 1px solid #ddd;"': 'class="td-border"',
  'style="padding: 10px; border: 1px solid #ddd; font-weight: 600;"': 'class="td-border td-bold"',
  'style="padding: 10px; border: 1px solid #ddd;"': 'class="td-border"',
  'style="padding: 12px; text-align: center; border: 1px solid #5567d5;"': 'class="td-center td-border-primary"',
  'style="padding: 10px; text-align: center; border: 1px solid #5567d5;"': 'class="td-center td-border-primary"',
  
  // Table cells with background
  'style="padding: 10px; text-align: center; border: 1px solid #ddd; background: #e8f5e9;"': 'class="td-center td-border td-success"',
  
  // Backgrounds
  'style="background: #f9f9f9;"': 'class="bg-gray"',
  'style="background: #667eea; color: white;"': 'class="bg-primary text-white"',
  
  // Tables
  'style="width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.95rem;"': 'class="table-base"',
  
  // Grids
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

SITES.forEach(site => {
  const sitePath = path.join(SITES_DIR, site);
  if (!fs.existsSync(sitePath)) return;
  
  const files = fs.readdirSync(sitePath).filter(f => f.endsWith('.html'));
  
  files.forEach(file => {
    const filePath = path.join(sitePath, file);
    if (processFile(filePath)) {
      fixedFiles++;
    }
  });
  
  console.log(`Processed ${site}`);
});

console.log(`\n✅ Replaced inline styles in ${fixedFiles} files`);