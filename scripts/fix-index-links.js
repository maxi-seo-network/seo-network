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
  if (!fs.existsSync(indexPath)) return;
  
  const htmlFiles = fs.readdirSync(path.join(__dirname, '..', siteDir))
    .filter(f => f.endsWith('.html') && !['index.html', 'about.html', 'contact.html', 'privacy.html', 'terms.html'].includes(f))
    .sort();
  
  const bestFiles = htmlFiles.filter(f => f.startsWith('best-'));
  const howToFiles = htmlFiles.filter(f => f.startsWith('how-to-'));
  const vsFiles = htmlFiles.filter(f => f.includes('-vs-'));
  
  function formatTitle(filename) {
    return filename.replace('.html', '').replace(/-/g, ' ')
      .replace(/^best /, 'Best ')
      .replace(/^how to /, 'How to ')
      .replace(/ vs /g, ' vs ')
      .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  
  function buildArticleList(files, prefix) {
    let html = '';
    files.forEach(f => {
      const title = formatTitle(f);
      html += `        <article>\n          <h3><a href="/${siteDir}/${f}">${title}</a></h3>\n          <p>${prefix} ${title} guide</p>\n        </article>\n`;
    });
    return html;
  }
  
  let content = fs.readFileSync(indexPath, 'utf8');
  
  const bestHTML = buildArticleList(bestFiles, 'Complete comparison of');
  const howToHTML = buildArticleList(howToFiles, 'Step-by-step');
  const vsHTML = buildArticleList(vsFiles, 'Head-to-head');
  
  const newFeatured = `<section class="featured">
      <h2 id="best">Best Tools (${bestFiles.length})</h2>
      <div class="article-grid">
${bestHTML}      </div>
    </section>
    
    <section class="featured">
      <h2 id="howto">How-To Guides (${howToFiles.length})</h2>
      <div class="article-grid">
${howToHTML}      </div>
    </section>
    
    <section class="featured">
      <h2 id="vs">Comparisons (${vsFiles.length})</h2>
      <div class="article-grid">
${vsHTML}      </div>
    </section>`;
  
  content = content.replace(/<section class="featured">[\s\S]*<\/main>/, newFeatured + '\n  </main>');
  
  fs.writeFileSync(indexPath, content);
  console.log(`${siteDir}: ${bestFiles.length} best + ${howToFiles.length} how-to + ${vsFiles.length} vs = ${htmlFiles.length} total`);
});

console.log('✅ All index files updated with full article lists');
