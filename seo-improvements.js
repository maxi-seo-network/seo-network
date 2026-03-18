const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.toolreviewshub.com';
const DATE_PUBLISHED = '2026-03-01';
const DATE_MODIFIED = '2026-03-18';

// Category mappings for internal linking
const categoryMap = {
  'accounting-software-freelancers': { name: 'Accounting Software for Freelancers', keywords: ['accounting', 'invoicing', 'bookkeeping', 'taxes'] },
  'ai-tools-for-realtors': { name: 'AI Tools for Realtors', keywords: ['ai', 'real estate', 'realtor', 'property'] },
  'ai-writing-tools-authors': { name: 'AI Writing Tools for Authors', keywords: ['ai', 'writing', 'content', 'authors'] },
  'analytics-tools-apps': { name: 'Analytics Tools for Apps', keywords: ['analytics', 'mobile', 'apps', 'data'] },
  'best-crm-for-agencies': { name: 'Best CRM for Agencies', keywords: ['crm', 'agencies', 'clients', 'sales'] },
  'chatbot-platforms-saas': { name: 'Chatbot Platforms for SaaS', keywords: ['chatbot', 'saas', 'automation', 'support'] },
  'email-marketing-tools-ecommerce': { name: 'Email Marketing for E-commerce', keywords: ['email', 'marketing', 'ecommerce', 'newsletter'] },
  'email-verification-tools': { name: 'Email Verification Tools', keywords: ['email', 'verification', 'validation', 'deliverability'] },
  'password-managers-teams': { name: 'Password Managers for Teams', keywords: ['password', 'security', 'teams', 'credentials'] },
  'project-management-software-startups': { name: 'Project Management for Startups', keywords: ['project management', 'startups', 'collaboration', 'tasks'] },
  'seo-tools-bloggers': { name: 'SEO Tools for Bloggers', keywords: ['seo', 'blogging', 'keywords', 'ranking'] },
  'social-media-schedulers-influencers': { name: 'Social Media Schedulers', keywords: ['social media', 'scheduling', 'influencers', 'content'] },
  'video-editing-software-youtubers': { name: 'Video Editing for YouTubers', keywords: ['video editing', 'youtube', 'content creation'] },
  'vpn-services-remote-workers': { name: 'VPN Services for Remote Workers', keywords: ['vpn', 'remote work', 'security', 'privacy'] },
  'web-hosting-small-business': { name: 'Web Hosting for Small Business', keywords: ['hosting', 'website', 'server', 'domain'] }
};

