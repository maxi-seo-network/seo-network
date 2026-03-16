#!/usr/bin/env node
/**
 * Static Site Builder
 * Converts markdown content to HTML and deploys to GitHub Pages
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG = {
  sitesDir: process.argv[2] || '../sites',
  outputDir: process.argv[3] || '../build',
  githubOrg: process.env.GITHUB_ORG || 'maxi-seo-network',
  deployBranch: 'gh-pages'
};

// Simple markdown to HTML converter
function markdownToHtml(md) {
  let html = md;
  
  // Frontmatter extraction
  const frontmatterMatch = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  let frontmatter = {};
  let content = md;
  
  if (frontmatterMatch) {
    frontmatter = parseFrontmatter(frontmatterMatch[1]);
    content = frontmatterMatch[2];
  }
  
  // Basic markdown conversions
  html = content
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/\n- (.*$)/gm, '<li>$1</li>')
    .replace(/\|(.*)\|/g, '<table><tr>$1</tr></table>')
    .replace(/\n\n/g, '</p><p>');
  
  return { frontmatter, html };
}

function parseFrontmatter(fm) {
  const obj = {};
  fm.split('\n').forEach(line => {
    const [key, value] = line.split(':');
    if (key && value) {
      obj[key.trim()] = value.trim().replace(/^"|"$/g, '');
    }
  });
  return obj;
}

// HTML template
function generateHtmlTemplate(title, content, siteConfig) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${siteConfig.description || title}">
  <meta name="keywords" content="${siteConfig.keywords || ''}">
  <link rel="stylesheet" href="/styles.css">
  <!-- AdSense placeholder -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
</head>
<body>
  <header>
    <nav>
      <a href="/" class="logo">${siteConfig.siteName || 'SEO Network'}</a>
      <ul>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <article>
      ${content}
    </article>
  </main>
  
  <footer>
    <p>&copy; 2026 ${siteConfig.siteName || 'SEO Network'}. All rights reserved.</p>
    <p>
      <a href="/privacy">Privacy Policy</a> | 
      <a href="/terms">Terms of Service</a> | 
      <a href="/sitemap.xml">Sitemap</a>
    </p>
  </footer>
  
  <!-- Analytics placeholder -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=GA-XXXXXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA-XXXXXXXXXX');
  </script>
</body>
</html>`;
}

function buildSite(sitePath) {
  console.log(`🔨 Building site: ${path.basename(sitePath)}`);
  
  const siteConfigPath = path.join(sitePath, 'site.config.json');
  if (!fs.existsSync(siteConfigPath)) {
    console.warn(`⚠️  No site.config.json found in ${sitePath}`);
    return null;
  }
  
  const siteConfig = JSON.parse(fs.readFileSync(siteConfigPath, 'utf8'));
  const contentDir = path.join(sitePath, 'content');
  const outputDir = path.join(CONFIG.outputDir, siteConfig.name);
  
  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });
  
  // Build content pages
  if (fs.existsSync(contentDir)) {
    const files = fs.readdirSync(contentDir);
    let pageCount = 0;
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const mdPath = path.join(contentDir, file);
        const md = fs.readFileSync(mdPath, 'utf8');
        const { frontmatter, html } = markdownToHtml(md);
        
        const htmlContent = generateHtmlTemplate(
          frontmatter.title || file.replace('.md', ''),
          html,
          { ...siteConfig, ...frontmatter }
        );
        
        const htmlPath = path.join(outputDir, file.replace('.md', '.html'));
        fs.writeFileSync(htmlPath, htmlContent);
        pageCount++;
      }
    }
    
    console.log(`   ✅ Built ${pageCount} pages`);
  }
  
  // Generate index.html
  const indexContent = generateIndexPage(siteConfig);
  fs.writeFileSync(path.join(outputDir, 'index.html'), indexContent);
  
  // Generate sitemap.xml
  generateSitemap(siteConfig, outputDir);
  
  // Generate robots.txt
  fs.writeFileSync(
    path.join(outputDir, 'robots.txt'),
    `User-agent: *
Allow: /
Sitemap: https://${CONFIG.githubOrg}.github.io/${siteConfig.name}/sitemap.xml
`
  );
  
  // Copy styles.css
  const stylesPath = path.join(CONFIG.outputDir, 'styles.css');
  if (!fs.existsSync(stylesPath)) {
    fs.writeFileSync(stylesPath, generateStyles());
  }
  
  return siteConfig;
}

function generateIndexPage(siteConfig) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteConfig.niche} for ${siteConfig.industry} | ${siteConfig.name}</title>
  <meta name="description" content="Best ${siteConfig.niche} solutions for ${siteConfig.industry} professionals. Compare tools, pricing, and features.">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <header>
    <nav>
      <a href="/" class="logo">${siteConfig.name.replace(/-/g, ' ').titleCase()}</a>
      <ul>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <h1>${siteConfig.niche} for ${siteConfig.industry}</h1>
    <p class="subtitle">Your complete guide to choosing the right tools</p>
    
    <section class="categories">
      <h2>Browse by Category</h2>
      <ul>
        <li><a href="/best-tools">Best Tools</a></li>
        <li><a href="/how-to-guides">How-To Guides</a></li>
        <li><a href="/comparisons">Tool Comparisons</a></li>
        <li><a href="/pricing">Pricing Guides</a></li>
      </ul>
    </section>
    
    <section class="featured">
      <h2>Featured Articles</h2>
      <div class="article-grid">
        <article>
          <h3><a href="/content/best-tools-for-${siteConfig.industry.toLowerCase()}.html">Best Tools for ${siteConfig.industry}</a></h3>
          <p>Complete comparison of top solutions</p>
        </article>
        <article>
          <h3><a href="/content/how-to-choose-tools.html">How to Choose the Right Tools</a></h3>
          <p>Step-by-step selection guide</p>
        </article>
        <article>
          <h3><a href="/content/pricing-comparison.html">Pricing Comparison 2026</a></h3>
          <p>Find the best value for your budget</p>
        </article>
      </div>
    </section>
  </main>
  
  <footer>
    <p>&copy; 2026 ${siteConfig.name.replace(/-/g, ' ')}. All rights reserved.</p>
    <p>
      <a href="/privacy">Privacy Policy</a> | 
      <a href="/terms">Terms of Service</a> | 
      <a href="/sitemap.xml">Sitemap</a>
    </p>
  </footer>
</body>
</html>`;
}

function generateSitemap(siteConfig, outputDir) {
  const contentDir = path.join(outputDir, 'content');
  let urls = [];
  
  if (fs.existsSync(contentDir)) {
    const files = fs.readdirSync(contentDir);
    for (const file of files) {
      if (file.endsWith('.html')) {
        urls.push(`  <url>
    <loc>https://${CONFIG.githubOrg}.github.io/${siteConfig.name}/content/${file}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
      }
    }
  }
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${CONFIG.githubOrg}.github.io/${siteConfig.name}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${urls.join('\n')}
</urlset>`;
  
  fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemap);
}

function generateStyles() {
  return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

header {
  background: #f8f9fa;
  padding: 1rem 0;
  border-bottom: 1px solid #e9ecef;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2563eb;
  text-decoration: none;
}

nav ul {
  display: flex;
  list-style: none;
  gap: 2rem;
}

nav a {
  color: #495057;
  text-decoration: none;
}

nav a:hover {
  color: #2563eb;
}

main {
  padding: 3rem 0;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
}

.subtitle {
  font-size: 1.25rem;
  color: #6c757d;
  margin-bottom: 2rem;
}

section {
  margin-bottom: 3rem;
}

h2 {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.categories ul {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.categories a {
  display: block;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-decoration: none;
  color: #2563eb;
  font-weight: 500;
}

.categories a:hover {
  background: #e9ecef;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

article {
  padding: 1.5rem;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
}

article h3 {
  margin-bottom: 0.5rem;
}

article h3 a {
  color: #2563eb;
  text-decoration: none;
}

article h3 a:hover {
  text-decoration: underline;
}

article p {
  color: #6c757d;
  font-size: 0.9rem;
}

footer {
  background: #f8f9fa;
  padding: 2rem 0;
  margin-top: 3rem;
  border-top: 1px solid #e9ecef;
  text-align: center;
  color: #6c757d;
}

footer a {
  color: #495057;
  margin: 0 0.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

th, td {
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  text-align: left;
}

th {
  background: #f8f9fa;
  font-weight: 600;
}

pre {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

code {
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  nav {
    flex-direction: column;
    gap: 1rem;
  }
  
  nav ul {
    gap: 1rem;
  }
  
  h1 {
    font-size: 2rem;
  }
}`;
}

String.prototype.titleCase = function() {
  return this.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

function buildAllSites() {
  console.log('🏗️  Building all sites...\n');
  
  const sitesDir = path.resolve(CONFIG.sitesDir);
  const sites = fs.readdirSync(sitesDir).filter(f => 
    fs.statSync(path.join(sitesDir, f)).isDirectory()
  );
  
  const builtSites = [];
  
  for (const site of sites) {
    const sitePath = path.join(sitesDir, site);
    const siteConfig = buildSite(sitePath);
    if (siteConfig) {
      builtSites.push(siteConfig);
    }
  }
  
  console.log('\n✅ Build complete!');
  console.log(`Sites built: ${builtSites.length}`);
  console.log(`Output directory: ${CONFIG.outputDir}`);
  
  // Save build manifest
  const manifest = {
    builtAt: new Date().toISOString(),
    sites: builtSites,
    outputDir: CONFIG.outputDir,
    githubOrg: CONFIG.githubOrg
  };
  
  fs.writeFileSync(
    path.join(CONFIG.outputDir, 'build-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  return builtSites;
}

if (require.main === module) {
  buildAllSites();
}

module.exports = { buildSite, buildAllSites, markdownToHtml };
