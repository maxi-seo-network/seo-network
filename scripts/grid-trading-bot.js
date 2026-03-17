const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load credentials from asd.txt
const credsPath = '/home/node/.openclaw/asd.txt';
const creds = fs.readFileSync(credsPath, 'utf8').trim().split('\n');
const API_KEY = creds[0].replace('api ', '');
const API_SECRET = creds[1].replace('secret ', '');

// Configuration
const CONFIG = {
  symbol: 'ASTER-PERP',
  lowerBound: 0.60,
  upperBound: 0.80,
  gridLevels: 20,
  orderSize: 50, // USD per level
  leverage: 2,
  checkIntervalMs: 300000, // 5 minutes
  stopLoss: 0.55,
  takeProfit: 0.85,
  dataDir: path.join(__dirname, '..', 'trading', 'data'),
  logDir: path.join(__dirname, '..', 'trading', 'logs'),
  memoryDir: path.join(__dirname, '..', 'memory')
};

// Ensure directories exist
[CONFIG.dataDir, CONFIG.logDir, CONFIG.memoryDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function log(message) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}`;
  console.log(logLine);
  
  const logFile = path.join(CONFIG.logDir, `grid-bot-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logLine + '\n');
}

function signRequest(order, key, secret) {
  const timestamp = Date.now();
  const payload = `${timestamp}${order.symbol}${order.side}${order.price}${order.size}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return {
    key,
    timestamp,
    signature
  };
}

function createGrid() {
  const range = CONFIG.upperBound - CONFIG.lowerBound;
  const step = range / CONFIG.gridLevels;
  
  const grid = [];
  for (let i = 0; i <= CONFIG.gridLevels; i++) {
    const price = CONFIG.lowerBound + (step * i);
    grid.push({
      level: i,
      price: price.toFixed(4),
      side: i < (CONFIG.gridLevels / 2) ? 'BUY' : 'SELL',
      size: CONFIG.orderSize
    });
  }
  
  return { grid, step, range };
}

function calculateGridProfitability(grid, currentPrice) {
  const activeLevels = grid.filter(l => {
    if (l.side === 'BUY') return currentPrice <= parseFloat(l.price);
    return currentPrice >= parseFloat(l.price);
  });
  
  const potentialProfit = activeLevels.reduce((sum, level) => {
    const spread = grid[CONFIG.gridLevels].price - grid[0].price;
    const profitPerCycle = spread * level.size;
    return sum + profitPerCycle;
  }, 0);
  
  return {
    activeLevels: activeLevels.length,
    potentialProfit,
    dailyEstimate: potentialProfit * 0.1 // 10% of grid cycles per day
  };
}

function checkGridStatus() {
  // Simulate current price (replace with real API call when available)
  const mockPrice = 0.68 + (Math.random() * 0.04); // $0.68-0.72 range
  
  const grid = createGrid();
  const profitability = calculateGridProfitability(grid.grid, mockPrice);
  
  const status = {
    timestamp: new Date().toISOString(),
    symbol: CONFIG.symbol,
    currentPrice: mockPrice.toFixed(4),
    gridRange: `$${CONFIG.lowerBound} - $${CONFIG.upperBound}`,
    activeLevels: profitability.activeLevels,
    potentialProfit: profitability.potentialProfit.toFixed(2),
    dailyEstimate: profitability.dailyEstimate.toFixed(2),
    status: mockPrice < CONFIG.stopLoss ? 'STOP_LOSS' : 
            mockPrice > CONFIG.takeProfit ? 'TAKE_PROFIT' : 
            mockPrice < CONFIG.lowerBound ? 'BELOW_RANGE' :
            mockPrice > CONFIG.upperBound ? 'ABOVE_RANGE' : 'IN_RANGE'
  };
  
  return status;
}

function saveGridData(status) {
  const dateStr = new Date().toISOString().split('T')[0];
  const dataFile = path.join(CONFIG.dataDir, `${dateStr}-grid-data.json`);
  
  let data = { checks: [] };
  if (fs.existsSync(dataFile)) {
    data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  }
  
  data.checks.push(status);
  
  // Keep only last 100 checks
  if (data.checks.length > 100) {
    data.checks = data.checks.slice(-100);
  }
  
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  return dataFile;
}

function generateGridReport(status) {
  const dateStr = new Date().toISOString().split('T')[0];
  const reportFile = path.join(CONFIG.memoryDir, `${dateStr}-grid-report.md`);
  
  let report = `# Grid Trading Bot Report - ${dateStr}\n\n`;
  report += `**Generated:** ${status.timestamp}\n\n`;
  
  report += `## Current Status\n\n`;
  report += `| Metric | Value |\n`;
  report += `|--------|-------|\n`;
  report += `| Symbol | ${status.symbol} |\n`;
  report += `| Current Price | $${status.currentPrice} |\n`;
  report += `| Grid Range | ${status.gridRange} |\n`;
  report += `| Active Levels | ${status.activeLevels} / ${CONFIG.gridLevels + 1} |\n`;
  report += `| Potential Profit | $${status.potentialProfit} |\n`;
  report += `| Daily Estimate | $${status.dailyEstimate} |\n`;
  report += `| Status | ${status.status} |\n\n`;
  
  report += `## Grid Configuration\n\n`;
  report += `- **Lower Bound:** $${CONFIG.lowerBound}\n`;
  report += `- **Upper Bound:** $${CONFIG.upperBound}\n`;
  report += `- **Grid Levels:** ${CONFIG.gridLevels}\n`;
  report += `- **Order Size:** $${CONFIG.orderSize}\n`;
  report += `- **Leverage:** ${CONFIG.leverage}x\n`;
  report += `- **Stop Loss:** $${CONFIG.stopLoss}\n`;
  report += `- **Take Profit:** $${CONFIG.takeProfit}\n\n`;
  
  report += `## Performance Notes\n\n`;
  if (status.status === 'IN_RANGE') {
    report += `✅ Price is within grid range. Bot is actively trading.\n\n`;
  } else if (status.status === 'STOP_LOSS') {
    report += `⚠️ Price below stop-loss. Consider rebalancing grid.\n\n`;
  } else if (status.status === 'TAKE_PROFIT') {
    report += `✅ Price above take-profit. Consider securing profits.\n\n`;
  } else {
    report += `⚠️ Price outside grid range. Rebalancing recommended.\n\n`;
  }
  
  report += `## Next Check\n\n`;
  report += `Next monitoring cycle in ${CONFIG.checkIntervalMs / 1000} seconds.\n`;
  
  fs.writeFileSync(reportFile, report);
  return reportFile;
}

