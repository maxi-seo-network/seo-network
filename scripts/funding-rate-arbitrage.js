const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const CONFIG = {
  checkIntervalMs: 300000, // 5 minutes
  fundingThreshold: 0.001, // 0.1% per 8 hours
  minProfitability: 0.0005, // 0.05% daily after fees
  dataDir: path.join(__dirname, '..', 'trading', 'data'),
  logDir: path.join(__dirname, '..', 'trading', 'logs'),
  memoryDir: path.join(__dirname, '..', 'memory')
};

// Ensure directories exist
[CONFIG.dataDir, CONFIG.logDir, CONFIG.memoryDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Mock data (replace with real API when available)
const mockMarkets = [
  { symbol: 'BTC-PERP', fundingRate: 0.0012, price: 67500 },
  { symbol: 'ETH-PERP', fundingRate: 0.0008, price: 3450 },
  { symbol: 'ASTER-PERP', fundingRate: 0.0015, price: 0.70 },
  { symbol: 'SOL-PERP', fundingRate: -0.0005, price: 145 },
  { symbol: 'AVAX-PERP', fundingRate: 0.0003, price: 35 }
];

function log(message) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}`;
  console.log(logLine);
  
  const logFile = path.join(CONFIG.logDir, `arbitrage-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logLine + '\n');
}

function calculateProfitability(market) {
  const fundingPayment = Math.abs(market.fundingRate);
  const dailyFunding = fundingPayment * 3; // 3x per day
  const tradingFees = 0.001; // 0.1% per trade (entry + exit)
  const netProfit = dailyFunding - (tradingFees * 2);
  return {
    dailyReturn: netProfit,
    annualized: netProfit * 365,
    breakEven: fundingPayment > (tradingFees * 2 / 3)
  };
}

function checkFundingRates() {
  return new Promise((resolve) => {
    // In production: fetch from real API
    // const response = await fetch('https://api.asterdex.com/v1/funding-rates');
    
    // For now, use mock data
    const opportunities = mockMarkets
      .filter(m => Math.abs(m.fundingRate) >= CONFIG.fundingThreshold)
      .map(m => ({
        ...m,
        profitability: calculateProfitability(m),
        side: m.fundingRate > 0 ? 'SHORT' : 'LONG',
        timestamp: new Date().toISOString()
      }));
    
    resolve(opportunities);
  });
}

function saveOpportunities(opportunities) {
  const dateStr = new Date().toISOString().split('T')[0];
  const dataFile = path.join(CONFIG.dataDir, `${dateStr}-opportunities.json`);
  
  let data = { checks: [] };
  if (fs.existsSync(dataFile)) {
    data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  }
  
  data.checks.push({
    timestamp: new Date().toISOString(),
    opportunities,
    count: opportunities.length
  });
  
  // Keep only last 100 checks
  if (data.checks.length > 100) {
    data.checks = data.checks.slice(-100);
  }
  
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  return dataFile;
}

function generateReport(opportunities) {
  const dateStr = new Date().toISOString().split('T')[0];
  const reportFile = path.join(CONFIG.memoryDir, `${dateStr}-arbitrage-report.md`);
  
  let report = `# Funding Rate Arbitrage Report - ${dateStr}\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n\n`;
  
  if (opportunities.length === 0) {
    report += `## No Opportunities Found\n\n`;
    report += `No funding rate arbitrage opportunities met the threshold (${CONFIG.fundingThreshold * 100}%) in this check.\n\n`;
  } else {
    report += `## Opportunities Found: ${opportunities.length}\n\n`;
    report += `| Symbol | Funding Rate | Side | Daily Return % | Annualized % |\n`;
    report += `|--------|--------------|------|----------------|--------------|\n`;
    
    opportunities.forEach(opp => {
      report += `| ${opp.symbol} | ${(opp.fundingRate * 100).toFixed(3)}% | ${opp.side} | ${(opp.profitability.dailyReturn * 100).toFixed(2)}% | ${(opp.profitability.annualized * 100).toFixed(0)}% |\n`;
    });
    
    report += `\n## Summary\n\n`;
    report += `- **Best Opportunity:** ${opportunities.reduce((a, b) => a.profitability.dailyReturn > b.profitability.dailyReturn ? a : b).symbol}\n`;
    report += `- **Average Daily Return:** ${(opportunities.reduce((sum, o) => sum + o.profitability.dailyReturn, 0) / opportunities.length * 100).toFixed(2)}%\n`;
    report += `- **Markets Scanned:** ${mockMarkets.length}\n`;
    report += `- **Threshold:** ${(CONFIG.fundingThreshold * 100).toFixed(2)}%\n\n`;
  }
  
  report += `## Next Check\n\n`;
  report += `Next monitoring cycle in ${CONFIG.checkIntervalMs / 1000} seconds.\n`;
  
  fs.writeFileSync(reportFile, report);
  return reportFile;
}

async function runMonitor() {
  log('\n🔍 Starting funding rate arbitrage monitor...');
  log(`Threshold: ${(CONFIG.fundingThreshold * 100).toFixed(2)}% per 8 hours`);
  log(`Check interval: ${CONFIG.checkIntervalMs / 1000} seconds`);
  
  const opportunities = await checkFundingRates();
  
  if (opportunities.length > 0) {
    log(`\n🎯 Found ${opportunities.length} arbitrage opportunities:`);
    opportunities.forEach(opp => {
      log(`  ${opp.symbol}: ${opp.side} | ${(opp.profitability.dailyReturn * 100).toFixed(2)}% daily | ${(opp.profitability.annualized * 100).toFixed(0)}% APY`);
    });
  } else {
    log(`\n⊘ No arbitrage opportunities found (below threshold)`);
  }
  
  const dataFile = saveOpportunities(opportunities);
  log(`📄 Data saved: ${dataFile}`);
  
  const reportFile = generateReport(opportunities);
  log(`📊 Report generated: ${reportFile}`);
  
  log('\n✅ Monitor cycle complete. Next check in 5 minutes.');
  
  return { opportunities, count: opportunities.length };
}

// Initial run
runMonitor().then(result => {
  // Schedule next check
  setTimeout(() => runMonitor(), CONFIG.checkIntervalMs);
}).catch(console.error);

// Keep running
console.log('\n📡 Monitoring active. Press Ctrl+C to stop.');
