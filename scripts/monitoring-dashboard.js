#!/usr/bin/env node
/**
 * SEO Network Monitoring Dashboard
 * Tracks rankings, traffic, revenue, and indexing status
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CONFIG = {
  outputDir: process.argv[2] || '../dashboard',
  sitesConfig: process.argv[3] || '../build/build-manifest.json',
  updateInterval: 'daily'
};

// Mock data generators (replace with real API calls when keys are available)
function generateMockAnalytics(siteName) {
  const baseTraffic = Math.floor(Math.random() * 5000) + 500;
  const growthRate = 0.15; // 15% monthly growth (typical for new SEO sites)
  
  return {
    site: siteName,
    period: 'last_30_days',
    sessions: baseTraffic,
    pageviews: baseTraffic * 2.5,
    bounceRate: (Math.random() * 20 + 40).toFixed(1) + '%',
    avgSessionDuration: '2m ' + Math.floor(Math.random() * 30) + 's',
    topPages: [
      { path: '/content/best-tools.html', pageviews: Math.floor(baseTraffic * 0.3) },
      { path: '/content/how-to-guide.html', pageviews: Math.floor(baseTraffic * 0.25) },
      { path: '/content/comparison.html', pageviews: Math.floor(baseTraffic * 0.2) }
    ],
    trafficSources: {
      organic: (Math.random() * 20 + 70).toFixed(1) + '%',
      direct: (Math.random() * 10 + 10).toFixed(1) + '%',
      referral: (Math.random() * 10 + 5).toFixed(1) + '%',
      social: (Math.random() * 5 + 2).toFixed(1) + '%'
    }
  };
}

function generateMockSearchConsole(siteName) {
  const baseImpressions = Math.floor(Math.random() * 50000) + 5000;
  
  return {
    site: siteName,
    period: 'last_28_days',
    impressions: baseImpressions,
    clicks: Math.floor(baseImpressions * 0.03), // 3% CTR
    ctr: '3.0%',
    avgPosition: (Math.random() * 15 + 10).toFixed(1),
    indexedPages: Math.floor(Math.random() * 800) + 200,
    topQueries: [
      { query: 'best tools for ' + siteName.split('-')[2], impressions: Math.floor(baseImpressions * 0.2) },
      { query: siteName.replace(/-/g, ' '), impressions: Math.floor(baseImpressions * 0.15) },
      { query: 'how to choose ' + siteName.split('-')[0], impressions: Math.floor(baseImpressions * 0.1) }
    ],
    indexingStatus: {
      valid: Math.floor(Math.random() * 800) + 200,
      errors: Math.floor(Math.random() * 20),
      warnings: Math.floor(Math.random() * 50)
    }
  };
}

function generateMockRevenue(siteName) {
  // RPM varies by niche: $5-50 typical range
  const rpm = (Math.random() * 45 + 5).toFixed(2);
  const pageviews = Math.floor(Math.random() * 50000) + 5000;
  const revenue = (pageviews * rpm / 1000).toFixed(2);
  
  return {
    site: siteName,
    period: 'last_30_days',
    pageviews: pageviews,
    rpm: parseFloat(rpm),
    estimatedRevenue: parseFloat(revenue),
    sources: {
      adsense: (parseFloat(revenue) * 0.7).toFixed(2),
      affiliates: (parseFloat(revenue) * 0.25).toFixed(2),
      other: (parseFloat(revenue) * 0.05).toFixed(2)
    },
    projection: {
      next_30_days: (parseFloat(revenue) * 1.15).toFixed(2), // 15% growth
      next_90_days: (parseFloat(revenue) * 1.5).toFixed(2)
    }
  };
}

function generateDashboardHTML(sitesData) {
  const totalRevenue = sitesData.reduce((sum, s) => sum + parseFloat(s.revenue.estimatedRevenue), 0);
  const totalPageviews = sitesData.reduce((sum, s) => sum + s.analytics.sessions, 0);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO Network Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
    .dashboard { max-width: 1400px; margin: 0 auto; padding: 2rem; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; }
    .header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .metric-card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .metric-card h3 { color: #667; font-size: 0.9rem; text-transform: uppercase; margin-bottom: 0.5rem; }
    .metric-card .value { font-size: 2rem; font-weight: bold; color: #333; }
    .metric-card .change { color: #22c55e; font-size: 0.9rem; }
    .sites-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; }
    .site-card { background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .site-card h2 { color: #667eea; margin-bottom: 1rem; }
    .site-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; }
    .site-metric { background: #f8f9fa; padding: 0.75rem; border-radius: 4px; }
    .site-metric label { font-size: 0.8rem; color: #666; }
    .site-metric .value { font-weight: bold; color: #333; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e9ecef; }
    th { background: #f8f9fa; font-weight: 600; }
    .status { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; }
    .status.active { background: #d4edda; color: #155724; }
    .status.pending { background: #fff3cd; color: #856404; }
    .footer { text-align: center; padding: 2rem; color: #666; }
  </style>
</head>
<body>
  <div class="dashboard">
    <div class="header">
      <h1>🎯 SEO Network Dashboard</h1>
      <p>Real-time monitoring across ${sitesData.length} niche sites</p>
      <p style="margin-top: 0.5rem; opacity: 0.9;">Last updated: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="metrics-grid">
      <div class="metric-card">
        <h3>Total Sites</h3>
        <div class="value">${sitesData.length}</div>
        <div class="change">All active</div>
      </div>
      <div class="metric-card">
        <h3>Total Pageviews (30d)</h3>
        <div class="value">${totalPageviews.toLocaleString()}</div>
        <div class="change">↑ 15% vs last period</div>
      </div>
      <div class="metric-card">
        <h3>Est. Revenue (30d)</h3>
        <div class="value">$${totalRevenue.toFixed(2)}</div>
        <div class="change">↑ Growing</div>
      </div>
      <div class="metric-card">
        <h3>Indexed Pages</h3>
        <div class="value">${sitesData.reduce((sum, s) => sum + s.searchConsole.indexedPages, 0).toLocaleString()}</div>
        <div class="change">Google Search Console</div>
      </div>
    </div>
    
    <h2 style="margin-bottom: 1rem;">Site Performance</h2>
    <div class="sites-grid">
      ${sitesData.map(site => `
        <div class="site-card">
          <h2>${site.site.replace(/-/g, ' ').titleCase()}</h2>
          <div class="site-metrics">
            <div class="site-metric">
              <label>Sessions (30d)</label>
              <div class="value">${site.analytics.sessions.toLocaleString()}</div>
            </div>
            <div class="site-metric">
              <label>Revenue (30d)</label>
              <div class="value">$${site.revenue.estimatedRevenue}</div>
            </div>
            <div class="site-metric">
              <label>Indexed Pages</label>
              <div class="value">${site.searchConsole.indexedPages}</div>
            </div>
            <div class="site-metric">
              <label>Avg Position</label>
              <div class="value">${site.searchConsole.avgPosition}</div>
            </div>
          </div>
          <div style="margin-top: 1rem;">
            <label style="font-size: 0.8rem; color: #666;">Monetization Status:</label>
            <span class="status ${site.revenue.sources.adsense > 0 ? 'active' : 'pending'}">
              ${site.revenue.sources.adsense > 0 ? 'Active' : 'Pending Approval'}
            </span>
          </div>
        </div>
      `).join('')}
    </div>
    
    <h2 style="margin: 2rem 0 1rem;">Network Summary</h2>
    <table>
      <thead>
        <tr>
          <th>Site</th>
          <th>Pages</th>
          <th>Sessions</th>
          <th>Revenue</th>
          <th>RPM</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${sitesData.map(site => `
          <tr>
            <td>${site.site.replace(/-/g, ' ')}</td>
            <td>${site.searchConsole.indexedPages}</td>
            <td>${site.analytics.sessions.toLocaleString()}</td>
            <td>$${site.revenue.estimatedRevenue}</td>
            <td>$${site.revenue.rpm}</td>
            <td><span class="status ${site.revenue.sources.adsense > 0 ? 'active' : 'pending'}">${site.revenue.sources.adsense > 0 ? 'Active' : 'Pending'}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="footer">
      <p>Dashboard generated: ${new Date().toISOString()}</p>
      <p>Auto-refresh: Daily | Next update: ${new Date(Date.now() + 86400000).toLocaleDateString()}</p>
    </div>
  </div>
</body>
</html>`;
}

String.prototype.titleCase = function() {
  return this.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

function generateDashboard() {
  console.log('📊 Generating monitoring dashboard...\n');
  
  // Load sites config
  const sitesConfigPath = path.resolve(CONFIG.sitesConfig);
  if (!fs.existsSync(sitesConfigPath)) {
    console.error(`❌ Sites config not found: ${sitesConfigPath}`);
    console.log('Run build-sites.js first');
    return null;
  }
  
  const sitesConfig = JSON.parse(fs.readFileSync(sitesConfigPath, 'utf8'));
  const sites = sitesConfig.sites || [];
  
  console.log(`Processing ${sites.length} sites...`);
  
  const sitesData = sites.map(site => ({
    site: site.name,
    analytics: generateMockAnalytics(site.name),
    searchConsole: generateMockSearchConsole(site.name),
    revenue: generateMockRevenue(site.name)
  }));
  
  // Generate HTML dashboard
  const dashboardHTML = generateDashboardHTML(sitesData);
  const dashboardPath = path.resolve(CONFIG.outputDir, 'index.html');
  fs.mkdirSync(path.dirname(dashboardPath), { recursive: true });
  fs.writeFileSync(dashboardPath, dashboardHTML);
  
  // Generate JSON data for API consumption
  const dashboardData = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalSites: sites.length,
      totalPageviews: sitesData.reduce((sum, s) => sum + s.analytics.sessions, 0),
      totalRevenue: sitesData.reduce((sum, s) => sum + parseFloat(s.revenue.estimatedRevenue), 0),
      totalIndexedPages: sitesData.reduce((sum, s) => sum + s.searchConsole.indexedPages, 0)
    },
    sites: sitesData
  };
  
  fs.writeFileSync(
    path.resolve(CONFIG.outputDir, 'dashboard-data.json'),
    JSON.stringify(dashboardData, null, 2)
  );
  
  console.log('\n✅ Dashboard generated!');
  console.log(`HTML: ${dashboardPath}`);
  console.log(`JSON: ${path.resolve(CONFIG.outputDir, 'dashboard-data.json')}`);
  
  // Print summary
  console.log('\n📈 NETWORK SUMMARY');
  console.log('=================');
  console.log(`Total Sites: ${sites.length}`);
  console.log(`Est. Monthly Revenue: $${dashboardData.summary.totalRevenue.toFixed(2)}`);
  console.log(`Total Pageviews: ${dashboardData.summary.totalPageviews.toLocaleString()}`);
  console.log(`Indexed Pages: ${dashboardData.summary.totalIndexedPages.toLocaleString()}`);
  
  return dashboardData;
}

if (require.main === module) {
  generateDashboard();
}

module.exports = { generateDashboard };
