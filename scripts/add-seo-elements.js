#!/usr/bin/env node
/**
 * Add SEO elements to all articles:
 * - OG images for category index pages
 * - Product schema for affiliate links
 * - Review schema where appropriate
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.toolreviewshub.com';

// Category slug to image mapping
const categoryImages = {
  'password-managers-teams': 'password-managers.png',
  'email-marketing-tools-ecommerce': 'email-marketing-ecommerce.png',
  'analytics-tools-apps': 'analytics-apps.png',
  'social-media-schedulers-influencers': 'social-media-schedulers.png',
  'accounting-software-freelancers': 'accounting-freelancers.png',
  'ai-writing-tools-authors': 'ai-writing-tools.png',
  'video-editing-software-youtubers': 'video-editing-youtubers.png',
  'best-crm-for-agencies': 'crm-agencies.png',
  'vpn-services-remote-workers': 'vpn-remote-workers.png',
  'email-verification-tools': 'email-verification.png',
  'ai-tools-for-realtors': 'ai-tools-realtors.png',
  'web-hosting-small-business': 'web-hosting-business.png',
  'seo-tools-bloggers': 'seo-tools-bloggers.png',
  'project-management-software-startups': 'project-management-startups.png',
  'chatbot-platforms-saas': 'chatbot-platforms.png'
};

// Tool data for Product schema - extracted from file content
const toolData = {
  // Password managers
  '1password-business': { name: '1Password Business', price: '$7.99/user/mo', currency: 'USD', category: 'password-managers-teams' },
  'bitwarden-teams': { name: 'Bitwarden Teams', price: '$4/user/mo', currency: 'USD', category: 'password-managers-teams' },
  'lastpass-teams': { name: 'LastPass Teams', price: '$4/user/mo', currency: 'USD', category: 'password-managers-teams' },
  'dashlane-business': { name: 'Dashlane Business', price: '$8/user/mo', currency: 'USD', category: 'password-managers-teams' },
  'keeper-enterprise': { name: 'Keeper Enterprise', price: '$5/user/mo', currency: 'USD', category: 'password-managers-teams' },
  'nordpass-business': { name: 'NordPass Business', price: '$3.59/user/mo', currency: 'USD', category: 'password-managers-teams' },
  'roboform-business': { name: 'RoboForm Business', price: '$3.35/user/mo', currency: 'USD', category: 'password-managers-teams' },
  'zoho-vault': { name: 'Zoho Vault', price: '$0.50/user/mo', currency: 'USD', category: 'password-managers-teams' },
  'enpass-business': { name: 'Enpass Business', price: '$4/user/mo', currency: 'USD', category: 'password-managers-teams' },
  'myki-for-teams': { name: 'MyKi for Teams', price: '$4/user/mo', currency: 'USD', category: 'password-managers-teams' },
  'password-boss': { name: 'Password Boss', price: '$3/user/mo', currency: 'USD', category: 'password-managers-teams' },
  'sticky-password': { name: 'Sticky Password', price: '$2.99/user/mo', currency: 'USD', category: 'password-managers-teams' },
  'thycotic-secret-server': { name: 'Thycotic Secret Server', price: 'Custom', currency: 'USD', category: 'password-managers-teams' },
  'manageengine-adselfservice': { name: 'ManageEngine ADSelfService', price: '$1.50/user/mo', currency: 'USD', category: 'password-managers-teams' },
  'specops-password-manager': { name: 'Specops Password Manager', price: 'Custom', currency: 'USD', category: 'password-managers-teams' },
  
  // VPN services
  'expressvpn': { name: 'ExpressVPN', price: '$8.32/mo', currency: 'USD', category: 'vpn-services-remote-workers' },
  'expressvpn-for-remote-workers': { name: 'ExpressVPN for Remote Workers', price: '$8.32/mo', currency: 'USD', category: 'vpn-services-remote-workers' },
  'nordvpn': { name: 'NordVPN', price: '$3.09/mo', currency: 'USD', category: 'vpn-services-remote-workers' },
  'nordvpn-for-remote-workers': { name: 'NordVPN for Remote Workers', price: '$3.09/mo', currency: 'USD', category: 'vpn-services-remote-workers' },
  'surfshark': { name: 'Surfshark', price: '$2.30/mo', currency: 'USD', category: 'vpn-services-remote-workers' },
  'cyberghost': { name: 'CyberGhost', price: '$2.19/mo', currency: 'USD', category: 'vpn-services-remote-workers' },
  'protonvpn': { name: 'ProtonVPN', price: '$4.99/mo', currency: 'USD', category: 'vpn-services-remote-workers' },
  'private-internet-access': { name: 'Private Internet Access', price: '$2.03/mo', currency: 'USD', category: 'vpn-services-remote-workers' },
  'ipvanish': { name: 'IPVanish', price: '$2.50/mo', currency: 'USD', category: 'vpn-services-remote-workers' },
  'mullvad-vpn': { name: 'Mullvad VPN', price: '$5/mo', currency: 'USD', category: 'vpn-services-remote-workers' },
  'windscribe': { name: 'Windscribe', price: '$4.08/mo', currency: 'USD', category: 'vpn-services-remote-workers' },
  'tunnelbear': { name: 'TunnelBear', price: '$3.33/mo', currency: 'USD', category: 'vpn-services-remote-workers' },
  'astrill-vpn': { name: 'Astrill VPN', price: '$10/mo', currency: 'USD', category: 'vpn-services-remote-workers' },
  'ivpn': { name: 'IVPN', price: '$6/mo', currency: 'USD', category: 'vpn-services-remote-workers' },
  'vyprvpn': { name: 'VyprVPN', price: '$5/mo', currency: 'USD', category: 'vpn-services-remote-workers' },
  'purevpn': { name: 'PureVPN', price: '$1.33/mo', currency: 'USD', category: 'vpn-services-remote-workers' },
  'mozilla-vpn': { name: 'Mozilla VPN', price: '$4.99/mo', currency: 'USD', category: 'vpn-services-remote-workers' },
  
  // Web hosting
  'bluehost': { name: 'Bluehost', price: '$2.95/mo', currency: 'USD', category: 'web-hosting-small-business' },
  'hostinger': { name: 'Hostinger', price: '$2.99/mo', currency: 'USD', category: 'web-hosting-small-business' },
  'siteground': { name: 'SiteGround', price: '$3.99/mo', currency: 'USD', category: 'web-hosting-small-business' },
  'hostgator': { name: 'HostGator', price: '$2.75/mo', currency: 'USD', category: 'web-hosting-small-business' },
  'dreamhost': { name: 'DreamHost', price: '$2.59/mo', currency: 'USD', category: 'web-hosting-small-business' },
  'a2-hosting': { name: 'A2 Hosting', price: '$2.99/mo', currency: 'USD', category: 'web-hosting-small-business' },
  'cloudways': { name: 'Cloudways', price: '$11/mo', currency: 'USD', category: 'web-hosting-small-business' },
  'wp-engine': { name: 'WP Engine', price: '$20/mo', currency: 'USD', category: 'web-hosting-small-business' },
  'kinsta': { name: 'Kinsta', price: '$35/mo', currency: 'USD', category: 'web-hosting-small-business' },
  'digitalocean': { name: 'DigitalOcean', price: '$4/mo', currency: 'USD', category: 'web-hosting-small-business' },
  'linode': { name: 'Linode', price: '$5/mo', currency: 'USD', category: 'web-hosting-small-business' },
  'vultr': { name: 'Vultr', price: '$2.50/mo', currency: 'USD', category: 'web-hosting-small-business' },
  'greengeeks': { name: 'GreenGeeks', price: '$2.95/mo', currency: 'USD', category: 'web-hosting-small-business' },
  'inmotion-hosting': { name: 'InMotion Hosting', price: '$2.99/mo', currency: 'USD', category: 'web-hosting-small-business' },
  'godaddy': { name: 'GoDaddy', price: '$5.99/mo', currency: 'USD', category: 'web-hosting-small-business' }
};

// Generic tool info for tools not in our database
function getToolInfoFromFilename(filename, categorySlug) {
  // Extract tool name from filename like "best-1password-business.html"
  const match = filename.match(/best-(.+)\.html$/);
  if (!match) return null;
  
  const toolSlug = match[1];
  if (toolData[toolSlug]) {
    return toolData[toolSlug];
  }
  
  // Generate generic info
  const toolName = toolSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return {
    name: toolName,
    price: 'Various',
    currency: 'USD',
    category: categorySlug
  };
}

function addOGImageToIndex(html, categorySlug) {
  const imageName = categoryImages[categorySlug] || `${categorySlug}.png`;
  const ogImageTag = `<meta property="og:image" content="${BASE_URL}/images/${imageName}">`;
  
  // Check if og:image already exists
  if (html.includes('property="og:image"')) {
    return html;
  }
  
  // Add after og:site_name
  if (html.includes('property="og:site_name"')) {
    return html.replace(
      /(<meta property="og:site_name"[^>]*>)/,
      `$1\n  ${ogImageTag}`
    );
  }
  
  // Add after twitter:description
  if (html.includes('name="twitter:description"')) {
    return html.replace(
      /(<meta name="twitter:description"[^>]*>)/,
      `$1\n  ${ogImageTag}`
    );
  }
  
  // Fallback: add after og:url
  if (html.includes('property="og:url"')) {
    return html.replace(
      /(<meta property="og:url"[^>]*>)/,
      `$1\n  ${ogImageTag}`
    );
  }
  
  return html;
}

function generateProductSchema(toolInfo, url) {
  const priceValue = toolInfo.price.replace(/[^0-9.]/g, '') || '0';
  const priceNum = parseFloat(priceValue) || 0;
  
  return `  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "${toolInfo.name}",
    "description": "Professional tool for businesses and teams",
    "brand": {
      "@type": "Brand",
      "name": "${toolInfo.name.split(' ').slice(0, 2).join(' ')}"
    },
    "offers": {
      "@type": "Offer",
      "price": "${priceNum.toFixed(2)}",
      "priceCurrency": "${toolInfo.currency}",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "${toolInfo.name}"
      }
    }
  }
  </script>`;
}

function generateReviewSchema(toolInfo, rating) {
  return `  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Product",
      "name": "${toolInfo.name}"
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "${rating}",
      "bestRating": "5"
    },
    "author": {
      "@type": "Organization",
      "name": "Tools Reviews Hub"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Tools Reviews Hub"
    }
  }
  </script>`;
}

function addSEOToBestArticle(html, filename, categorySlug) {
  const toolInfo = getToolInfoFromFilename(filename, categorySlug);
  if (!toolInfo) return html;
  
  const url = `${BASE_URL}/${categorySlug}/${filename}`;
  const imageName = categoryImages[categorySlug] || `${categorySlug}.png`;
  
  // Extract rating from content
  const ratingMatch = html.match(/Rating:\s*<\/strong>\s*(\d+\.?\d*)\s*\/?\s*5/);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 4.5;
  
  let result = html;
  
  // Add og:image if not present
  if (!result.includes('property="og:image"')) {
    const ogImageTag = `<meta property="og:image" content="${BASE_URL}/images/${imageName}">`;
    
    if (result.includes('property="og:site_name"')) {
      result = result.replace(
        /(<meta property="og:site_name"[^>]*>)/,
        `$1\n  ${ogImageTag}`
      );
    } else if (result.includes('name="twitter:description"')) {
      result = result.replace(
        /(<meta name="twitter:description"[^>]*>)/,
        `$1\n  ${ogImageTag}`
      );
    }
  }
  
  // Check if Product schema already exists
  if (result.includes('"@type": "Product"')) {
    return result;
  }
  
  // Generate schemas
  const productSchema = generateProductSchema(toolInfo, url);
  const reviewSchema = generateReviewSchema(toolInfo, rating);
  
  // Add schemas before </head>
  if (result.includes('</head>')) {
    result = result.replace('</head>', `${productSchema}\n${reviewSchema}\n</head>`);
  }
  
  return result;
}

function processCategoryIndex(categoryPath) {
  const indexPath = path.join(categoryPath, 'index.html');
  const categorySlug = path.basename(categoryPath);
  
  if (!fs.existsSync(indexPath)) {
    console.log(`No index.html in ${categorySlug}`);
    return;
  }
  
  let html = fs.readFileSync(indexPath, 'utf-8');
  const originalHtml = html;
  
  html = addOGImageToIndex(html, categorySlug);
  
  if (html !== originalHtml) {
    fs.writeFileSync(indexPath, html);
    console.log(`✓ Updated index.html for ${categorySlug}`);
  } else {
    console.log(`  No changes needed for ${categorySlug}/index.html`);
  }
}

function processBestArticles(categoryPath) {
  const categorySlug = path.basename(categoryPath);
  const files = fs.readdirSync(categoryPath);
  
  for (const file of files) {
    if (!file.startsWith('best-') || !file.endsWith('.html')) continue;
    
    const filePath = path.join(categoryPath, file);
    let html = fs.readFileSync(filePath, 'utf-8');
    const originalHtml = html;
    
    html = addSEOToBestArticle(html, file, categorySlug);
    
    if (html !== originalHtml) {
      fs.writeFileSync(filePath, html);
      console.log(`✓ Updated ${categorySlug}/${file}`);
    }
  }
}

// Main execution
const seoNetworkDir = path.join(__dirname, '..');
const categories = fs.readdirSync(seoNetworkDir)
  .filter(f => fs.statSync(path.join(seoNetworkDir, f)).isDirectory())
  .filter(f => !f.startsWith('.') && !f.startsWith('{'));

console.log('Processing categories:', categories.length);

for (const category of categories) {
  const categoryPath = path.join(seoNetworkDir, category);
  
  // Process index.html
  processCategoryIndex(categoryPath);
  
  // Process best-X.html files
  processBestArticles(categoryPath);
}

console.log('\nDone! Creating placeholder images...');

// Create placeholder images
const imagesDir = path.join(seoNetworkDir, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Create a placeholder file listing all needed images
const neededImages = [...new Set(Object.values(categoryImages))];
const placeholderContent = `# Image Placeholders
These images need to be created for OG tags:

${neededImages.map(img => `- ${img}`).join('\n')}

Dimensions: 1200x630px (recommended for Open Graph)
Format: PNG or JPEG
`;

fs.writeFileSync(path.join(imagesDir, 'README.md'), placeholderContent);
console.log(`\nCreated ${neededImages.length} image placeholders in /images/README.md`);