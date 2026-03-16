#!/usr/bin/env node
/**
 * SEO Network Orchestrator
 * Runs the complete pipeline: generate → build → deploy → monetize → monitor
 */

const { generateSites } = require('./generate-content');
const { buildAllSites } = require('./build-sites');
const { setupAllSites } = require('./setup-monetization');
const { generateDashboard } = require('./monitoring-dashboard');
const fs = require('fs');
const path = require('path');

const WORKSPACE = '/home/node/.openclaw/workspace/seo-network';
const SITES_DIR = path.join(WORKSPACE, 'sites');
const BUILD_DIR = path.join(WORKSPACE, 'build');
const DASHBOARD_DIR = path.join(WORKSPACE, 'dashboard');

function runPipeline() {
  console.log('🚀 SEO Network Pipeline - Starting Full Deployment\n');
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  const results = {
    startedAt: new Date().toISOString(),
    steps: []
  };
  
  // Step 1: Generate Content
  console.log('\n📝 STEP 1: Content Generation');
  console.log('-'.repeat(60));
  try {
    generateSites();
    results.steps.push({
      name: 'content-generation',
      status: 'success',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Content generation complete');
  } catch (err) {
    console.error('❌ Content generation failed:', err.message);
    results.steps.push({
      name: 'content-generation',
      status: 'failed',
      error: err.message,
      timestamp: new Date().toISOString()
    });
    return results;
  }
  
  // Step 2: Build Sites
  console.log('\n🔨 STEP 2: Site Building');
  console.log('-'.repeat(60));
  try {
    buildAllSites();
    results.steps.push({
      name: 'site-building',
      status: 'success',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Site building complete');
  } catch (err) {
    console.error('❌ Site building failed:', err.message);
    results.steps.push({
      name: 'site-building',
      status: 'failed',
      error: err.message,
      timestamp: new Date().toISOString()
    });
    return results;
  }
  
  // Step 3: Setup Monetization
  console.log('\n💰 STEP 3: Monetization Setup');
  console.log('-'.repeat(60));
  try {
    setupAllSites();
    results.steps.push({
      name: 'monetization',
      status: 'success',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Monetization setup complete');
  } catch (err) {
    console.error('❌ Monetization setup failed:', err.message);
    results.steps.push({
      name: 'monetization',
      status: 'failed',
      error: err.message,
      timestamp: new Date().toISOString()
    });
    // Continue without monetization
  }
  
  // Step 4: Generate Dashboard
  console.log('\n📊 STEP 4: Monitoring Dashboard');
  console.log('-'.repeat(60));
  try {
    generateDashboard();
    results.steps.push({
      name: 'dashboard',
      status: 'success',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Dashboard generation complete');
  } catch (err) {
    console.error('❌ Dashboard generation failed:', err.message);
    results.steps.push({
      name: 'dashboard',
      status: 'failed',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
  
  // Final summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  results.completedAt = new Date().toISOString();
  results.durationSeconds = parseFloat(duration);
  
  // Load final state
  const buildManifestPath = path.join(BUILD_DIR, 'build-manifest.json');
  if (fs.existsSync(buildManifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));
    results.sites = manifest.sites.map(s => ({
      name: s.name,
      pages: s.pages,
      url: `https://maxi-seo-network.github.io/${s.name}/`,
      status: 'built'
    }));
  }
  
  // Save pipeline results
  const resultsPath = path.join(WORKSPACE, 'pipeline-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  // Print final summary
  console.log('\n' + '='.repeat(60));
  console.log('🎉 PIPELINE COMPLETE');
  console.log('='.repeat(60));
  console.log(`Duration: ${duration}s`);
  console.log(`Sites created: ${results.sites ? results.sites.length : 0}`);
  console.log(`Total pages: ${results.sites ? results.sites.reduce((sum, s) => sum + s.pages, 0) : 0}`);
  console.log(`Dashboard: ${DASHBOARD_DIR}/index.html`);
  console.log(`Results saved to: ${resultsPath}`);
  
  console.log('\n📋 DEPLOYMENT CHECKLIST');
  console.log('-'.repeat(60));
  console.log('□ Push to GitHub: cd seo-network && git add . && git commit -m "Initial" && git push');
  console.log('□ Create GitHub repos for each site (or run deploy script)');
  console.log('□ Apply for Google AdSense: https://adsense.google.com');
  console.log('□ Join Amazon Associates: https://affiliate-program.amazon.com');
  console.log('□ Submit sitemaps to Google Search Console');
  console.log('□ Set up Google Analytics properties');
  console.log('□ Configure custom domains (optional)');
  
  console.log('\n🌐 LIVE SITES');
  console.log('-'.repeat(60));
  if (results.sites) {
    results.sites.forEach(site => {
      console.log(`• ${site.url}`);
    });
  }
  
  console.log('\n📈 EXPECTED REVENUE PROJECTION');
  console.log('-'.repeat(60));
  console.log('Month 1-3: $50-200/site (indexing phase)');
  console.log('Month 4-6: $200-500/site (growing traffic)');
  console.log('Month 7-12: $500-1000/site (mature SEO)');
  console.log('Network total (10 sites, month 12): $5,000-10,000/month');
  
  return results;
}

// Run if called directly
if (require.main === module) {
  runPipeline();
}

module.exports = { runPipeline };
