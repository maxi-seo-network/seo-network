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

// Generate description with target 155-160 characters
function generateDescription(filePath, originalDesc) {
  const parts = filePath.split('/');
  const dirName = parts[parts.length - 2];
  const fileName = parts[parts.length - 1].replace('.html', '');
  
  // Get readable category name
  const categoryMap = {
    'accounting-software-freelancers': 'freelance accounting',
    'ai-tools-realtors': 'real estate agents',
    'ai-writing-tools-authors': 'authors',
    'analytics-tools-apps': 'mobile app analytics',
    'best-crm-for-agencies': 'marketing agencies',
    'chatbot-platforms-saas': 'SaaS companies',
    'email-marketing-tools-ecommerce': 'e-commerce stores',
    'email-verification-tools': 'email marketers',
    'password-managers-teams': 'team security',
    'project-management-software-startups': 'startup project management',
    'seo-tools-bloggers': 'bloggers',
    'social-media-schedulers-influencers': 'influencers',
    'video-editing-software-youtubers': 'YouTube creators',
    'vpn-services-remote-workers': 'remote workers',
    'web-hosting-small-business': 'small business websites'
  };
  
  const category = categoryMap[dirName] || dirName.replace(/-/g, ' ');
  
  // Comparison pages
  if (fileName.includes('-vs-')) {
    const [tool1, tool2] = fileName.split('-vs-');
    const tool1Name = tool1.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const tool2Name = tool2.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    const base = `${tool1Name} vs ${tool2Name} comparison for ${category}: features, pricing & expert verdict.`;
    if (base.length >= 155 && base.length <= 160) return base;
    
    // Adjust to hit target
    if (base.length < 155) {
      return `${tool1Name} vs ${tool2Name} comprehensive comparison for ${category}. Features, pricing & expert verdict to choose your tool.`;
    }
    return base.slice(0, 160);
  }
  
  // Best-X pages
  if (fileName.startsWith('best-')) {
    const toolWords = fileName.replace('best-', '').split('-');
    const toolName = toolWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    const base = `Best ${toolName} for ${category}. Expert reviews, pricing & comparisons to help you choose.`;
    if (base.length >= 155 && base.length <= 160) return base;
    
    if (base.length < 155) {
      return `Best ${toolName} options for ${category}. Expert reviews, pricing comparisons & recommendations to find your ideal tool.`;
    }
    return base.slice(0, 160);
  }
  
  // How-to pages
  if (fileName.startsWith('how-to-use-')) {
    const match = fileName.match(/how-to-use-(.+)-for-(.+)/);
    if (match) {
      const toolWords = match[1].split('-');
      const toolName = toolWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const useCase = match[2].split('-').join(' ');
      
      const base = `How to use ${toolName} for ${useCase} in ${category}. Complete guide with tips & examples.`;
      if (base.length >= 155 && base.length <= 160) return base;
      
      if (base.length < 155) {
        return `How to use ${toolName} for ${useCase} in ${category}. Complete guide with tips, examples & best practices.`;
      }
      return base.slice(0, 160);
    }
  }
  
  // Special pages
  if (fileName === 'index') {
    // Keep existing index descriptions - they're usually good
    return originalDesc.slice(0, 160);
  }
  
  if (fileName === 'pricing-guide') {
    return `Compare pricing across all ${category} tools. Understand costs, find the best value, and choose the right plan.`;
  }
  
  if (fileName === 'top-10-tools') {
    return `Expert rankings of the top 10 ${category} tools. Compare features, pricing, and find the best solution.`;
  }
  
  if (fileName === 'ultimate-guide') {
    return `The complete guide to ${category} tools. Features, pricing, implementation tips, and best practices.`;
  }
  
  // Fallback - pad or truncate
  if (originalDesc.length < 155) {
    return originalDesc + ' Expert advice to help you decide.'.slice(0, 160 - originalDesc.length);
  }
  return originalDesc.slice(0, 160);
}

// Main execution
const baseDir = '/home/node/.openclaw/workspace/seo-network';
const files = findHtmlFiles(baseDir);

let fixedCount = 0;
let inRangeCount = 0;
let outRangeCount = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const desc = extractMetaDescription(content);
  
  if (!desc) continue;
  
  const newDesc = generateDescription(file, desc);
  const newContent = replaceMetaDescription(content, newDesc);
  
  fs.writeFileSync(file, newContent);
  fixedCount++;
  
  if (newDesc.length >= 155 && newDesc.length <= 160) {
    inRangeCount++;
  } else {
    outRangeCount++;
    console.log(`${newDesc.length}c: ${path.basename(file)}: "${newDesc}"`);
  }
}

console.log(`\n\nTotal: ${fixedCount} files fixed`);
console.log(`In range (155-160): ${inRangeCount}`);
console.log(`Outside range: ${outRangeCount}`);