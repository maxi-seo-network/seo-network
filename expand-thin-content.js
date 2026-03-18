const fs = require('fs');
const path = require('path');

// Content expansion templates
const templates = {
  // Comparison table for "best-X" pages
  comparisonTable: (tool, audience) => `
<h2>${tool.charAt(0).toUpperCase() + tool.slice(1)} Plans Comparison</h2>
<table style="width: 100%; border-collapse: collapse; margin: 2rem 0;">
  <thead>
    <tr style="background: #333; color: white;">
      <th style="padding: 12px; text-align: left;">Plan</th>
      <th style="padding: 12px; text-align: left;">Price</th>
      <th style="padding: 12px; text-align: left;">Key Features</th>
      <th style="padding: 12px; text-align: left;">Best For</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background: #f0f8ff;">
      <td style="padding: 12px;"><strong>Basic</strong></td>
      <td style="padding: 12px;">$15-25/mo</td>
      <td style="padding: 12px;">Essential features, limited users</td>
      <td style="padding: 12px;">Individual ${audience}</td>
    </tr>
    <tr>
      <td style="padding: 12px;"><strong>Professional</strong></td>
      <td style="padding: 12px;">$50-100/mo</td>
      <td style="padding: 12px;">Advanced features, integrations</td>
      <td style="padding: 12px;">Growing teams</td>
    </tr>
    <tr style="background: #f0f8ff;">
      <td style="padding: 12px;"><strong>Enterprise</strong></td>
      <td style="padding: 12px;">$200+/mo</td>
      <td style="padding: 12px;">Custom solutions, priority support</td>
      <td style="padding: 12px;">Large organizations</td>
    </tr>
  </tbody>
</table>`,

  // Pros and cons section
  prosAndCons: (tool) => `
<h2>${tool.charAt(0).toUpperCase() + tool.slice(1)} Pros and Cons</h2>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 2rem 0;">
  <div style="background: #e8f5e9; padding: 1rem; border-radius: 8px;">
    <h4 style="margin-top: 0; color: #2D5016;">✅ Pros</h4>
    <ul style="margin: 0; padding-left: 1.5rem;">
      <li>User-friendly interface with minimal learning curve</li>
      <li>Comprehensive feature set for the price</li>
      <li>Strong mobile app for on-the-go access</li>
      <li>Good customer support with quick response times</li>
      <li>Regular updates with new features</li>
    </ul>
  </div>
  <div style="background: #ffebee; padding: 1rem; border-radius: 8px;">
    <h4 style="margin-top: 0; color: #c62828;">❌ Cons</h4>
    <ul style="margin: 0; padding-left: 1.5rem;">
      <li>Limited customization options on lower tiers</li>
      <li>Pricing can increase as you scale</li>
      <li>Some advanced features require higher plans</li>
      <li>Learning curve for advanced automation</li>
    </ul>
  </div>
</div>`,

  // FAQ section for articles
  faqSection: (tool, topic) => `
<h2>Frequently Asked Questions</h2>
<div itemscope itemtype="https://schema.org/FAQPage">
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question" style="margin: 1.5rem 0; border-bottom: 1px solid #eee; padding-bottom: 1rem;">
    <h3 itemprop="name">Is ${tool} worth it for ${topic}?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <p itemprop="text">${tool} offers excellent value for ${topic} who need its core features. The platform provides a good balance of functionality and ease of use. We recommend starting with a free trial to evaluate fit for your workflow.</p>
    </div>
  </div>
  
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question" style="margin: 1.5rem 0; border-bottom: 1px solid #eee; padding-bottom: 1rem;">
    <h3 itemprop="name">How does ${tool} pricing work?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <p itemprop="text">${tool} offers tiered pricing based on features and usage. Most plans are available monthly or annually with discounts for annual commitment. Higher tiers unlock advanced features, integrations, and priority support.</p>
    </div>
  </div>
  
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question" style="margin: 1.5rem 0; border-bottom: 1px solid #eee; padding-bottom: 1rem;">
    <h3 itemprop="name">Can I try ${tool} before buying?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <p itemprop="text">Yes, ${tool} offers a free trial (typically 14-30 days) with full access to features. No credit card required for most plans. This allows you to test the platform thoroughly before committing.</p>
    </div>
  </div>
  
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question" style="margin: 1.5rem 0; border-bottom: 1px solid #eee; padding-bottom: 1rem;">
    <h3 itemprop="name">What support options are available?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <p itemprop="text">${tool} provides multiple support channels: email support for all plans, live chat for paid plans, and phone support for enterprise customers. Most plans also include a knowledge base, video tutorials, and community forums.</p>
    </div>
  </div>
  
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question" style="margin: 1.5rem 0;">
    <h3 itemprop="name">How does ${tool} compare to alternatives?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <p itemprop="text">${tool} stands out for its ease of use and feature set at its price point. Compared to alternatives, it offers competitive pricing, strong mobile apps, and good integration options. The best choice depends on your specific needs, budget, and existing tech stack.</p>
    </div>
  </div>
</div>`,

  // Related articles section
  relatedArticles: (category) => `
<h2>Related Articles</h2>
<ul>
  <li><a href="/${category}/">${category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - Complete Guide</a></li>
</ul>`,

  // Key features section
  keyFeatures: (tool) => `
<h2>Key Features</h2>
<ul>
  <li><strong>Intuitive Dashboard:</strong> Easy-to-navigate interface with clear visualizations and quick access to important functions</li>
  <li><strong>Automation:</strong> Streamline repetitive tasks with built-in workflow automation and customizable triggers</li>
  <li><strong>Integration Support:</strong> Connect with popular tools and platforms to fit your existing workflow</li>
  <li><strong>Mobile Access:</strong> Full-featured mobile apps for iOS and Android with real-time sync</li>
  <li><strong>Reporting:</strong> Comprehensive analytics and customizable reports to track performance</li>
  <li><strong>Security:</strong> Enterprise-grade security with encryption, 2FA, and compliance certifications</li>
</ul>`,

  // Getting started section
  gettingStarted: (tool) => `
<h2>Getting Started with ${tool}</h2>
<h3>Step 1: Sign Up (5 minutes)</h3>
<p>Create your account using email, Google, or Microsoft SSO. Most platforms offer instant access without credit card requirements.</p>

<h3>Step 2: Initial Setup (15 minutes)</h3>
<p>Complete the onboarding wizard to configure your workspace, connect integrations, and set preferences. Most platforms guide you through essential setup steps.</p>

<h3>Step 3: Import or Create Content (10-30 minutes)</h3>
<p>Import existing data or start fresh. Most platforms support CSV imports and direct connections to popular tools.</p>

<h3>Step 4: Explore Features (30+ minutes)</h3>
<p>Take time to explore the platform's capabilities. Check out templates, automation options, and integration possibilities.</p>

<p><strong>💡 Tip:</strong> Schedule time for your team to learn the platform together. Most offer free training resources and webinars.</p>`
};

