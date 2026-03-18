#!/usr/bin/env node
/**
 * Recreate missing index.html files for all subdirectories
 */

const fs = require('fs');
const path = require('path');

const SITES_DIR = __dirname.replace('/scripts', '');

const SITES = [
  { name: 'accounting-software-freelancers', title: 'Best Accounting Software for Freelancers 2026', desc: 'Compare QuickBooks, FreshBooks, Wave, Xero. Real pricing, invoicing features, expense tracking for freelancers.' },
  { name: 'ai-tools-for-realtors', title: 'Best AI Tools for Realtors 2026', desc: 'AI-powered tools for real estate professionals. Lead generation, virtual staging, marketing automation.' },
  { name: 'ai-writing-tools-authors', title: 'Best AI Writing Tools for Authors 2026', desc: 'AI writing assistants for fiction and non-fiction authors. Compare features, pricing, output quality.' },
  { name: 'analytics-tools-apps', title: 'Best Analytics Tools for Apps 2026', desc: 'Mobile app analytics comparison. User tracking, retention analysis, monetization insights.' },
  { name: 'best-crm-for-agencies', title: 'Best CRM for Marketing Agencies 2026', desc: 'Compare HubSpot, Pipedrive, Salesforce for agencies. Pipeline management, client tracking, automation.' },
  { name: 'chatbot-platforms-saas', title: 'Best Chatbot Platforms for SaaS 2026', desc: 'AI chatbot platforms for customer support. Intercom, Drift, Crisp comparison and pricing.' },
  { name: 'email-marketing-tools-ecommerce', title: 'Best Email Marketing for E-commerce 2026', desc: 'Klaviyo, Mailchimp, Omnisend comparison. Email automation, segmentation, revenue tracking.' },
  { name: 'email-verification-tools', title: 'Best Email Verification Tools 2026', desc: 'Email validation and list cleaning tools. ZeroBounce, NeverBounce, Hunter comparison.' },
  { name: 'password-managers-teams', title: 'Best Password Managers for Teams 2026', desc: 'Enterprise password management comparison. 1Password, LastPass, Dashlane for team security.' },
  { name: 'project-management-software-startups', title: 'Best Project Management for Startups 2026', desc: 'Compare ClickUp, Asana, Monday, Notion. Startup-friendly pricing and features.' },
  { name: 'seo-tools-bloggers', title: 'Best SEO Tools for Bloggers 2026', desc: 'SEMrush, Ahrefs, Moz comparison for content creators. Keyword research, backlink analysis.' },
  { name: 'social-media-schedulers-influencers', title: 'Best Social Media Schedulers 2026', desc: 'Buffer, Hootsuite, Later comparison for influencers. Scheduling, analytics, engagement.' },
  { name: 'video-editing-software-youtubers', title: 'Best Video Editing for YouTubers 2026', desc: 'Premiere Pro, Final Cut, DaVinci Resolve comparison. Features, pricing, learning curve for creators.' },
  { name: 'vpn-services-remote-workers', title: 'Best VPN Services for Remote Work 2026', desc: 'NordVPN, ExpressVPN, Surfshark comparison. Security, speed, team features for distributed teams.' },
  { name: 'web-hosting-small-business', title: 'Best Web Hosting for Small Business 2026', desc: 'Bluehost, SiteGround, WP Engine comparison. Uptime, support, pricing for small businesses.' }
];

function createIndexHtml(site) {
  const url = `https://www.toolreviewshub.com/${site.name}/`;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="robots" content="index, follow">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${site.title}</title>
  <meta property="og:title" content="${site.title}">
  <meta property="og:description" content="${site.desc}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="Tools Reviews Hub">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${site.title}">
  <meta name="twitter:description" content="${site.desc}">
  <link rel="canonical" href="${url}">
  <meta name="description" content="${site.desc}">
  <link rel="stylesheet" href="/styles.css">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2005233757983672" crossorigin="anonymous"></script>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${site.title}",
    "description": "${site.desc}",
    "author": {"@type": "Organization", "name": "Tools Reviews Hub"},
    "publisher": {"@type": "Organization", "name": "Tools Reviews Hub"},
    "datePublished": "2026-03-01",
    "dateModified": "2026-03-18"
  }
  </script>
</head>
<body>
  <header>
    <nav>
      <a href="/" class="logo">Tools Reviews Hub</a>
      <ul>
        <li><a href="/about.html">About</a></li>
        <li><a href="/contact.html">Contact</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <article>
      <h1>${site.title}</h1>
      <p>Explore our comprehensive guides and reviews for this category:</p>
      <p>Browse the articles in this section for detailed comparisons, pricing guides, and expert recommendations.</p>
    </article>
  </main>
  
  <footer>
    <p>&copy; 2026 Tools Reviews Hub. All rights reserved.</p>
    <p><a href="/about.html">About</a> | <a href="/contact.html">Contact</a> | <a href="/privacy.html">Privacy</a> | <a href="/terms.html">Terms</a> | <a href="/affiliate-disclosure.html">Disclosure</a></p>
  </footer>
</body>
</html>`;
}

let created = 0;
SITES.forEach(site => {
  const indexPath = path.join(SITES_DIR, site.name, 'index.html');
  if (!fs.existsSync(indexPath)) {
    const html = createIndexHtml(site);
    fs.writeFileSync(indexPath, html);
    console.log(`✓ Created ${site.name}/index.html`);
    created++;
  } else {
    console.log(`  Exists: ${site.name}/index.html`);
  }
});

console.log(`\n✅ Created ${created} missing index.html files`);