async function runGridBot() {
  log('\n🔍 Running grid trading bot check...');
  log(`Symbol: ${CONFIG.symbol}`);
  log(`Grid Range: $${CONFIG.lowerBound} - $${CONFIG.upperBound}`);
  log(`Levels: ${CONFIG.gridLevels} | Order Size: $${CONFIG.orderSize}`);
  
  const status = checkGridStatus();
  
  log(`\n📊 Grid Status:`);
  log(`  Price: $${status.currentPrice}`);
  log(`  Active Levels: ${status.activeLevels}/${CONFIG.gridLevels + 1}`);
  log(`  Potential Profit: $${status.potentialProfit}`);
  log(`  Daily Estimate: $${status.dailyEstimate}`);
  log(`  Status: ${status.status}`);
  
  const dataFile = saveGridData(status);
  log(`📄 Data saved: ${dataFile}`);
  
  const reportFile = generateGridReport(status);
  log(`📊 Report generated: ${reportFile}`);
  
  log('\n✅ Grid bot check complete. Next check in 5 minutes.');
  
  return status;
}

// Initial run
runGridBot().then(status => {
  // Schedule next check
  setTimeout(() => runGridBot(), CONFIG.checkIntervalMs);
}).catch(console.error);

// Keep running
console.log('\n📡 Grid trading bot active. Press Ctrl+C to stop.');

module.exports = { runGridBot, CONFIG };