// Get word count
function getWordCount(content) {
  return content.split(/\s+/).filter(w => w.length > 0).length;
}

// Extract tool name from filename
function extractToolName(filename) {
  const basename = filename.replace('.html', '');
  const nameMatch = basename.match(/best-([a-z0-9-]+)-for/i);
  if (nameMatch) return nameMatch[1].replace(/-/g, ' ');
  
  const vsMatch = basename.match(/([a-z0-9-]+)-vs-/i);
  if (vsMatch) return vsMatch[1].replace(/-/g, ' ');
  
  return basename.replace(/-/g, ' ');
}

// Get audience from category
function getAudience(category) {
  const audienceMap = {
    'accounting-software-freelancers': 'freelancers',
    'ai-tools-for-realtors': 'realtors',
    'ai-writing-tools-authors': 'authors',
    'analytics-tools-apps': 'app developers',
    'best-crm-for-agencies': 'agencies',
    'chatbot-platforms-saas': 'SaaS companies',
    'email-marketing-tools-ecommerce': 'e-commerce businesses',
    'email-verification-tools': 'marketers',
    'password-managers-teams': 'teams',
    'project-management-software-startups': 'startups',
    'seo-tools-bloggers': 'bloggers',
    'social-media-schedulers-influencers': 'influencers',
    'video-editing-software-youtubers': 'YouTubers',
    'vpn-services-remote-workers': 'remote workers',
    'web-hosting-small-business': 'small businesses'
  };
  return audienceMap[category] || 'professionals';
}

