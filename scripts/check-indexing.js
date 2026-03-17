const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

const memoryDir = path.join(__dirname, '..', 'memory');
if (!fs.existsSync(memoryDir)) {
  fs.mkdirSync(memoryDir, { recursive: true });
}

function runCheck() {
  const timestamp = new Date().toISOString();
  const dateStr = new Date().toISOString().split('T')[0];
  
  console.log(`\n🔍 Indexing Check: ${timestamp}`);
  console.log('=' .repeat(60));
  
  const results = [];
  
  sites.forEach(site => {
    try {
      // Use curl with -L to follow redirects, -s silent, -o to output
      const cmd = `curl -sL "https://maxi-seo-network.github.io/seo-network/${site}/sitemap.xml" 2>/dev/null`;
      const output = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      const urls = (output.match(/<loc>(.*?)<\/loc>/g) || []).length;
      results.push({ site, urls, status: 200 });
      console.log(`✅ ${site}: ${urls} URLs`);
    } catch (err) {
      results.push({ site, urls: 0, status: 'ERROR' });
      console.log(`❌ ${site}: ERROR`);
    }
  });
  
  // Save to memory file
  const memoryFile = path.join(memoryDir, `${dateStr}-indexing-check.md`);
  let report = `# Indexing Check - ${dateStr}\n\n`;
  report += `**Timestamp:** ${timestamp}\n\n`;
  report += `## Sitemap Status\n\n`;
  report += `| Site | URLs | Status |\n`;
  report += `|------|------|--------|\n`;
  
  results.forEach(r => {
    const status = r.status === 200 ? '✅ Live' : '❌ Error';
    report += `| ${r.site} | ${r.urls} | ${status} |\n`;
  });
  
  const totalUrls = results.reduce((sum, r) => sum + (r.urls || 0), 0);
  const liveCount = results.filter(r => r.status === 200).length;
  const expectedUrls = 101 * 10; // 101 per site × 10 sites
  
  report += `\n## Summary\n\n`;
  report += `- **Total URLs:** ${totalUrls} / ${expectedUrls} expected\n`;
  report += `- **Live Sitemaps:** ${liveCount} / 10\n`;
  report += `- **Coverage:** ${((liveCount / 10) * 100).toFixed(0)}%\n`;
  report += `- **Status:** ${liveCount === 10 ? '✅ All systems ready' : '⚠️ Pending deployment'}\n\n`;
  
  fs.writeFileSync(memoryFile, report);
  console.log(`\n📄 Saved to: ${memoryFile}`);
  
  // Update tracking file
  const trackingFile = path.join(memoryDir, 'indexing-tracking.json');
  let tracking = { checks: [] };
  if (fs.existsSync(trackingFile)) {
    tracking = JSON.parse(fs.readFileSync(trackingFile, 'utf8'));
  }
  
  tracking.checks.push({
    timestamp,
    date: dateStr,
    results,
    totalUrls,
    liveCount,
    expectedUrls
  });
  
  // Keep only last 30 checks
  if (tracking.checks.length > 30) {
    tracking.checks = tracking.checks.slice(-30);
  }
  
  fs.writeFileSync(trackingFile, JSON.stringify(tracking, null, 2));
  console.log(`📊 Tracking updated: ${trackingFile}`);
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Check complete. ${liveCount}/10 sitemaps accessible.`);
  console.log(`📈 Progress: ${totalUrls}/${expectedUrls} URLs (${((totalUrls/expectedUrls)*100).toFixed(1)}%)`);
  
  return { results, totalUrls, liveCount, expectedUrls };
}

runCheck();
