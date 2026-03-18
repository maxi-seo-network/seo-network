#!/usr/bin/env node
/**
 * Fix AdSense/Amazon Compliance Issues - Article Pages
 * Updates all HTML article pages with proper disclosures and footer
 */

const fs = require('fs');
const path = require('path');

const SITES_DIR = __dirname.replace('/scripts', '');

// Find all HTML files in subdirectories
const subdirs = fs.readdirSync(SITES_DIR, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .filter(dirent => !['scripts', 'memory', 'trading', 'dashboard', 'build'].includes(dirent.name))
  .map(dirent => dirent.name);

let totalFiles = 0;
let updatedFiles = 0;

const newFooter = `<footer>
    <p>&copy; 2026 Tools Reviews Hub. All rights reserved.</p>
    <p><a href="/about.html">About</a> | <a href="/contact.html">Contact</a> | <a href="/privacy.html">Privacy</a> | <a href="/terms.html">Terms</a> | <a href="/affiliate-disclosure.html">Disclosure</a></p>
    <p style="margin-top: 1rem; font-size: 0.85rem; color: #666;">
      <strong>Affiliate Disclosure:</strong> We participate in affiliate programs including Amazon Associates. When you click links and make purchases, we may earn a commission at no extra cost to you. <a href="/affiliate-disclosure.html" style="color: inherit; text-decoration: underline;">Learn more</a>.
    </p>
  </footer>

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

subdirs.forEach(subdir => {
  const subdirPath = path.join(SITES_DIR, subdir);
  
  // Find all HTML files in the subdirectory
  const files = fs.readdirSync(subdirPath)
    .filter(file => file.endsWith('.html') && file !== 'index.html');
  
  files.forEach(file => {
    totalFiles++;
    const filePath = path.join(subdirPath, file);
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Check if file needs updating
    const needsFooterUpdate = html.includes('/about') && !html.includes('/about.html');
    const needsCookieBanner = !html.includes('cookie-banner');
    const needsDisclosure = html.includes('YOUR_ID') || html.includes('href="https://') && !html.includes('affiliate-disclosure-banner');
    
    if (needsFooterUpdate || needsCookieBanner) {
      // Replace old footer pattern
      const oldFooterPattern = /<footer>[\s\S]*?<\/footer>\s*<\/body>\s*<\/html>/gi;
      
      if (oldFooterPattern.test(html)) {
        html = html.replace(oldFooterPattern, newFooter);
        fs.writeFileSync(filePath, html);
        updatedFiles++;
      } else {
        // Try simpler replacement
        const simpleFooterPattern = /<footer>[\s\S]*?<\/footer>/gi;
        if (simpleFooterPattern.test(html)) {
          html = html.replace(simpleFooterPattern, newFooter.replace('</body>\n</html>', ''));
          // Add cookie banner before closing body
          if (!html.includes('cookie-banner')) {
            html = html.replace('</body>', `
  <div id="cookie-banner" style="position: fixed; bottom: 0; left: 0; right: 0; background: #333; color: white; padding: 1rem; display: none; z-index: 9999;">
    <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
      <p style="margin: 0;">We use cookies. <a href="/privacy.html" style="color: #667eea;">Privacy Policy</a></p>
      <button onclick="localStorage.setItem('cookieConsent','accepted');this.parentElement.parentElement.style.display='none'" style="background: #667eea; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Accept</button>
    </div>
  </div>
</body>`);
          }
          fs.writeFileSync(filePath, html);
          updatedFiles++;
        }
      }
    }
  });
});

console.log(`Processed ${totalFiles} article HTML files`);
console.log(`Updated ${updatedFiles} files`);