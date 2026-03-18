#!/usr/bin/env node
/**
 * Enhance Cross-Category Links
 * 
 * This script:
 * 1. Adds "See Also" sections with cross-category links
 * 2. Enhances existing "Related Articles" with better context
 * 3. Updates category index pages with cross-category references
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = '/home/node/.openclaw/workspace/seo-network';

// Category cross-linking map - which categories should link to each other
const CROSS_LINKS = {
  'email-marketing-tools-ecommerce': {
    relatedCategories: [
      { slug: 'best-crm-for-agencies', name: 'Best CRM for Agencies', reason: 'Integrate email campaigns with customer relationship management' },
      { slug: 'email-verification-tools', name: 'Email Verification Tools', reason: 'Ensure email deliverability and clean your lists' },
      { slug: 'project-management-software-startups', name: 'Project Management Software', reason: 'Coordinate email campaigns with team workflows' }
    ],
    keywords: ['CRM', 'customer management', 'email deliverability', 'email verification']
  },
  'best-crm-for-agencies': {
    relatedCategories: [
      { slug: 'email-marketing-tools-ecommerce', name: 'Email Marketing Tools', reason: 'Connect CRM with email marketing automation' },
      { slug: 'project-management-software-startups', name: 'Project Management Software', reason: 'Manage agency projects alongside client relationships' },
      { slug: 'accounting-software-freelancers', name: 'Accounting Software', reason: 'Track client billing and invoicing' }
    ],
    keywords: ['email marketing', 'project management', 'invoicing', 'client management']
  },
  'accounting-software-freelancers': {
    relatedCategories: [
      { slug: 'project-management-software-startups', name: 'Project Management Software', reason: 'Track time and manage projects alongside accounting' },
      { slug: 'best-crm-for-agencies', name: 'CRM for Agencies', reason: 'Manage client relationships and billing' }
    ],
    keywords: ['project management', 'time tracking', 'client billing']
  },
  'project-management-software-startups': {
    relatedCategories: [
      { slug: 'best-crm-for-agencies', name: 'CRM for Agencies', reason: 'Integrate project management with client relationships' },
      { slug: 'accounting-software-freelancers', name: 'Accounting Software', reason: 'Track project budgets and billing' },
      { slug: 'password-managers-teams', name: 'Password Managers', reason: 'Secure team credentials for project tools' }
    ],
    keywords: ['CRM', 'accounting', 'team collaboration', 'security']
  },
  'social-media-schedulers-influencers': {
    relatedCategories: [
      { slug: 'video-editing-software-youtubers', name: 'Video Editing Software', reason: 'Edit videos for social media content' },
      { slug: 'ai-writing-tools-authors', name: 'AI Writing Tools', reason: 'Generate social media captions and content' },
      { slug: 'seo-tools-bloggers', name: 'SEO Tools', reason: 'Optimize social content for search visibility' }
    ],
    keywords: ['video editing', 'content creation', 'SEO', 'content marketing']
  },
  'video-editing-software-youtubers': {
    relatedCategories: [
      { slug: 'social-media-schedulers-influencers', name: 'Social Media Schedulers', reason: 'Schedule and publish video content' },
      { slug: 'seo-tools-bloggers', name: 'SEO Tools', reason: 'Optimize video titles and descriptions' }
    ],
    keywords: ['social media', 'content scheduling', 'SEO']
  },
  'ai-writing-tools-authors': {
    relatedCategories: [
      { slug: 'seo-tools-bloggers', name: 'SEO Tools', reason: 'Optimize AI-generated content for search engines' },
      { slug: 'email-marketing-tools-ecommerce', name: 'Email Marketing Tools', reason: 'Create email campaigns with AI assistance' }
    ],
    keywords: ['SEO', 'content marketing', 'email marketing']
  },
  'seo-tools-bloggers': {
    relatedCategories: [
      { slug: 'ai-writing-tools-authors', name: 'AI Writing Tools', reason: 'Create SEO-optimized content with AI' },
      { slug: 'email-marketing-tools-ecommerce', name: 'Email Marketing Tools', reason: 'Build email lists with SEO-driven content' },
      { slug: 'analytics-tools-apps', name: 'Analytics Tools', reason: 'Track SEO performance and traffic' }
    ],
    keywords: ['content creation', 'email marketing', 'analytics', 'AI writing']
  },
  'analytics-tools-apps': {
    relatedCategories: [
      { slug: 'seo-tools-bloggers', name: 'SEO Tools', reason: 'Track SEO performance and rankings' },
      { slug: 'email-marketing-tools-ecommerce', name: 'Email Marketing Tools', reason: 'Measure email campaign performance' }
    ],
    keywords: ['SEO', 'email marketing', 'performance tracking']
  },
  'password-managers-teams': {
    relatedCategories: [
      { slug: 'vpn-services-remote-workers', name: 'VPN Services', reason: 'Secure team access with passwords and VPN' },
      { slug: 'project-management-software-startups', name: 'Project Management Software', reason: 'Share credentials securely within project teams' }
    ],
    keywords: ['VPN', 'security', 'team collaboration', 'remote work']
  },
  'vpn-services-remote-workers': {
    relatedCategories: [
      { slug: 'password-managers-teams', name: 'Password Managers', reason: 'Combine VPN security with password protection' },
      { slug: 'project-management-software-startups', name: 'Project Management Software', reason: 'Secure remote team collaboration' }
    ],
    keywords: ['password management', 'security', 'remote work']
  },
  'email-verification-tools': {
    relatedCategories: [
      { slug: 'email-marketing-tools-ecommerce', name: 'Email Marketing Tools', reason: 'Verify emails before marketing campaigns' },
      { slug: 'best-crm-for-agencies', name: 'CRM for Agencies', reason: 'Keep CRM contact data clean' }
    ],
    keywords: ['email marketing', 'CRM', 'deliverability']
  },
  'web-hosting-small-business': {
    relatedCategories: [
      { slug: 'email-marketing-tools-ecommerce', name: 'Email Marketing Tools', reason: 'Host email marketing landing pages' },
      { slug: 'seo-tools-bloggers', name: 'SEO Tools', reason: 'Optimize hosted websites for search' }
    ],
    keywords: ['email marketing', 'SEO', 'website']
  },
  'chatbot-platforms-saas': {
    relatedCategories: [
      { slug: 'email-marketing-tools-ecommerce', name: 'Email Marketing Tools', reason: 'Combine chatbots with email follow-ups' },
      { slug: 'best-crm-for-agencies', name: 'CRM for Agencies', reason: 'Capture leads via chatbots into CRM' }
    ],
    keywords: ['email marketing', 'CRM', 'lead generation']
  },
  'ai-tools-for-realtors': {
    relatedCategories: [
      { slug: 'best-crm-for-agencies', name: 'CRM for Agencies', reason: 'Manage real estate leads with CRM' },
      { slug: 'email-marketing-tools-ecommerce', name: 'Email Marketing Tools', reason: 'Nurture real estate leads with email campaigns' }
    ],
    keywords: ['CRM', 'email marketing', 'lead nurturing']
  }
};

// Tool cross-references - mention tools in other categories
const TOOL_CROSS_REFS = {
  'klaviyo': ['email-marketing-tools-ecommerce', 'best-crm-for-agencies'],
  'activecampaign': ['email-marketing-tools-ecommerce', 'best-crm-for-agencies'],
  'hubspot': ['email-marketing-tools-ecommerce', 'best-crm-for-agencies'],
  'mailchimp': ['email-marketing-tools-ecommerce', 'best-crm-for-agencies'],
  'salesforce': ['best-crm-for-agencies', 'email-marketing-tools-ecommerce'],
  'pipedrive': ['best-crm-for-agencies', 'email-marketing-tools-ecommerce'],
  'asana': ['project-management-software-startups', 'best-crm-for-agencies'],
  'clickup': ['project-management-software-startups', 'best-crm-for-agencies'],
  'trello': ['project-management-software-startups', 'best-crm-for-agencies'],
  'notion': ['project-management-software-startups', 'ai-writing-tools-authors'],
  'quickbooks': ['accounting-software-freelancers', 'best-crm-for-agencies'],
  'freshbooks': ['accounting-software-freelancers', 'best-crm-for-agencies'],
  'xero': ['accounting-software-freelancers', 'best-crm-for-agencies'],
  'ahrefs': ['seo-tools-bloggers', 'analytics-tools-apps'],
  'semrush': ['seo-tools-bloggers', 'analytics-tools-apps'],
  'buffer': ['social-media-schedulers-influencers', 'video-editing-software-youtubers'],
  'hootsuite': ['social-media-schedulers-influencers', 'video-editing-software-youtubers']
};

// Check if file has cross-category links
function hasCrossCategoryLinks(content) {
  return content.includes('id="see-also"') || content.includes('See Also') || content.includes('Related Categories');
}

// Find where to insert cross-category section
function findInsertionPoint(content) {
  // Try to find the end of the article (before closing </article> or </main>)
  const articleEndMatch = content.match(/<\/article>/i);
  if (articleEndMatch) {
    return articleEndMatch.index;
  }
  
  const mainEndMatch = content.match(/<\/main>/i);
  if (mainEndMatch) {
    return mainEndMatch.index;
  }
  
  // Fallback: before footer
  const footerMatch = content.match(/<footer/i);
  if (footerMatch) {
    return footerMatch.index;
  }
  
  return content.length - 100;
}

// Generate cross-category links HTML
function generateCrossCategorySection(category) {
  const links = CROSS_LINKS[category];
  if (!links || !links.relatedCategories || links.relatedCategories.length === 0) {
    return '';
  }
  
  const linksHtml = links.relatedCategories.map(related => 
    `          <li><a href="/${related.slug}/">${related.name}</a> - ${related.reason}</li>`
  ).join('\n');
  
  return `
      <section id="see-also">
        <h2>See Also</h2>
        <p>Explore related tool categories:</p>
        <ul>
${linksHtml}
        </ul>
      </section>
`;
}

// Get all HTML files in a category
function getCategoryFiles(category) {
  const categoryPath = path.join(BASE_DIR, category);
  if (!fs.existsSync(categoryPath)) return [];
  
  return fs.readdirSync(categoryPath)
    .filter(f => f.endsWith('.html') && f !== 'index.html')
    .map(f => path.join(categoryPath, f));
}

// Process a single HTML file
function processFile(filepath, category) {
  console.log(`Processing: ${filepath}`);
  
  let content = fs.readFileSync(filepath, 'utf8');
  
  // Skip if already has cross-category links
  if (hasCrossCategoryLinks(content)) {
    console.log(`  Skipping - already has cross-category links`);
    return false;
  }
  
  // Generate cross-category section
  const crossSection = generateCrossCategorySection(category);
  
  if (!crossSection.trim()) {
    console.log(`  Skipping - no cross-category links defined`);
    return false;
  }
  
  // Find insertion point
  const insertPoint = findInsertionPoint(content);
  
  const before = content.substring(0, insertPoint);
  const after = content.substring(insertPoint);
  
  content = before + crossSection + after;
  
  fs.writeFileSync(filepath, content);
  console.log(`  Added cross-category links`);
  return true;
}

// Update category index with cross-category links
function updateCategoryIndex(category) {
  const indexPath = path.join(BASE_DIR, category, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.log(`  No index found for ${category}`);
    return false;
  }
  
  console.log(`Updating index: ${indexPath}`);
  
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Skip if already has cross-category section
  if (content.includes('id="related-categories"') || content.includes('Explore Related Categories')) {
    console.log(`  Index already has cross-category links`);
    return false;
  }
  
  const links = CROSS_LINKS[category];
  if (!links || !links.relatedCategories || links.relatedCategories.length === 0) {
    console.log(`  No cross-category links defined for ${category}`);
    return false;
  }
  
  // Generate cross-category section
  const sectionHtml = `
    <section id="related-categories">
      <h2>Explore Related Categories</h2>
      <div class="related-categories-grid">
${links.relatedCategories.map(related => 
  `        <div class="related-category-card">
          <h3><a href="/${related.slug}/">${related.name}</a></h3>
          <p>${related.reason}</p>
        </div>`
).join('\n')}
      </div>
    </section>
`;
  
  // Find insertion point (before footer)
  const footerMatch = content.match(/<footer/i);
  const insertPoint = footerMatch ? footerMatch.index : content.length - 100;
  
  const before = content.substring(0, insertPoint);
  const after = content.substring(insertPoint);
  
  content = before + sectionHtml + after;
  
  fs.writeFileSync(indexPath, content);
  console.log(`  Updated index with cross-category links`);
  return true;
}

// Count total articles
function countArticles() {
  let total = 0;
  const categories = fs.readdirSync(BASE_DIR).filter(f => {
    const fullPath = path.join(BASE_DIR, f);
    return fs.statSync(fullPath).isDirectory() && 
           !f.startsWith('.') && 
           !f.startsWith('{') &&
           f !== 'images' && 
           f !== 'memory' && 
           f !== 'scripts' && 
           f !== 'trading';
  });
  
  for (const category of categories) {
    const files = getCategoryFiles(category);
    total += files.length;
  }
  
  return { categories: categories.length, articles: total };
}

// Main function
function main() {
  console.log('=== Enhancing Cross-Category Links ===\n');
  
  let totalProcessed = 0;
  let totalUpdated = 0;
  let indicesUpdated = 0;
  
  // Process each category
  for (const [category, links] of Object.entries(CROSS_LINKS)) {
    console.log(`\nProcessing category: ${category}`);
    
    const files = getCategoryFiles(category);
    
    for (const file of files) {
      totalProcessed++;
      if (processFile(file, category)) {
        totalUpdated++;
      }
    }
    
    // Update category index
    if (updateCategoryIndex(category)) {
      indicesUpdated++;
    }
  }
  
  // Count articles
  const counts = countArticles();
  
  console.log(`\n=== Summary ===`);
  console.log(`Total categories: ${counts.categories}`);
  console.log(`Total articles: ${counts.articles}`);
  console.log(`Files processed: ${totalProcessed}`);
  console.log(`Files updated with cross-category links: ${totalUpdated}`);
  console.log(`Category indices updated: ${indicesUpdated}`);
}

main();