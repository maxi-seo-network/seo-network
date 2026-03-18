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

// Generate unique description based on directory and file (target 155-160 chars)
function generateUniqueDescription(filePath, originalDesc) {
  const parts = filePath.split('/');
  const dirName = parts[parts.length - 2];
  const fileName = parts[parts.length - 1].replace('.html', '');
  
  // Format directory name for display
  const dirDisplay = dirName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Parse the comparison name (e.g., "activecampaign-vs-klaviyo")
  if (fileName.includes('-vs-')) {
    const [tool1, tool2] = fileName.split('-vs-');
    const tool1Name = tool1.charAt(0).toUpperCase() + tool1.slice(1).replace(/-/g, ' ');
    const tool2Name = tool2.charAt(0).toUpperCase() + tool2.slice(1).replace(/-/g, ' ');
    
    // Target ~157 chars
    // "Tool1 vs Tool2 comparison for [context]: features, pricing & expert verdict"
    const baseDesc = `${tool1Name} vs ${tool2Name} comparison for ${dirDisplay.toLowerCase()}: features, pricing & expert verdict to help you choose.`;
    return baseDesc.slice(0, 160);
  }
  
  // Parse how-to guides
  if (fileName.startsWith('how-to-use-')) {
    const match = fileName.match(/how-to-use-(.+)-for-(.+)/);
    if (match) {
      const toolWords = match[1].split('-');
      const toolName = toolWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const useCaseWords = match[2].split('-');
      const useCase = useCaseWords.join(' ');
      
      // Target ~157 chars
      const baseDesc = `How to use ${toolName} for ${useCase} in ${dirDisplay.toLowerCase()}. Complete guide with tips, examples & best practices.`;
      return baseDesc.slice(0, 160);
    }
  }
  
  // Parse best-X articles
  if (fileName.startsWith('best-')) {
    const toolWords = fileName.replace('best-', '').split('-');
    const toolName = toolWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    const baseDesc = `Best ${toolName} options for ${dirDisplay.toLowerCase()}. Expert reviews, pricing comparisons & recommendations to find your ideal tool.`;
    return baseDesc.slice(0, 160);
  }
  
  // Fallback - add directory context
  return originalDesc.slice(0, 155);
}

// Main execution
const baseDir = '/home/node/.openclaw/workspace/seo-network';
const files = findHtmlFiles(baseDir);

let fixedCount = 0;
let outsideRange = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const desc = extractMetaDescription(content);
  
  if (!desc) continue;
  
  const newDesc = generateUniqueDescription(file, desc);
  
  // Check if current description is outside target range
  if (desc.length < 155 || desc.length > 160) {
    outsideRange++;
    const newContent = replaceMetaDescription(content, newDesc);
    fs.writeFileSync(file, newContent);
    
    const status = (newDesc.length >= 155 && newDesc.length <= 160) ? '✓' : '⚠';
    console.log(`${status} ${path.basename(file)} (${newDesc.length}c): "${newDesc}"`);
    fixedCount++;
  }
}

console.log(`\nFixed ${fixedCount} files (${outsideRange} were outside 155-160 range)`);