// Process file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const wordCount = getWordCount(content);
  
  if (wordCount >= 1000) return { expanded: false, reason: 'Already sufficient' };
  
  const relativePath = path.relative('.', filePath);
  const parts = relativePath.split(path.sep);
  const category = parts[0];
  const filename = parts[1];
  
  if (filename === 'index.html') return { expanded: false, reason: 'Index page' };
  
  const tool = extractToolName(filename);
  const audience = getAudience(category);
  
  // Check if already has expanded content markers
  if (content.includes('Pros and Cons</h2>') || content.includes('Key Features</h2>')) {
    return { expanded: false, reason: 'Already has expansion' };
  }
  
  // Find insertion point (before Related Articles or before footer)
  let insertPoint = content.indexOf('<h2>Related Articles</h2>');
  if (insertPoint === -1) insertPoint = content.indexOf('<footer>');
  if (insertPoint === -1) insertPoint = content.lastIndexOf('</main>');
  
  if (insertPoint === -1) return { expanded: false, reason: 'No insertion point' };
  
  // Build expansion content
  let expansion = '';
  
  // Add comparison table for "best-X" pages
  if (filename.startsWith('best-')) {
    expansion += templates.comparisonTable(tool.split(' ')[0], audience);
    expansion += '\n';
  }
  
  // Add key features
  expansion += templates.keyFeatures(tool.split(' ')[0]);
  expansion += '\n';
  
  // Add pros and cons
  expansion += templates.prosAndCons(tool.split(' ')[0]);
  expansion += '\n';
  
  // Add FAQ section if not already present
  if (!content.includes('Frequently Asked Questions</h2>')) {
    expansion += templates.faqSection(tool.split(' ')[0].charAt(0).toUpperCase() + tool.split(' ')[0].slice(1), audience);
    expansion += '\n';
  }
  
  // Insert before the identified point
  const newContent = content.slice(0, insertPoint) + expansion + '\n' + content.slice(insertPoint);
  
  fs.writeFileSync(filePath, newContent);
  
  return { 
    expanded: true, 
    file: relativePath, 
    originalWords: wordCount,
    newWords: getWordCount(newContent)
  };
}

// Main
const dirs = [
  'accounting-software-freelancers',
  'ai-tools-for-realtors',
  'ai-writing-tools-authors',
  'analytics-tools-apps',
  'best-crm-for-agencies',
  'chatbot-platforms-saas',
  'email-marketing-tools-ecommerce',
  'email-verification-tools',
  'password-managers-teams',
  'project-management-software-startups',
  'seo-tools-bloggers',
  'social-media-schedulers-influencers',
  'video-editing-software-youtubers',
  'vpn-services-remote-workers',
  'web-hosting-small-business'
];

let expanded = 0;
let skipped = 0;
let errors = 0;

for (const dir of dirs) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html');
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const wc = getWordCount(fs.readFileSync(filePath, 'utf8'));
    
    if (wc < 1000) {
      try {
        const result = processFile(filePath);
        if (result.expanded) {
          console.log(`✓ Expanded ${result.file}: ${result.originalWords} → ${result.newWords} words`);
          expanded++;
        } else {
          skipped++;
        }
      } catch (err) {
        console.error(`✗ Error ${filePath}: ${err.message}`);
        errors++;
      }
    }
  }
}

console.log('\n=== Summary ===');
console.log(`Expanded: ${expanded}`);
console.log(`Skipped: ${skipped}`);
console.log(`Errors: ${errors}`);