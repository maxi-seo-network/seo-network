const fs = require('fs');
const path = require('path');

const sites = [
  'accounting-software-freelancers',
  'ai-tools-for-realtors',
  'analytics-tools-apps',
  'best-crm-for-agencies',
  'chatbot-platforms-saas',
  'email-marketing-tools-ecommerce',
  'project-management-software-startups',
  'seo-tools-bloggers',
  'social-media-schedulers-influencers',
  'video-editing-software-youtubers'
];

const today = new Date().toISOString().split('T')[0];

sites.forEach(siteDir => {
  const htmlFiles = fs.readdirSync(path.join(__dirname, '..', siteDir))
    .filter(f => f.endsWith('.html') && !['about.html', 'contact.html', 'privacy.html', 'terms.html'].includes(f))
    .sort();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
  
  // Add index page
  xml += `  <url>
    <loc>https://www.toolreviewshub.com/${siteDir}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
`;
  
  // Add all article pages
  htmlFiles.forEach(f => {
    if (f === 'index.html') return;
    const filename = f.replace('.html', '');
    xml += `  <url>
    <loc>https://www.toolreviewshub.com/${siteDir}/${f}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });
  
  xml += `</urlset>
`;
  
  fs.writeFileSync(path.join(__dirname, '..', siteDir, 'sitemap.xml'), xml);
  console.log(`${siteDir}: ${htmlFiles.length + 1} URLs in sitemap`);
});

console.log('✅ All sitemaps regenerated with full article lists');
