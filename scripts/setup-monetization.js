#!/usr/bin/env node
/**
 * Monetization Setup Script
 * Configures AdSense, Ezoic, and affiliate integrations
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  buildDir: process.argv[2] || '../build',
  adsensePublisherId: process.env.ADSENSE_PUBLISHER_ID || 'ca-pub-XXXXXXXXXXXXXXXX',
  googleAnalyticsId: process.env.GA_ID || 'GA-XXXXXXXXXX',
  amazonAssociatesTag: process.env.AMAZON_TAG || 'yoursite-20',
  ezoicSiteId: process.env.EZOIC_SITE_ID || ''
};

function injectMonetization(sitePath) {
  console.log(`💰 Setting up monetization for: ${path.basename(sitePath)}`);
  
  const indexPath = path.join(sitePath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.warn(`⚠️  No index.html found in ${sitePath}`);
    return false;
  }
  
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Inject AdSense
  const adsenseScript = `<!-- AdSense Auto Ads -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CONFIG.adsensePublisherId}" crossorigin="anonymous"></script>
<!-- AdSense Ad Unit -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${CONFIG.adsensePublisherId}"
     data-ad-slot="1234567890"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`;

  // Inject before </head>
  html = html.replace('</head>', `${adsenseScript}\n</head>`);
  
  // Inject Google Analytics
  const gaScript = `<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${CONFIG.googleAnalyticsId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${CONFIG.googleAnalyticsId}');
</script>`;

  html = html.replace('</head>', `${gaScript}\n</head>`);
  
  // Inject Amazon Associates disclosure (required for compliance)
  const amazonDisclosure = `<!-- Amazon Associates Disclosure -->
<div style="font-size: 0.8rem; color: #666; margin-top: 2rem;">
  <p>As an Amazon Associate I earn from qualifying purchases.</p>
</div>`;

  html = html.replace('</footer>', `${amazonDisclosure}\n</footer>`);
  
  // Write updated file
  fs.writeFileSync(indexPath, html);
  
  // Process content pages too
  const contentDir = path.join(sitePath, 'content');
  if (fs.existsSync(contentDir)) {
    const files = fs.readdirSync(contentDir);
    for (const file of files) {
      if (file.endsWith('.html')) {
        const filePath = path.join(contentDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace('</head>', `${gaScript}\n</head>`);
        fs.writeFileSync(filePath, content);
      }
    }
  }
  
  // Create monetization config
  const monetizationConfig = {
    site: path.basename(sitePath),
    adsense: {
      publisherId: CONFIG.adsensePublisherId,
      status: 'pending_approval',
      autoAds: true
    },
    analytics: {
      gaId: CONFIG.googleAnalyticsId,
      status: 'active'
    },
    affiliates: {
      amazon: {
        tag: CONFIG.amazonAssociatesTag,
        status: 'pending_approval'
      },
      ezoic: {
        siteId: CONFIG.ezoicSiteId,
        status: CONFIG.ezoicSiteId ? 'active' : 'not_configured'
      }
    },
    configured: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(sitePath, 'monetization.config.json'),
    JSON.stringify(monetizationConfig, null, 2)
  );
  
  console.log(`✅ Monetization configured for ${path.basename(sitePath)}`);
  return true;
}

function setupAllSites() {
  console.log('💰 Setting up monetization for all sites...\n');
  
  const buildDir = path.resolve(CONFIG.buildDir);
  if (!fs.existsSync(buildDir)) {
    console.error(`❌ Build directory not found: ${buildDir}`);
    console.log('Run build-sites.js first');
    return [];
  }
  
  const sites = fs.readdirSync(buildDir).filter(f => 
    fs.statSync(path.join(buildDir, f)).isDirectory()
  );
  
  const configuredSites = [];
  
  for (const site of sites) {
    const sitePath = path.join(buildDir, site);
    if (injectMonetization(sitePath)) {
      configuredSites.push(site);
    }
  }
  
  console.log('\n✅ Monetization setup complete!');
  console.log(`Sites configured: ${configuredSites.length}`);
  
  // Save monetization manifest
  const manifest = {
    configuredAt: new Date().toISOString(),
    sites: configuredSites,
    config: CONFIG
  };
  
  fs.writeFileSync(
    path.join(buildDir, 'monetization-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  console.log('\n⚠️  IMPORTANT: AdSense and Amazon Associates require manual approval');
  console.log('Next steps:');
  console.log('1. Apply for Google AdSense: https://adsense.google.com');
  console.log('2. Join Amazon Associates: https://affiliate-program.amazon.com');
  console.log('3. Consider Ezoic for faster approval: https://www.ezoic.com');
  
  return configuredSites;
}

if (require.main === module) {
  setupAllSites();
}

module.exports = { injectMonetization, setupAllSites };
