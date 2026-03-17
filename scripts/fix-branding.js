const fs = require('fs');
const path = require('path');

const siteNames = {
  'accounting-software-freelancers': 'Accounting Software Freelancers',
  'ai-tools-for-realtors': 'AI Tools for Realtors',
  'analytics-tools-apps': 'Analytics Tools Apps',
  'best-crm-for-agencies': 'Best CRM for Agencies',
  'chatbot-platforms-saas': 'Chatbot Platforms SaaS',
  'email-marketing-tools-ecommerce': 'Email Marketing Tools Ecommerce',
  'project-management-software-startups': 'Project Management Software Startups',
  'seo-tools-bloggers': 'SEO Tools Bloggers',
  'social-media-schedulers-influencers': 'Social Media Schedulers Influencers',
  'video-editing-software-youtubers': 'Video Editing Software Youtubers'
};

const buildDir = path.join(__dirname, '..', '..', 'build');

Object.entries(siteNames).forEach(([dirKey, siteName]) => {
  const siteDir = path.join(buildDir, dirKey);
  if (!fs.existsSync(siteDir)) return;
  
  // Process all HTML files in site directory
  const files = fs.readdirSync(siteDir).filter(f => f.endsWith('.html'));
  
  files.forEach(file => {
    const filePath = path.join(siteDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace generic "SEO Network" with site-specific name
    content = content.replace(/SEO Network/g, siteName);
    
    // Update logo text
    content = content.replace(/<a href="\/" class="logo">[^<]+<\/a>/, `<a href="/" class="logo">${siteName}</a>`);
    
    // Update copyright
    content = content.replace(/&copy; (\d{4}) SEO Network\. All rights reserved\./, `&copy; $1 ${siteName.toLowerCase()}. All rights reserved.`);
    
    // Add noindex to content pages (keep index pages as indexable)
    if (file !== 'index.html') {
      content = content.replace('<head>', '<head>\n  <meta name="robots" content="noindex, follow">');
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${dirKey}/${file}`);
  });
});

console.log('✅ Branding fix complete');
