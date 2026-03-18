const fs = require('fs');
const path = require('path');

// Find all HTML files in subdirectories
function findHtmlFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'images') {
      files.push(...findHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

// Extract meta description from HTML content
function extractMetaDescription(content) {
  const match = content.match(/<meta name="description" content="([^"]+)">/i);
  return match ? match[1] : null;
}

// Replace meta description in HTML content
function replaceMetaDescription(content, newDescription) {
  return content.replace(
    /<meta name="description" content="[^"]+">/i,
    `<meta name="description" content="${newDescription}">`
  );
}

// Target: 155-160 characters
// Strategy: Create descriptive sentences that hit the target

function padToTarget(base, target = 158) {
  if (base.length >= target) return base.slice(0, 160);
  
  const suffixes = [
    ' Make informed decisions.',
    ' Choose wisely.',
    ' Start today.',
    ' Get started free.',
    ' Compare now.',
    ' See full review.',
    ' Read our analysis.',
    ' Free trial available.',
    ' Save time and money.',
    ' Expert picks included.'
  ];
  
  let result = base;
  for (const suffix of suffixes) {
    if (result.length + suffix.length <= 160 && result.length < target) {
      result = result.replace(/\.$/, '') + suffix;
    }
  }
  
  if (result.length < 155) {
    // Add more padding
    result = result.replace(/\.$/, '') + ' Find your perfect match.';
  }
  
  return result.slice(0, 160);
}

// Generate description based on file and directory
function generateDescription(filePath) {
  const parts = filePath.split('/');
  const dirName = parts[parts.length - 2];
  const fileName = parts[parts.length - 1].replace('.html', '');
  
  // Category descriptions for context
  const categoryContext = {
    'accounting-software-freelancers': 'freelance accounting and bookkeeping professionals',
    'ai-tools-realtors': 'real estate agents and property management professionals',
    'ai-writing-tools-authors': 'authors, writers, and content creators',
    'analytics-tools-apps': 'mobile app developers and product managers',
    'best-crm-for-agencies': 'marketing agencies and client management teams',
    'chatbot-platforms-saas': 'SaaS companies and software businesses',
    'email-marketing-tools-ecommerce': 'e-commerce store owners and online retailers',
    'email-verification-tools': 'email marketers and list management professionals',
    'password-managers-teams': 'team security and IT administrators',
    'project-management-software-startups': 'startup founders and project teams',
    'seo-tools-bloggers': 'bloggers and content website owners',
    'social-media-schedulers-influencers': 'influencers and social media managers',
    'video-editing-software-youtubers': 'YouTube creators and video content producers',
    'vpn-services-remote-workers': 'remote workers and distributed teams',
    'web-hosting-small-business': 'small business owners and entrepreneurs'
  };
  
  const context = categoryContext[dirName] || 'professionals and businesses';
  
  // Format tool names from filename
  function formatToolName(name) {
    return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  
  // Comparison pages
  if (fileName.includes('-vs-')) {
    const [tool1, tool2] = fileName.split('-vs-');
    const tool1Name = formatToolName(tool1);
    const tool2Name = formatToolName(tool2);
    
    const base = `${tool1Name} vs ${tool2Name}: detailed comparison of features, pricing, pros and cons for ${context}.`;
    return padToTarget(base);
  }
  
  // Best-X pages
  if (fileName.startsWith('best-')) {
    const toolName = formatToolName(fileName.replace('best-', ''));
    
    const base = `Best ${toolName} solutions for ${context}. Expert reviews, pricing breakdowns, and top recommendations.`;
    return padToTarget(base);
  }
  
  // How-to pages
  if (fileName.startsWith('how-to-use-')) {
    const match = fileName.match(/how-to-use-(.+)-for-(.+)/);
    if (match) {
      const toolName = formatToolName(match[1]);
      const useCase = match[2].replace(/-/g, ' ');
      
      const base = `How to use ${toolName} for ${useCase}: step-by-step guide for ${context} with practical tips.`;
      return padToTarget(base);
    }
  }
  
  // Special pages
  if (fileName === 'index') {
    return `Comprehensive tools and software reviews for ${context}. Expert comparisons, pricing guides, and recommendations.`;
  }
  
  if (fileName === 'pricing-guide') {
    const base = `Complete pricing guide comparing all tools for ${context}. Find the best value plans and subscription options.`;
    return padToTarget(base);
  }
  
  if (fileName === 'top-10-tools') {
    const base = `Top 10 tools ranked for ${context}. Expert-curated list with detailed reviews, features, and pricing.`;
    return padToTarget(base);
  }
  
  if (fileName === 'ultimate-guide') {
    const base = `The ultimate guide to tools for ${context}. Complete overview, features, pricing, and buying advice.`;
    return padToTarget(base);
  }
  
  if (fileName === 'affiliate-disclosure') {
    return `Affiliate disclosure: Learn about our partnerships and how we maintain editorial independence while earning revenue.`;
  }
  
  if (fileName === 'privacy') {
    return `Privacy policy: How we collect, use, and protect your personal information. Transparent data handling practices.`;
  }
  
  if (fileName === 'terms') {
    return `Terms of service: Rules and guidelines for using our website. Read our terms and conditions before use.`;
  }
  
  if (fileName === 'contact') {
    return `Contact us for questions, feedback, or partnership inquiries. We typically respond within 24-48 business hours.`;
  }
  
  // Fallback
  const base = `Expert review and analysis for ${context}. Features, pricing, pros, cons, and buying recommendations.`;
  return padToTarget(base);
}

// Main execution
const baseDir = '/home/node/.openclaw/workspace/seo-network';
const files = findHtmlFiles(baseDir);

let fixedCount = 0;
let inRangeCount = 0;
const stats = { tooShort: 0, tooLong: 0, inRange: 0 };

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const desc = extractMetaDescription(content);
  
  if (!desc) continue;
  
  const newDesc = generateDescription(file);
  const newContent = replaceMetaDescription(content, newDesc);
  
  fs.writeFileSync(file, newContent);
  fixedCount++;
  
  if (newDesc.length >= 155 && newDesc.length <= 160) {
    stats.inRange++;
  } else if (newDesc.length < 155) {
    stats.tooShort++;
  } else {
    stats.tooLong++;
  }
}

console.log(`\nTotal: ${fixedCount} files fixed`);
console.log(`In range (155-160): ${stats.inRange}`);
console.log(`Too short (<155): ${stats.tooShort}`);
console.log(`Too long (>160): ${stats.tooLong}`);