const fs = require('fs');
const path = require('path');

// Affiliate programs mapping (ready to activate once approved)
const affiliatePrograms = {
  'email-marketing': {
    'klaviyo': 'https://klaviyo.com/?fpr=YOUR_ID',
    'mailchimp': 'https://mailchimp.com/?fpr=YOUR_ID',
    'convertkit': 'https://convertkit.com/?fpr=YOUR_ID',
    'activecampaign': 'https://activecampaign.com/?fpr=YOUR_ID'
  },
  'crm': {
    'hubspot': 'https://hubspot.com/?fpr=YOUR_ID',
    'pipedrive': 'https://pipedrive.com/?fpr=YOUR_ID',
    'salesforce': 'https://salesforce.com/?fpr=YOUR_ID'
  },
  'seo': {
    'semrush': 'https://semrush.com/?fpr=YOUR_ID',
    'ahrefs': 'https://ahrefs.com/?fpr=YOUR_ID',
    'moz': 'https://moz.com/?fpr=YOUR_ID'
  },
  'project-management': {
    'clickup': 'https://clickup.com/?fpr=YOUR_ID',
    'asana': 'https://asana.com/?fpr=YOUR_ID',
    'monday': 'https://monday.com/?fpr=YOUR_ID',
    'notion': 'https://notion.so/?fpr=YOUR_ID'
  },
  'video-editing': {
    'adobe': 'https://adobe.com/?fpr=YOUR_ID',
    'final-cut': 'https://apple.com/final-cut/?fpr=YOUR_ID'
  },
  'ecommerce': {
    'shopify': 'https://shopify.com/?fpr=YOUR_ID',
    'woocommerce': 'https://woocommerce.com/?fpr=YOUR_ID'
  },
  'social-media': {
    'buffer': 'https://buffer.com/?fpr=YOUR_ID',
    'hootsuite': 'https://hootsuite.com/?fpr=YOUR_ID',
    'later': 'https://later.com/?fpr=YOUR_ID'
  },
  'accounting': {
    'quickbooks': 'https://quickbooks.intuit.com/?fpr=YOUR_ID',
    'xero': 'https://xero.com/?fpr=YOUR_ID',
    'freshbooks': 'https://freshbooks.com/?fpr=YOUR_ID'
  }
};

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

// Map sites to affiliate categories
const siteCategories = {
  'accounting-software-freelancers': 'accounting',
  'ai-tools-for-realtors': 'crm',
  'analytics-tools-apps': 'seo',
  'best-crm-for-agencies': 'crm',
  'chatbot-platforms-saas': 'project-management',
  'email-marketing-tools-ecommerce': 'email-marketing',
  'project-management-software-startups': 'project-management',
  'seo-tools-bloggers': 'seo',
  'social-media-schedulers-influencers': 'social-media',
  'video-editing-software-youtubers': 'video-editing'
};

const ctaBox = `
  <div style="margin: 2rem 0; padding: 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
    <h3 style="margin-top: 0; color: white;">🎯 Ready to Get Started?</h3>
    <p>Try [PRODUCT] free today - no credit card required for trial.</p>
    <a href="[AFFILIATE_LINK]" rel="nofollow sponsored" style="display: inline-block; background: white; color: #667eea; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 0.5rem;">Start Free Trial →</a>
    <p style="font-size: 0.8rem; margin-top: 1rem; opacity: 0.9;">Disclosure: We may earn commission if you sign up through this link.</p>
  </div>
`;

let totalCount = 0;
let updatedCount = 0;

sites.forEach(siteDir => {
  const category = siteCategories[siteDir];
  const programs = affiliatePrograms[category] || {};
  const sitePath = path.join(__dirname, '..', siteDir);
  
  if (!fs.existsSync(sitePath)) return;
  
  const htmlFiles = fs.readdirSync(sitePath).filter(f => 
    f.endsWith('.html') && 
    !['index.html', 'about.html', 'contact.html', 'privacy.html', 'terms.html'].includes(f)
  );
  
  htmlFiles.forEach(filename => {
    const filePath = path.join(sitePath, filename);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has CTA
    if (content.includes('Ready to Get Started')) {
      totalCount++;
      return;
    }
    
    // Extract product name from filename
    const productName = filename
      .replace('.html', '')
      .replace(/^(best-|how-to-use-)/, '')
      .replace(/-vs-.*/, '')
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    
    // Find matching affiliate link
    let affiliateLink = '#';
    for (const [key, url] of Object.entries(programs)) {
      if (filename.toLowerCase().includes(key)) {
        affiliateLink = url;
        break;
      }
    }
    
    // Insert CTA before footer
    const cta = ctaBox
      .replace(/\[PRODUCT\]/g, productName)
      .replace(/\[AFFILIATE_LINK\]/g, affiliateLink);
    
    content = content.replace('</footer>', cta + '\n  </footer>');
    
    fs.writeFileSync(filePath, content);
    totalCount++;
    updatedCount++;
  });
  
  console.log(`${siteDir}: ${updatedCount}/${htmlFiles.length} articles updated`);
});

console.log(`\n✅ Total: ${updatedCount}/${totalCount} article pages updated with affiliate CTAs`);
console.log('📝 Note: Replace YOUR_ID with actual affiliate IDs once approved');
