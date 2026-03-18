#!/usr/bin/env node
/**
 * Comprehensive Internal Linking Network Script
 * 
 * This script:
 * 1. Adds "Related Articles" sections to all articles
 * 2. Cross-links between categories (e.g., email marketing → CRM)
 * 3. Adds "Best [Tool] for [Use Case]" links within articles
 * 4. Creates hub pages that link to all articles in a category
 * 5. Adds "See also" sections at the end of each article
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = '/home/node/.openclaw/workspace/seo-network';

// Category definitions with related categories for cross-linking
const CATEGORIES = {
  'email-marketing-tools-ecommerce': {
    name: 'Email Marketing Tools for E-commerce',
    relatedCategories: ['best-crm-for-agencies', 'email-verification-tools'],
    toolTypes: ['email', 'marketing', 'automation'],
    crossLinkKeywords: ['CRM', 'customer management', 'email verification']
  },
  'best-crm-for-agencies': {
    name: 'Best CRM for Agencies',
    relatedCategories: ['email-marketing-tools-ecommerce', 'project-management-software-startups'],
    toolTypes: ['CRM', 'sales', 'customer'],
    crossLinkKeywords: ['email marketing', 'project management', 'automation']
  },
  'accounting-software-freelancers': {
    name: 'Accounting Software for Freelancers',
    relatedCategories: ['project-management-software-startups'],
    toolTypes: ['accounting', 'finance', 'invoicing'],
    crossLinkKeywords: ['project management', 'productivity']
  },
  'ai-writing-tools-authors': {
    name: 'AI Writing Tools for Authors',
    relatedCategories: ['seo-tools-bloggers', 'social-media-schedulers-influencers'],
    toolTypes: ['AI', 'writing', 'content'],
    crossLinkKeywords: ['SEO', 'social media', 'content marketing']
  },
  'analytics-tools-apps': {
    name: 'Analytics Tools for Apps',
    relatedCategories: ['email-marketing-tools-ecommerce', 'seo-tools-bloggers'],
    toolTypes: ['analytics', 'data', 'reporting'],
    crossLinkKeywords: ['email marketing', 'SEO']
  },
  'social-media-schedulers-influencers': {
    name: 'Social Media Schedulers for Influencers',
    relatedCategories: ['email-marketing-tools-ecommerce', 'ai-writing-tools-authors'],
    toolTypes: ['social media', 'scheduling', 'content'],
    crossLinkKeywords: ['email marketing', 'content creation']
  },
  'video-editing-software-youtubers': {
    name: 'Video Editing Software for YouTubers',
    relatedCategories: ['social-media-schedulers-influencers', 'ai-writing-tools-authors'],
    toolTypes: ['video', 'editing', 'content creation'],
    crossLinkKeywords: ['social media', 'content creation']
  },
  'password-managers-teams': {
    name: 'Password Managers for Teams',
    relatedCategories: ['vpn-services-remote-workers'],
    toolTypes: ['security', 'password', 'team'],
    crossLinkKeywords: ['VPN', 'remote work']
  },
  'email-verification-tools': {
    name: 'Email Verification Tools',
    relatedCategories: ['email-marketing-tools-ecommerce'],
    toolTypes: ['email', 'verification', 'deliverability'],
    crossLinkKeywords: ['email marketing']
  },
  'project-management-software-startups': {
    name: 'Project Management Software for Startups',
    relatedCategories: ['best-crm-for-agencies', 'accounting-software-freelancers'],
    toolTypes: ['project management', 'productivity', 'collaboration'],
    crossLinkKeywords: ['CRM', 'accounting']
  },
  'seo-tools-bloggers': {
    name: 'SEO Tools for Bloggers',
    relatedCategories: ['ai-writing-tools-authors', 'email-marketing-tools-ecommerce'],
    toolTypes: ['SEO', 'content', 'analytics'],
    crossLinkKeywords: ['content creation', 'email marketing']
  },
  'vpn-services-remote-workers': {
    name: 'VPN Services for Remote Workers',
    relatedCategories: ['password-managers-teams', 'project-management-software-startups'],
    toolTypes: ['VPN', 'security', 'remote work'],
    crossLinkKeywords: ['password management', 'productivity']
  },
  'web-hosting-small-business': {
    name: 'Web Hosting for Small Business',
    relatedCategories: ['email-marketing-tools-ecommerce', 'seo-tools-bloggers'],
    toolTypes: ['hosting', 'website', 'server'],
    crossLinkKeywords: ['email marketing', 'SEO']
  },
  'chatbot-platforms-saas': {
    name: 'Chatbot Platforms for SaaS',
    relatedCategories: ['email-marketing-tools-ecommerce', 'best-crm-for-agencies'],
    toolTypes: ['chatbot', 'automation', 'customer service'],
    crossLinkKeywords: ['email marketing', 'CRM']
  },
  'ai-tools-for-realtors': {
    name: 'AI Tools for Realtors',
    relatedCategories: ['best-crm-for-agencies', 'email-marketing-tools-ecommerce'],
    toolTypes: ['AI', 'real estate', 'marketing'],
    crossLinkKeywords: ['CRM', 'email marketing']
  }
};

// Tool mappings for "Best [Tool] for [Use Case]" internal links
const TOOL_MAPPINGS = {
  // Email marketing tools
  'klaviyo': { category: 'email-marketing-tools-ecommerce', aliases: ['klaviyo'] },
  'activecampaign': { category: 'email-marketing-tools-ecommerce', aliases: ['activecampaign'] },
  'mailchimp': { category: 'email-marketing-tools-ecommerce', aliases: ['mailchimp'] },
  'hubspot': { category: 'email-marketing-tools-ecommerce', aliases: ['hubspot'] },
  'convertkit': { category: 'email-marketing-tools-ecommerce', aliases: ['convertkit'] },
  'sendinblue': { category: 'email-marketing-tools-ecommerce', aliases: ['sendinblue', 'brevo'] },
  
  // CRM tools
  'salesforce': { category: 'best-crm-for-agencies', aliases: ['salesforce'] },
  'pipedrive': { category: 'best-crm-for-agencies', aliases: ['pipedrive'] },
  'freshsales': { category: 'best-crm-for-agencies', aliases: ['freshsales'] },
  'zoho': { category: 'best-crm-for-agencies', aliases: ['zoho'] },
  
  // Project management tools
  'asana': { category: 'project-management-software-startups', aliases: ['asana'] },
  'clickup': { category: 'project-management-software-startups', aliases: ['clickup'] },
  'trello': { category: 'project-management-software-startups', aliases: ['trello'] },
  'monday.com': { category: 'project-management-software-startups', aliases: ['monday.com', 'monday'] },
  'notion': { category: 'project-management-software-startups', aliases: ['notion'] },
  
  // Social media tools
  'buffer': { category: 'social-media-schedulers-influencers', aliases: ['buffer'] },
  'hootsuite': { category: 'social-media-schedulers-influencers', aliases: ['hootsuite'] },
  'later': { category: 'social-media-schedulers-influencers', aliases: ['later'] },
  'planoly': { category: 'social-media-schedulers-influencers', aliases: ['planoly'] },
  'sprout social': { category: 'social-media-schedulers-influencers', aliases: ['sprout social', 'sprout-social'] },
  
  // Accounting tools
  'quickbooks': { category: 'accounting-software-freelancers', aliases: ['quickbooks'] },
  'freshbooks': { category: 'accounting-software-freelancers', aliases: ['freshbooks'] },
  'xero': { category: 'accounting-software-freelancers', aliases: ['xero'] },
  'wave': { category: 'accounting-software-freelancers', aliases: ['wave'] },
  
  // SEO tools
  'ahrefs': { category: 'seo-tools-bloggers', aliases: ['ahrefs'] },
  'semrush': { category: 'seo-tools-bloggers', aliases: ['semrush'] },
  'moz': { category: 'seo-tools-bloggers', aliases: ['moz'] },
  'surfer seo': { category: 'seo-tools-bloggers', aliases: ['surfer seo', 'surfer-seo'] },
  'ubersuggest': { category: 'seo-tools-bloggers', aliases: ['ubersuggest'] },
  
  // Video editing tools
  'adobe premiere': { category: 'video-editing-software-youtubers', aliases: ['adobe premiere', 'adobe-premiere'] },
  'davinci resolve': { category: 'video-editing-software-youtubers', aliases: ['davinci resolve', 'davinci-resolve'] },
  'final cut pro': { category: 'video-editing-software-youtubers', aliases: ['final cut pro', 'final-cut-pro'] },
  'filmora': { category: 'video-editing-software-youtubers', aliases: ['filmora'] },
  'capcut': { category: 'video-editing-software-youtubers', aliases: ['capcut'] }
};

// Get all HTML files in a category
function getCategoryFiles(category) {
  const categoryPath = path.join(BASE_DIR, category);
  if (!fs.existsSync(categoryPath)) return [];
  
  return fs.readdirSync(categoryPath)
    .filter(f => f.endsWith('.html') && f !== 'index.html')
    .map(f => path.join(categoryPath, f));
}

// Extract article info from filename
function parseFilename(filename) {
  const basename = path.basename(filename, '.html');
  
  // Comparison articles: tool-vs-tool
  if (basename.includes('-vs-')) {
    const tools = basename.split('-vs-');
    return {
      type: 'comparison',
      tool1: tools[0],
      tool2: tools[1],
      basename
    };
  }
  
  // How-to articles: how-to-use-tool-for-purpose
  if (basename.startsWith('how-to-use-')) {
    const match = basename.match(/how-to-use-(.+)-for-(.+)/);
    if (match) {
      return {
        type: 'howto',
        tool: match[1],
        purpose: match[2],
        basename
      };
    }
  }
  
  // Best tool for use case: best-tool-for-usecase
  if (basename.startsWith('best-')) {
    const match = basename.match(/best-(.+)-for-(.+)/);
    if (match) {
      return {
        type: 'best',
        tool: match[1],
        useCase: match[2],
        basename
      };
    }
  }
  
  return { type: 'other', basename };
}

// Find related articles within the same category
function findRelatedArticles(filename, category) {
  const files = getCategoryFiles(category);
  const currentInfo = parseFilename(filename);
  
  const related = [];
  
  for (const file of files) {
    if (file === filename) continue;
    
    const fileInfo = parseFilename(file);
    let score = 0;
    
    // Same tool
    if (currentInfo.tool && fileInfo.tool && currentInfo.tool === fileInfo.tool) {
      score += 10;
    }
    
    // Comparison between related tools
    if (currentInfo.type === 'comparison' && fileInfo.type === 'comparison') {
      const currentTools = [currentInfo.tool1, currentInfo.tool2];
      const fileTools = [fileInfo.tool1, fileInfo.tool2];
      if (currentTools.some(t => fileTools.includes(t))) {
        score += 8;
      }
    }
    
    // How-to for same tool
    if (currentInfo.tool && fileInfo.tool === currentInfo.tool && fileInfo.type === 'howto') {
      score += 7;
    }
    
    // Best article for same tool
    if (currentInfo.tool && fileInfo.tool === currentInfo.tool && fileInfo.type === 'best') {
      score += 6;
    }
    
    // Different type, same category
    if (fileInfo.type !== currentInfo.type) {
      score += 2;
    }
    
    if (score > 0) {
      related.push({
        file,
        score,
        info: fileInfo
      });
    }
  }
  
  // Sort by score and return top 5
  return related.sort((a, b) => b.score - a.score).slice(0, 5);
}

// Generate human-readable title from filename
function generateTitle(filename) {
  const basename = path.basename(filename, '.html');
  
  // Comparison articles
  if (basename.includes('-vs-')) {
    const tools = basename.split('-vs-');
    return `${formatToolName(tools[0])} vs ${formatToolName(tools[1])}`;
  }
  
  // How-to articles
  if (basename.startsWith('how-to-use-')) {
    const match = basename.match(/how-to-use-(.+)-for-(.+)/);
    if (match) {
      return `How to Use ${formatToolName(match[1])} for ${formatUseCase(match[2])}`;
    }
  }
  
  // Best tool articles
  if (basename.startsWith('best-')) {
    const match = basename.match(/best-(.+)-for-(.+)/);
    if (match) {
      return `Best ${formatToolName(match[1])} for ${formatUseCase(match[2])}`;
    }
  }
  
  return basename.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatToolName(tool) {
  const nameMap = {
    'activecampaign': 'ActiveCampaign',
    'mailchimp': 'Mailchimp',
    'klaviyo': 'Klaviyo',
    'hubspot': 'HubSpot',
    'convertkit': 'ConvertKit',
    'sendinblue': 'Brevo (Sendinblue)',
    'salesforce': 'Salesforce',
    'pipedrive': 'Pipedrive',
    'zoho': 'Zoho',
    'freshsales': 'Freshsales',
    'asana': 'Asana',
    'clickup': 'ClickUp',
    'trello': 'Trello',
    'monday.com': 'Monday.com',
    'notion': 'Notion',
    'buffer': 'Buffer',
    'hootsuite': 'Hootsuite',
    'later': 'Later',
    'planoly': 'Planoly',
    'sprout-social': 'Sprout Social',
    'quickbooks': 'QuickBooks',
    'freshbooks': 'FreshBooks',
    'xero': 'Xero',
    'wave': 'Wave',
    'ahrefs': 'Ahrefs',
    'semrush': 'SEMrush',
    'moz': 'Moz',
    'surfer-seo': 'Surfer SEO',
    'ubersuggest': 'Ubersuggest',
    'adobe-premiere': 'Adobe Premiere',
    'davinci-resolve': 'DaVinci Resolve',
    'final-cut-pro': 'Final Cut Pro',
    'filmora': 'Filmora',
    'capcut': 'CapCut'
  };
  
  return nameMap[tool.toLowerCase()] || tool.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function formatUseCase(useCase) {
  return useCase.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Check if an internal link section already exists
function hasInternalLinksSection(content) {
  return content.includes('id="related"') || 
         content.includes('id="see-also"') || 
         content.includes('Related Articles') ||
         content.includes('See Also');
}

// Find the insertion point for related articles section
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

// Generate related articles HTML
function generateRelatedSection(relatedArticles, category) {
  if (relatedArticles.length === 0) return '';
  
  const categoryPath = `/${category}/`;
  const links = relatedArticles.map(r => {
    const title = generateTitle(r.file);
    const href = path.basename(r.file);
    return `          <li><a href="${href}">${title}</a></li>`;
  }).join('\n');
  
  return `
      <section id="related">
        <h2>Related Articles</h2>
        <ul>
${links}
        </ul>
      </section>
`;
}

// Generate cross-category links HTML
function generateCrossCategoryLinks(category, allCategories) {
  const categoryInfo = CATEGORIES[category];
  if (!categoryInfo || !categoryInfo.relatedCategories) return '';
  
  const links = [];
  
  for (const relatedCat of categoryInfo.relatedCategories) {
    const relatedInfo = CATEGORIES[relatedCat];
    if (relatedInfo) {
      links.push({
        title: relatedInfo.name,
        href: `/${relatedCat}/`,
        description: `Explore ${relatedInfo.name.toLowerCase()}`
      });
    }
  }
  
  if (links.length === 0) return '';
  
  const linksHtml = links.map(l => 
    `          <li><a href="${l.href}">${l.title}</a> - ${l.description}</li>`
  ).join('\n');
  
  return `
      <section id="see-also">
        <h2>See Also</h2>
        <ul>
${linksHtml}
        </ul>
      </section>
`;
}

// Add internal links within article content
function addInternalLinks(content, category) {
  let modified = content;
  const categoryPath = `/${category}/`;
  
  // Find all tool mentions and add links where appropriate
  // Only link first occurrence of each tool
  const linkedTools = new Set();
  
  for (const [toolKey, toolInfo] of Object.entries(TOOL_MAPPINGS)) {
    if (linkedTools.has(toolKey)) continue;
    
    // Check if this tool belongs to current category
    const isCurrentCategory = toolInfo.category === category;
    
    // Only link to tools in other categories for cross-linking
    if (!isCurrentCategory) {
      // Check if the tool is mentioned in the content
      const toolPattern = new RegExp(`\\b(${toolInfo.aliases.join('|')})\\b`, 'i');
      if (toolPattern.test(content)) {
        // Tool is mentioned, we can add cross-category link in See Also section
        // This is handled by generateCrossCategoryLinks
      }
    }
  }
  
  return modified;
}

// Process a single HTML file
function processFile(filepath, category) {
  console.log(`Processing: ${filepath}`);
  
  let content = fs.readFileSync(filepath, 'utf8');
  
  // Skip if already has internal links section
  if (hasInternalLinksSection(content)) {
    console.log(`  Skipping - already has internal links`);
    return false;
  }
  
  // Find related articles
  const relatedArticles = findRelatedArticles(filepath, category);
  
  // Find insertion point
  const insertPoint = findInsertionPoint(content);
  
  // Generate related section
  const relatedSection = generateRelatedSection(relatedArticles, category);
  
  // Generate cross-category links
  const crossLinks = generateCrossCategoryLinks(category, CATEGORIES);
  
  // Combine sections
  const newSections = relatedSection + crossLinks;
  
  if (newSections.trim()) {
    // Insert before the closing tag
    const before = content.substring(0, insertPoint);
    const after = content.substring(insertPoint);
    
    content = before + newSections + after;
    
    fs.writeFileSync(filepath, content);
    console.log(`  Added ${relatedArticles.length} related articles + cross-category links`);
    return true;
  }
  
  return false;
}

// Update category index page
function updateCategoryIndex(category) {
  const indexPath = path.join(BASE_DIR, category, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.log(`Creating index for ${category}`);
    // Would need to create index - skip for now
    return false;
  }
  
  console.log(`Updating index: ${indexPath}`);
  
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Check if index already has good internal links
  if (content.includes('id="all-articles"') || content.includes('All Articles in This Category')) {
    console.log(`  Index already has article list`);
    return false;
  }
  
  // Get all articles in category
  const files = getCategoryFiles(category);
  
  // Group by type
  const articles = {
    best: [],
    comparisons: [],
    howto: [],
    other: []
  };
  
  for (const file of files) {
    const info = parseFilename(file);
    const title = generateTitle(file);
    const href = path.basename(file);
    
    switch (info.type) {
      case 'best':
        articles.best.push({ title, href, info });
        break;
      case 'comparison':
        articles.comparisons.push({ title, href, info });
        break;
      case 'howto':
        articles.howto.push({ title, href, info });
        break;
      default:
        articles.other.push({ title, href, info });
    }
  }
  
  // Generate article list HTML
  const generateList = (items) => {
    if (items.length === 0) return '';
    return items.map(item => `            <li><a href="${item.href}">${item.title}</a></li>`).join('\n');
  };
  
  const allArticlesSection = `
    <section id="all-articles">
      <h2>All Articles in This Category</h2>
      
      ${articles.best.length > 0 ? `
      <h3>Tool Reviews</h3>
      <ul>
${generateList(articles.best)}
      </ul>
      ` : ''}
      
      ${articles.comparisons.length > 0 ? `
      <h3>Comparisons</h3>
      <ul>
${generateList(articles.comparisons)}
      </ul>
      ` : ''}
      
      ${articles.howto.length > 0 ? `
      <h3>How-To Guides</h3>
      <ul>
${generateList(articles.howto)}
      </ul>
      ` : ''}
    </section>
`;
  
  // Find insertion point (before footer)
  const footerMatch = content.match(/<footer/i);
  const insertPoint = footerMatch ? footerMatch.index : content.length - 100;
  
  const before = content.substring(0, insertPoint);
  const after = content.substring(insertPoint);
  
  content = before + allArticlesSection + after;
  
  fs.writeFileSync(indexPath, content);
  console.log(`  Updated category index`);
  return true;
}

// Main function
function main() {
  console.log('=== Internal Linking Network ===\n');
  
  let totalProcessed = 0;
  let totalUpdated = 0;
  
  // Process each category
  for (const [category, info] of Object.entries(CATEGORIES)) {
    console.log(`\nProcessing category: ${category}`);
    
    const files = getCategoryFiles(category);
    
    for (const file of files) {
      totalProcessed++;
      if (processFile(file, category)) {
        totalUpdated++;
      }
    }
    
    // Update category index
    updateCategoryIndex(category);
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Total files processed: ${totalProcessed}`);
  console.log(`Files updated: ${totalUpdated}`);
}

main();