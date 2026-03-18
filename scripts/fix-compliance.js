#!/usr/bin/env node
/**
 * Fix AdSense/Amazon Compliance Issues
 * - Updates footer links on all pages
 * - Adds affiliate disclosure to content pages
 * - Replaces placeholder affiliate IDs (when real IDs provided)
 */

const fs = require('fs');
const path = require('path');

const SITES_DIR = __dirname.replace('/scripts', '');

// Find all index.html files in subdirectories
const subdirs = fs.readdirSync(SITES_DIR, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .filter(dirent => !['scripts', 'memory', 'trading', 'dashboard', 'build'].includes(dirent.name))
  .map(dirent => dirent.name);

console.log(`Found ${subdirs.length} subdirectories to update`);

let updatedCount = 0;

subdirs.forEach(subdir => {
  const indexPath = path.join(SITES_DIR, subdir, 'index.html');
  
  if (!fs.existsSync(indexPath)) return;
  
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Fix 1: Update footer to include proper policy links
  const oldFooter = /<footer>[\s\S]*?<\/footer>/gi;
  const newFooter = `<footer>
    <p>&copy; 2026 Tools Reviews Hub. All rights reserved.</p>
    <p><a href="/about.html">About</a> | <a href="/contact.html">Contact</a> | <a href="/privacy.html">Privacy</a> | <a href="/terms.html">Terms</a> | <a href="/affiliate-disclosure.html">Disclosure</a></p>
    <p style="margin-top: 1rem; font-size: 0.85rem; color: #666;">
      <strong>Affiliate Disclosure:</strong> We participate in affiliate programs including Amazon Associates. When you click links and make purchases, we may earn a commission at no extra cost to you. <a href="/affiliate-disclosure.html" style="color: inherit; text-decoration: underline;">Learn more</a>.
    </p>
  </footer>`;
  
  if (oldFooter.test(html)) {
    html = html.replace(oldFooter, newFooter);
  }
  
  // Fix 2: Add disclosure near affiliate links (at top of article content)
  const contentStart = html.indexOf('<div class="content">');
  if (contentStart > -1 && !html.includes('affiliate-disclosure-banner')) {
    const disclosureBanner = `
    <div class="affiliate-disclosure-banner" style="background: #f8f9fa; padding: 1rem; border-radius: 4px; margin-bottom: 1.5rem; border-left: 4px solid #667eea;">
      <p style="margin: 0; font-size: 0.9rem;"><strong>Disclosure:</strong> This article contains affiliate links. We may earn a commission if you make a purchase through our links, at no extra cost to you. <a href="/affiliate-disclosure.html" style="color: #667eea;">Full disclosure</a>.</p>
    </div>
    `;
    html = html.slice(0, contentStart + '<div class="content">'.length) + disclosureBanner + html.slice(contentStart + '<div class="content">'.length);
  }
  
  // Fix 3: Add cookie consent banner if not present
  if (!html.includes('cookie-banner')) {
    const cookieBanner = `
  <!-- Cookie Consent Banner -->
  <div id="cookie-banner" style="position: fixed; bottom: 0; left: 0; right: 0; background: #333; color: white; padding: 1rem; display: none; z-index: 9999; font-size: 0.9rem;">
    <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <p style="margin: 0;">We use cookies to improve your experience. By continuing, you agree to our <a href="/privacy.html" style="color: #667eea;">Privacy Policy</a>.</p>
      <div style="display: flex; gap: 0.5rem;">
        <button onclick="acceptCookies()" style="background: #667eea; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Accept</button>
        <button onclick="declineCookies()" style="background: transparent; color: white; border: 1px solid white; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Decline</button>
      </div>
    </div>
  </div>
  <script>
    if (!localStorage.getItem('cookieConsent')) { document.getElementById('cookie-banner').style.display = 'block'; }
    function acceptCookies() { localStorage.setItem('cookieConsent', 'accepted'); document.getElementById('cookie-banner').style.display = 'none'; }
    function declineCookies() { localStorage.setItem('cookieConsent', 'declined'); document.getElementById('cookie-banner').style.display = 'none'; }
  </script>
</body>
</html>`;
    html = html.replace('</body>\n</html>', cookieBanner);
  }
  
  fs.writeFileSync(indexPath, html);
  updatedCount++;
  console.log(`Updated: ${subdir}/index.html`);
});

console.log(`\n✅ Updated ${updatedCount} subdirectory index files`);
console.log('Compliance fixes applied:');
console.log('  - Footer with policy links');
console.log('  - Affiliate disclosure banners');
console.log('  - Cookie consent banners');