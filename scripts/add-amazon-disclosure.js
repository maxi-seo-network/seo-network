const fs = require('fs');
const path = require('path');

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

const amazonDisclosure = `  <div style="margin: 2rem 0; padding: 1rem; background: #f8f9fa; border-left: 3px solid #667eea; font-size: 0.9rem; color: #555;">
    <strong>Amazon Disclosure:</strong> As an Amazon Associate, we earn from qualifying purchases.
  </div>
`;

let totalCount = 0;

sites.forEach(siteDir => {
  const sitePath = path.join(__dirname, '..', siteDir);
  if (!fs.existsSync(sitePath)) return;
  
  const htmlFiles = fs.readdirSync(sitePath).filter(f => f.endsWith('.html'));
  
  htmlFiles.forEach(filename => {
    const filePath = path.join(sitePath, filename);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has disclosure
    if (content.includes('Amazon Associate')) {
      console.log(`⊘ ${siteDir}/${filename}: already has disclosure`);
      return;
    }
    
    // Add disclosure before footer
    content = content.replace(
      /<\/footer>/,
      amazonDisclosure + '  </footer>\n'
    );
    
    fs.writeFileSync(filePath, content);
    totalCount++;
  });
  
  console.log(`${siteDir}: ${htmlFiles.length} pages processed`);
});

// Also update root index.html
const rootIndexPath = path.join(__dirname, '..', 'index.html');
if (fs.existsSync(rootIndexPath)) {
  let content = fs.readFileSync(rootIndexPath, 'utf8');
  if (!content.includes('Amazon Associate')) {
    content = content.replace(/<\/footer>/, amazonDisclosure + '  </footer>\n');
    fs.writeFileSync(rootIndexPath, content);
    console.log(`✅ Root index.html: Amazon disclosure added`);
  }
}

console.log(`\n✅ Total pages updated: ${totalCount}`);
