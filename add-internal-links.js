const fs = require('fs');
const path = require('path');

// Category info
const categoryInfo = {
  'accounting-software-freelancers': { name: 'Accounting Software for Freelancers', related: ['best-crm-for-agencies', 'project-management-software-startups'] },
  'ai-tools-for-realtors': { name: 'AI Tools for Realtors', related: ['email-marketing-tools-ecommerce', 'social-media-schedulers-influencers'] },
  'ai-writing-tools-authors': { name: 'AI Writing Tools for Authors', related: ['seo-tools-bloggers', 'analytics-tools-apps'] },
  'analytics-tools-apps': { name: 'Analytics Tools for Apps', related: ['email-marketing-tools-ecommerce', 'seo-tools-bloggers'] },
  'best-crm-for-agencies': { name: 'Best CRM for Agencies', related: ['email-marketing-tools-ecommerce', 'project-management-software-startups'] },
  'chatbot-platforms-saas': { name: 'Chatbot Platforms for SaaS', related: ['email-marketing-tools-ecommerce', 'analytics-tools-apps'] },
  'email-marketing-tools-ecommerce': { name: 'Email Marketing for E-commerce', related: ['best-crm-for-agencies', 'analytics-tools-apps'] },
  'email-verification-tools': { name: 'Email Verification Tools', related: ['email-marketing-tools-ecommerce', 'seo-tools-bloggers'] },
  'password-managers-teams': { name: 'Password Managers for Teams', related: ['vpn-services-remote-workers', 'project-management-software-startups'] },
  'project-management-software-startups': { name: 'Project Management for Startups', related: ['best-crm-for-agencies', 'chatbot-platforms-saas'] },
  'seo-tools-bloggers': { name: 'SEO Tools for Bloggers', related: ['ai-writing-tools-authors', 'analytics-tools-apps'] },
  'social-media-schedulers-influencers': { name: 'Social Media Schedulers', related: ['email-marketing-tools-ecommerce', 'video-editing-software-youtubers'] },
  'video-editing-software-youtubers': { name: 'Video Editing for YouTubers', related: ['social-media-schedulers-influencers', 'ai-writing-tools-authors'] },
  'vpn-services-remote-workers': { name: 'VPN Services for Remote Workers', related: ['password-managers-teams', 'project-management-software-startups'] },
  'web-hosting-small-business': { name: 'Web Hosting for Small Business', related: ['analytics-tools-apps', 'email-marketing-tools-ecommerce'] }
};

// Get all HTML files
const dirs = Object.keys(categoryInfo);
let added = 0;
let skipped = 0;

for (const dir of dirs) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html');
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already has Related Articles
    if (content.includes('<h2>Related Articles</h2>') || content.includes('Related Articles</h2>')) {
      skipped++;
      continue;
    }
    
    // Find insertion point (before footer or before closing main)
    let insertPoint = content.indexOf('<footer>');
    if (insertPoint === -1) insertPoint = content.indexOf('</main>');
    if (insertPoint === -1) insertPoint = content.indexOf('</body>');
    
    if (insertPoint === -1) {
      console.log(`  Skipping ${filePath}: no insertion point`);
      continue;
    }
    
    // Build related links
    const info = categoryInfo[dir];
    let relatedHtml = `\n  <h2>Related Articles</h2>\n  <ul>\n`;
    relatedHtml += `    <li><a href="/${dir}/">${info.name} - Complete Guide</a></li>\n`;
    
    for (const relatedCat of info.related) {
      const relatedInfo = categoryInfo[relatedCat];
      if (relatedInfo) {
        relatedHtml += `    <li><a href="/${relatedCat}/">${relatedInfo.name}</a></li>\n`;
      }
    }
    
    relatedHtml += '  </ul>\n';
    
    // Insert
    const newContent = content.slice(0, insertPoint) + relatedHtml + '\n' + content.slice(insertPoint);
    fs.writeFileSync(filePath, newContent);
    added++;
  }
}

console.log('\n=== Summary ===');
console.log(`Added Related Articles to: ${added} files`);
console.log(`Already had Related Articles: ${skipped} files`);