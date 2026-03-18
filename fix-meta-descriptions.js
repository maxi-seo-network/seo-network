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

// Generate unique description based on directory and file
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
    const tool1Name = tool1.charAt(0).toUpperCase() + tool1.slice(1);
    const tool2Name = tool2.charAt(0).toUpperCase() + tool2.slice(1);
    
    // Generate unique description based on directory context
    if (originalDesc.includes('Head-to-head comparison')) {
      return `${tool1Name} vs ${tool2Name} for ${dirDisplay.toLowerCase()}. Detailed feature comparison, pricing analysis, and expert verdict. Find which tool fits your needs.`;
    }
  }
  
  // Parse how-to guides (e.g., "how-to-use-activecampaign-for-scaling")
  if (fileName.startsWith('how-to-use-')) {
    const match = fileName.match(/how-to-use-(.+)-for-(.+)/);
    if (match) {
      const toolName = match[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const useCase = match[2].split('-').join(' ');
      return `Learn how to use ${toolName} for ${useCase} in ${dirDisplay.toLowerCase()}. Step-by-step guide with examples.`;
    }
  }
  
  // Parse best-X articles
  if (fileName.startsWith('best-')) {
    const toolName = fileName.replace('best-', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return `Discover the best ${toolName} options for ${dirDisplay.toLowerCase()}. Expert reviews, pricing, and recommendations.`;
  }
  
  // Fallback - add directory context
  return `${originalDesc.slice(0, 120)} | ${dirDisplay} guide.`;
}

// Main execution
const baseDir = '/home/node/.openclaw/workspace/seo-network';
const files = findHtmlFiles(baseDir);

// Group files by meta description
const descMap = new Map();
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const desc = extractMetaDescription(content);
  if (desc) {
    if (!descMap.has(desc)) {
      descMap.set(desc, []);
    }
    descMap.get(desc).push(file);
  }
}

// Find duplicates
const duplicates = [];
for (const [desc, files] of descMap) {
  if (files.length > 1) {
    duplicates.push({ description: desc, files });
  }
}

console.log(`Found ${duplicates.length} duplicate descriptions\n`);

// Fix duplicates
let fixedCount = 0;
for (const { description, files } of duplicates) {
  console.log(`\nDescription: "${description.slice(0, 60)}..."`);
  console.log(`Files: ${files.length}`);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const newDesc = generateUniqueDescription(file, description);
    const newContent = replaceMetaDescription(content, newDesc);
    
    if (newDesc.length < 155 || newDesc.length > 160) {
      console.log(`  WARNING: ${path.basename(file)} - ${newDesc.length} chars`);
    }
    
    fs.writeFileSync(file, newContent);
    console.log(`  Fixed: ${path.basename(file)}`);
    console.log(`    New: "${newDesc}"`);
    fixedCount++;
  }
}

console.log(`\n\nTotal files fixed: ${fixedCount}`);