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

const amazonDisclosure = `    <p style="margin-top: 1rem; font-size: 0.85rem; color: #666;">
      <strong>Amazon Disclosure:</strong> As an Amazon Associate, we earn from qualifying purchases.
    </p>
`;

sites.forEach(siteDir => {
  const indexPath = path.join(__dirname, '..', siteDir, 'index.html');
  if (!fs.existsSync(indexPath)) return;
  
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Add disclosure to footer
  content = content.replace(
    /<\/footer>/,
    amazonDisclosure + '  </footer>\n'
  );
  
  fs.writeFileSync(indexPath, content);
  console.log(`✅ ${siteDir}/index.html: Amazon disclosure added`);
});

// Also add to root index.html
const rootIndexPath = path.join(__dirname, '..', 'index.html');
if (fs.existsSync(rootIndexPath)) {
  let content = fs.readFileSync(rootIndexPath, 'utf8');
  content = content.replace(
    /<\/footer>/,
    amazonDisclosure + '  </footer>\n'
  );
  fs.writeFileSync(rootIndexPath, content);
  console.log(`✅ Root index.html: Amazon disclosure added`);
}

console.log('\n✅ Amazon disclosure added to all 11 index pages');