// Tool-specific FAQ data
const toolFAQs = {
  // Accounting tools
  'freshbooks': [
    { q: 'Is FreshBooks good for freelancers?', a: 'Yes, FreshBooks is excellent for freelancers because it was designed specifically for service-based businesses. It offers intuitive invoicing, built-in time tracking, and expense management. The interface is user-friendly and invoices look professional.' },
    { q: 'How much does FreshBooks cost?', a: 'FreshBooks offers three plans: Lite at $15/month (5 clients), Plus at $25/month (50 clients), and Premium at $50/month (unlimited clients). Annual billing can save up to 10%.' },
    { q: 'Does FreshBooks have a free plan?', a: 'FreshBooks offers a 30-day free trial but no permanently free plan. However, Wave Accounting provides similar core features for free if budget is a primary concern.' }
  ],
  'quickbooks': [
    { q: 'Is QuickBooks good for freelancers?', a: 'QuickBooks Self-Employed is specifically designed for freelancers and independent contractors. It excels at tax estimation, mileage tracking, and separating business/personal expenses.' },
    { q: 'How much does QuickBooks Self-Employed cost?', a: 'QuickBooks Self-Employed starts at $15/month. It includes expense tracking, mileage logging, invoice creation, and quarterly tax estimation.' },
    { q: 'What\'s the difference between QuickBooks Self-Employed and Simple Start?', a: 'Self-Employed ($15/month) is for sole proprietors and freelancers with tax estimation features. Simple Start ($30/month) is for small businesses that need to track income and expenses without tax estimation.' }
  ],
  'xero': [
    { q: 'Is Xero good for freelancers?', a: 'Xero is excellent for freelancers, especially those working internationally. It offers strong multi-currency support, bank reconciliation, and connects with 800+ apps.' },
    { q: 'How much does Xero cost?', a: 'Xero offers three plans: Early ($15/month for 20 invoices), Growing ($42/month for unlimited invoices), and Established ($78/month with multi-currency).' },
    { q: 'Does Xero work for international freelancers?', a: 'Yes, Xero is one of the best choices for international freelancers. It supports 160+ currencies, automatic exchange rates, and is available in 180+ countries.' }
  ],
  'wave': [
    { q: 'Is Wave really free?', a: 'Yes, Wave Accounting is completely free for core features including invoicing, expense tracking, and basic reporting. Wave makes money through payment processing (2.9% + 60¢ per transaction) and optional payroll services.' },
    { q: 'What are Wave\'s limitations?', a: 'Wave lacks time tracking, project management, and has limited integrations compared to paid alternatives. It\'s best for simple freelance businesses with straightforward invoicing needs.' },
    { q: 'Is Wave good for freelancers?', a: 'Wave is ideal for new freelancers on a budget. It covers essential accounting needs at no cost, though growing businesses may eventually need more robust features from paid alternatives.' }
  ],
  'zoho': [
    { q: 'Is Zoho Books good for freelancers?', a: 'Zoho Books offers excellent value for freelancers with a free plan for businesses under $50K revenue. It includes invoicing, expense tracking, and integrates with Zoho\'s ecosystem of 45+ apps.' },
    { q: 'How much does Zoho Books cost?', a: 'Zoho Books has a free plan, plus paid plans: Standard ($15/month), Professional ($40/month), and Premium ($60/month). The free plan supports up to $50K annual revenue.' },
    { q: 'Does Zoho integrate with other tools?', a: 'Yes, Zoho integrates with 45+ Zoho apps including CRM, Projects, and Inventory. It also connects with popular tools like PayPal, Stripe, Google Drive, and Zapier.' }
  ],
  // Generic fallback FAQs for comparison pages
  'comparison': [
    { q: 'Which tool is better for beginners?', a: 'For beginners, we recommend choosing the option with the easiest onboarding and best customer support. Look for tools offering free trials so you can test the interface before committing.' },
    { q: 'Can I switch between these tools easily?', a: 'Most modern tools offer data export and import features. The migration process typically takes 1-2 weeks and may require some manual data cleanup.' },
    { q: 'Do these tools offer free trials?', a: 'Most tools offer 14-30 day free trials. We recommend testing at least two options before making a final decision.' }
  ],
  'how-to': [
    { q: 'How long does it take to learn this tool?', a: 'Most users can become proficient within 1-2 weeks of regular use. Key features like basic invoicing and expense tracking can be learned in hours.' },
    { q: 'Do I need technical skills to use this?', a: 'No, these tools are designed for non-technical users. Most have intuitive interfaces with guided setup wizards and extensive help documentation.' },
    { q: 'Is support available if I get stuck?', a: 'Yes, most tools offer email support, knowledge bases, and many provide live chat or phone support during business hours.' }
  ]
};

// Extract tool name from filename
function extractToolName(filename) {
  // Handle patterns like "best-freshbooks-for-freelancers.html" or "freshbooks-vs-wave.html"
  const basename = filename.replace('.html', '');
  
  // Check for known tools
  const knownTools = ['freshbooks', 'quickbooks', 'xero', 'wave', 'zoho', 'freshsales', 
    'monday', 'notion', 'asana', 'trello', 'clickup', 'hubspot', 'salesforce', 
    'pipedrive', 'mailchimp', 'activecampaign', 'klaviyo', 'convertkit', 'sendinblue',
    'ahrefs', 'semrush', 'moz', 'surfer-seo', 'ubersuggest', 'buffer', 'hootsuite',
    'later', 'sprout-social', 'planoly', 'adobe-premiere', 'davinci-resolve', 
    'final-cut-pro', 'filmora', 'capcut', '1password', 'lastpass', 'dashlane',
    'bitwarden', 'keeper', 'nordpass', 'zoho-vault', 'enpass', 'roboform',
    'sticky-password', 'password-boss', 'myki', 'thycotic', 'selfemployed',
    'chatgpt', 'claude', 'jasper', 'copy-ai', 'rytr', 'writesonic'];
  
  for (const tool of knownTools) {
    if (basename.includes(tool)) {
      return tool;
    }
  }
  
  return null;
}

// Generate category-specific FAQs
function generateFAQs(filename, category, title) {
  const tool = extractToolName(filename);
  const faqs = [];
  
  // Try tool-specific FAQs first
  if (tool && toolFAQs[tool]) {
    faqs.push(...toolFAQs[tool].slice(0, 3));
  }
  
  // Add generic FAQs based on page type
  if (filename.includes('-vs-')) {
    faqs.push(...toolFAQs.comparison.slice(0, 2));
  } else if (filename.includes('how-to-use')) {
    faqs.push(...toolFAQs['how-to'].slice(0, 2));
  }
  
  // Ensure at least 3 FAQs
  if (faqs.length < 3) {
    faqs.push({
      q: 'Is this tool worth it?',
      a: 'The value depends on your specific needs. Most users find the time savings and automation features justify the monthly cost. We recommend starting with a free trial to evaluate fit for your workflow.'
    });
  }
  
  return faqs.slice(0, 5);
}

// Generate FAQ schema
function generateFAQSchema(faqs) {
  if (!faqs || faqs.length === 0) return '';
  
  const mainEntity = faqs.map(faq => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.a
    }
  }));
  
  return `
  <!-- FAQ Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": ${JSON.stringify(mainEntity, null, 2)}
  }
  </script>`;
}

