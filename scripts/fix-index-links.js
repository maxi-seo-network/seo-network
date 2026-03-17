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

sites.forEach(siteDir => {
  const indexPath = path.join(__dirname, '..', siteDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.log(`Skip ${siteDir}: no index.html`);
    return;
  }
  
  let content = fs.readFileSync(indexPath, 'utf8');
  const htmlFiles = fs.readdirSync(path.join(__dirname, '..', siteDir))
    .filter(f => f.endsWith('.html') && f !== 'index.html' && f !== 'about.html' && f !== 'contact.html' && f !== 'privacy.html' && f !== 'terms.html')
    .sort();
  
  // Build article links section
  let articlesHTML = '';
  const bestFiles = htmlFiles.filter(f => f.startsWith('best-'));
  const howToFiles = htmlFiles.filter(f => f.startsWith('how-to-'));
  const vsFiles = htmlFiles.filter(f => f.startsWith('best-') || f.includes('-vs-'));
  
  articlesHTML += '      <div class="article-grid">\n';
  bestFiles.slice(0, 6).forEach(f => {
    const title = f.replace('.html', '').replace(/-/g, ' ').replace(/^best-/, 'Best ').replace(/for |in /g, 'for/in ').toUpperCase();
    articlesHTML += `        <article>\n          <h3><a href="/${siteDir}/${f}">${title}</a></h3>\n          <p>Top ${title} solutions compared</p>\n        </article>\n`;
  });
  articlesHTML += '      </div>\n';
  
  // Replace the featured section
  content = content.replace(
    /<section class="featured">[\s\S]*?<\/section>/,
    `<section class="featured">
      <h2>Featured Articles</h2>
${articlesHTML}`
  );
  
  // Fix nav links - remove about/contact since they don't exist
  content = content.replace(
    /<ul>\s*<li><a href="\/about">About<\/a><\/li>\s*<li><a href="\/contact">Contact<\/a><\/li>\s*<\/ul>/,
    '<ul>\n        <li><a href="/' + siteDir + '/sitemap.xml">Sitemap</a></li>\n      </ul>'
  );
  
  // Fix category links
  content = content.replace(
    /<li><a href="\/best-tools">Best Tools<\/a><\/li>\s*<li><a href="\/how-to-guides">How-To Guides<\/a><\/li>\s*<li><a href="\/comparisons">Tool Comparisons<\/a><\/li>\s*<li><a href="\/pricing">Pricing Guides<\/a><\/li>/,
    `<li><a href="#best">Best Tools</a></li>\n        <li><a href="#howto">How-To Guides</a></li>\n        <li><a href="#vs">Comparisons</a></li>`
  );
  
  fs.writeFileSync(indexPath, content);
  console.log(`Fixed ${siteDir}/index.html - ${htmlFiles.length} articles linked`);
});

console.log('✅ All index files fixed');