// Generate Article schema
function generateArticleSchema(title, description, url, datePublished = DATE_PUBLISHED, dateModified = DATE_MODIFIED) {
  return `
  <!-- Article Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${title}",
    "description": "${description}",
    "author": {"@type": "Organization", "name": "Tools Reviews Hub"},
    "publisher": {"@type": "Organization", "name": "Tools Reviews Hub"},
    "datePublished": "${datePublished}",
    "dateModified": "${dateModified}"
  }
  </script>`;
}

// Find all HTML files in category directories
function findHTMLFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip non-category directories
      if (!entry.name.startsWith('.') && !['images', 'scripts', 'trading', 'memory'].includes(entry.name)) {
        files.push(...findHTMLFiles(fullPath));
      }
    } else if (entry.name.endsWith('.html') && entry.name !== 'index.html') {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Process a single HTML file
function processHTMLFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(process.cwd(), filePath);
  const parts = relativePath.split(path.sep);
  const category = parts[0];
  const filename = parts[1];
  
  let modified = false;
  const changes = [];
  
  // Check for Article schema
  const hasArticleSchema = content.includes('"@type": "Article"');
  
  // Check for FAQ schema
  const hasFAQSchema = content.includes('"@type": "FAQPage"');
  
  // Extract title from h1 or title tag
  const titleMatch = content.match(/<h1[^>]*>([^<]+)</i) || content.match(/<title>([^<|]+)/i);
  const title = titleMatch ? titleMatch[1].trim().replace(/\s*\|.*/, '') : 'Guide';
  
  // Extract meta description
  const descMatch = content.match(/<meta name="description" content="([^"]+)"/i);
  const description = descMatch ? descMatch[1].substring(0, 160) : title;
  
  // Generate URL
  const url = `${BASE_URL}/${category}/${filename}`;
  
  // Add Article Schema if missing
  if (!hasArticleSchema) {
    const articleSchema = generateArticleSchema(title, description, url);
    // Insert before </head>
    content = content.replace('</head>', `${articleSchema}\n</head>`);
    modified = true;
    changes.push('Added Article schema');
  }
  
  // Add FAQ Schema if missing
  if (!hasFAQSchema) {
    const faqs = generateFAQs(filename, category, title);
    const faqSchema = generateFAQSchema(faqs);
    // Insert before </head>
    content = content.replace('</head>', `${faqSchema}\n</head>`);
    modified = true;
    changes.push('Added FAQ schema');
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    return { file: relativePath, changes };
  }
  
  return null;
}

// Add internal links section
function addInternalLinks(content, category, filename) {
  // Check if Related Articles section exists
  if (content.includes('<h2>Related Articles</h2>') || content.includes('Related Articles</h2>')) {
    return content;
  }
  
  // Find related categories based on keywords
  const currentCat = categoryMap[category];
  if (!currentCat) return content;
  
  // Get other categories in same niche
  const relatedCategories = Object.entries(categoryMap)
    .filter(([key, val]) => {
      if (key === category) return false;
      return val.keywords.some(k => currentCat.keywords.includes(k));
    })
    .slice(0, 3);
  
  // Build related links HTML
  let linksHTML = '\n  <h2>Related Articles</h2>\n<ul>\n';
  
  // Add same-category links (we'll need to scan for these)
  linksHTML += `    <li><a href="/${category}/">${currentCat.name} - Complete Guide</a></li>\n`;
  
  // Add related category links
  for (const [catKey, catVal] of relatedCategories) {
    linksHTML += `    <li><a href="/${catKey}/">${catVal.name}</a></li>\n`;
  }
  
  linksHTML += '</ul>\n';
  
  // Insert before footer
  content = content.replace(/(\s*<footer>)/, `${linksHTML}$1`);
  
  return content;
}

// Main function
async function main() {
  console.log('Starting SEO improvements...\n');
  
  const files = findHTMLFiles('.');
  console.log(`Found ${files.length} HTML files to process\n`);
  
  let articleAdded = 0;
  let faqAdded = 0;
  let errors = 0;
  
  for (const file of files) {
    try {
      const result = processHTMLFile(file);
      if (result) {
        console.log(`✓ ${result.file}: ${result.changes.join(', ')}`);
        if (result.changes.includes('Added Article schema')) articleAdded++;
        if (result.changes.includes('Added FAQ schema')) faqAdded++;
      }
    } catch (err) {
      console.error(`✗ Error processing ${file}: ${err.message}`);
      errors++;
    }
  }
  
  console.log('\n=== Summary ===');
  console.log(`Article schemas added: ${articleAdded}`);
  console.log(`FAQ schemas added: ${faqAdded}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total files processed: ${files.length}`);
}

main().catch(console.error);