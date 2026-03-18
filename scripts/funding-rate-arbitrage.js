/**
 * AsterDEX Funding Rate Arbitrage Bot - DISABLED
 * 
 * ⚠️ DISABLED - This bot caused losses by trading small-cap tokens
 * ⚠️ DO NOT ENABLE - Violates trading rules (majors only)
 * 
 * Original issue: Traded PIPPIN despite losing 61% earlier on same token
 * Script ran automatically without user consent
 * 
 * If you want to re-enable:
 * 1. Change simulationMode to false
 * 2. Add MAJOR PAIR FILTER (BTC, ETH, SOL, BNB, XRP only)
 * 3. Get explicit user approval before trading
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// Configuration - LIVE TRADING ACTIVE
const CONFIG = {
  apiBaseUrl: 'fapi.asterdex.com',
  apiKey: '96b31336fd33c7c043e0521ea1a3bd49899182b25b328a32df4f8c9a2d2759d3',
  apiSecret: '27cc35cc0cd2f891711336b24e234b4ece23e91fecd78ebfe51f0520dbbdaf06',
  checkIntervalMs: 14400000, // 4 hours (funding rate interval)
  fundingThreshold: 0.001, // 0.1% minimum funding rate to trade
  minProfitability: 0.0005, // 0.05% daily after fees
  maxPositionSize: 20, // $20 max per position (conservative for $23.85 balance)
  leverage: 5, // Conservative leverage
  simulationMode: true, // DISABLED - Live trading disabled to prevent losses
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
  
  const logFile = path.join(CONFIG.logDir, `arbitrage-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logLine + '\n');
}

/**
 * Make authenticated API request
 */
function apiRequest(endpoint, params = {}, method = 'GET') {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const queryParams = { ...params, timestamp };
    const queryString = Object.entries(queryParams)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    
    const signature = crypto
      .createHmac('sha256', CONFIG.apiSecret)
      .update(queryString)
      .digest('hex');
    
    const path = `/fapi/v1/${endpoint}?${queryString}&signature=${signature}`;
    
    const options = {
      hostname: CONFIG.apiBaseUrl,
      port: 443,
      path: path,
      method: method,
      headers: {
        'X-MBX-APIKEY': CONFIG.apiKey,
        'Content-Type': 'application/json',
      },
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.code && parsed.code < 0) {
            reject(new Error(`API Error: ${parsed.msg}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

/**
 * Get funding rates from live API
 */
async function getFundingRates() {
  return apiRequest('fundingRate', { limit: 200 });
}

/**
 * Get ticker price
 */
async function getTickerPrice(symbol) {
  return apiRequest('ticker/price', { symbol });
}

/**
 * Get account balance
 */
async function getBalance() {
  return apiRequest('../v2/balance');
}

/**
 * Place order (LIVE TRADING) - Hedge Mode
 */
async function placeOrder(symbol, side, type, quantity, price = null, positionSide = 'LONG') {
  if (CONFIG.simulationMode) {
    log(`[SIMULATION] Would place order: ${side} ${quantity} ${symbol} @ ${price || 'market'} (${positionSide})`);
    return { simulated: true };
  }
  
  const params = {
    symbol,
    side,
    type,
    quantity,
    positionSide, // Hedge mode required: LONG or SHORT
  };
  
  if (price && type === 'LIMIT') {
    params.price = price;
    params.timeInForce = 'GTC';
  } else {
    params.type = 'MARKET';
  }
  
  log(`[LIVE] Placing order: ${side} ${quantity} ${symbol} @ ${price || 'market'} (${positionSide})`);
  return apiRequest('order', params, 'POST');
}

/**
 * Change leverage
 */
async function changeLeverage(symbol, leverage) {
  if (CONFIG.simulationMode) {
    log(`[SIMULATION] Would set leverage: ${leverage}x for ${symbol}`);
    return { simulated: true };
  }
  
  log(`[LIVE] Setting leverage: ${leverage}x for ${symbol}`);
  return apiRequest('leverage', { symbol, leverage }, 'POST');
}

/**
 * Calculate profitability
 */
function calculateProfitability(fundingRate) {
  const fundingPayment = Math.abs(fundingRate);
  const dailyFunding = fundingPayment * 3; // 3x per day
  const tradingFees = 0.001; // 0.1% per trade
  const netProfit = dailyFunding - (tradingFees * 2);
  return {
    dailyReturn: netProfit,
    annualized: netProfit * 365,
    breakEven: fundingPayment > (tradingFees * 2 / 3)
  };
}

/**
 * Find best arbitrage opportunities
 */
async function findOpportunities() {
  log('Fetching live funding rates...');
  const fundingRates = await getFundingRates();
  
  const opportunities = fundingRates
    .filter(m => Math.abs(m.fundingRate) >= CONFIG.fundingThreshold)
    .map(m => ({
      symbol: m.symbol,
      fundingRate: parseFloat(m.fundingRate),
      fundingTime: m.fundingTime,
      side: m.fundingRate > 0 ? 'SELL' : 'BUY', // Short positive (SELL), long negative (BUY)
      positionSide: m.fundingRate > 0 ? 'SHORT' : 'LONG', // Hedge mode: SHORT for positive funding, LONG for negative
      profitability: calculateProfitability(parseFloat(m.fundingRate)),
      timestamp: new Date().toISOString()
    }))
    .sort((a, b) => Math.abs(b.fundingRate) - Math.abs(a.fundingRate));
  
  return opportunities;
}

/**
 * Execute arbitrage trade
 */
async function executeArbitrage(opportunity) {
  const symbol = opportunity.symbol.replace('USDT', 'USDT'); // Ensure format
  
  log(`\n🎯 Executing arbitrage on ${symbol}`);
  log(`   Funding Rate: ${(opportunity.fundingRate * 100).toFixed(3)}%`);
  log(`   Side: ${opportunity.side} (get paid funding)`);
  log(`   Position Size: $${CONFIG.maxPositionSize}`);
  log(`   Leverage: ${CONFIG.leverage}x`);
  
  try {
    // Get current price
    const ticker = await getTickerPrice(symbol);
    const price = parseFloat(ticker.price);
    
    // Calculate quantity (round to whole number for assets with stepSize: 1)
    const rawQty = CONFIG.maxPositionSize / price;
    const quantity = Math.floor(rawQty); // Round down to whole number
    
    log(`   Current Price: $${price}`);
    log(`   Order Quantity: ${quantity}`);
    
    // Set position mode to BOTH (required before trading)
    try {
      await apiRequest('positionSide', { symbol, positionSide: 'BOTH' }, 'POST');
      log(`   Position mode set to BOTH`);
    } catch (e) {
      log(`   Position mode already set: ${e.message}`);
    }
    
    // Set leverage
    await changeLeverage(symbol, CONFIG.leverage);
    
    // Place order with explicit positionSide (hedge mode required)
    const order = await placeOrder(
      symbol,
      opportunity.side, // BUY if funding negative, SELL if positive
      'MARKET',
      quantity,
      null,
      opportunity.positionSide // LONG for negative funding, SHORT for positive
    );
    
    log(`   ✅ Order placed: ${order.orderId || 'simulated'}`);
    
    return {
      success: true,
      symbol,
      side: opportunity.side,
      quantity,
      price,
      orderId: order.orderId,
      expectedDailyReturn: opportunity.profitability.dailyReturn * 100
    };
    
  } catch (error) {
    log(`   ❌ Trade failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Save opportunities to file
 */
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
    count: opportunities.length,
    mode: CONFIG.simulationMode ? 'simulation' : 'live'
  });
  
  if (data.checks.length > 100) {
    data.checks = data.checks.slice(-100);
  }
  
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  return dataFile;
}

/**
 * Generate report
 */
function generateReport(opportunities, trades = []) {
  const dateStr = new Date().toISOString().split('T')[0];
  const reportFile = path.join(CONFIG.memoryDir, `${dateStr}-arbitrage-report.md`);
  
  let report = `# Funding Rate Arbitrage Report - ${dateStr}\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n`;
  report += `**Mode:** ${CONFIG.simulationMode ? 'Simulation' : 'LIVE TRADING'}\n\n`;
  
  if (opportunities.length === 0) {
    report += `## No Opportunities Found\n\n`;
    report += `No funding rate arbitrage opportunities met the threshold.\n\n`;
  } else {
    report += `## Top Opportunities: ${opportunities.length}\n\n`;
    report += `| Symbol | Funding Rate | Side | Daily Return % | Annualized % |\n`;
    report += `|--------|--------------|------|----------------|--------------|\n`;
    
    opportunities.slice(0, 10).forEach(opp => {
      report += `| ${opp.symbol} | ${(opp.fundingRate * 100).toFixed(3)}% | ${opp.side} | ${(opp.profitability.dailyReturn * 100).toFixed(2)}% | ${(opp.profitability.annualized * 100).toFixed(0)}% |\n`;
    });
    
    report += `\n## Summary\n\n`;
    if (opportunities.length > 0) {
      report += `- **Best Opportunity:** ${opportunities[0].symbol} (${(opportunities[0].fundingRate * 100).toFixed(3)}%)\n`;
    }
    report += `- **Mode:** ${CONFIG.simulationMode ? 'Simulation' : 'LIVE'}\n`;
    report += `- **Position Size:** $${CONFIG.maxPositionSize}\n`;
    report += `- **Leverage:** ${CONFIG.leverage}x\n\n`;
  }
  
  if (trades.length > 0) {
    report += `## Executed Trades\n\n`;
    trades.forEach(trade => {
      if (trade.success) {
        report += `✅ ${trade.symbol}: ${trade.side} ${trade.quantity} @ $${trade.price}\n`;
        report += `   Expected daily return: ${trade.expectedDailyReturn.toFixed(2)}%\n\n`;
      }
    });
  }
  
  report += `## Next Check\n\n`;
  report += `Next monitoring cycle in ${CONFIG.checkIntervalMs / 1000} seconds.\n`;
  
  fs.writeFileSync(reportFile, report);
  return reportFile;
}

/**
 * Main monitor cycle
 */
async function runMonitor() {
  log('\n🔍 Starting funding rate arbitrage monitor...');
  log(`Mode: ${CONFIG.simulationMode ? 'SIMULATION' : 'LIVE TRADING'}`);
  log(`Threshold: ${(CONFIG.fundingThreshold * 100).toFixed(2)}% per 8 hours`);
  log(`Position Size: $${CONFIG.maxPositionSize}`);
  log(`Leverage: ${CONFIG.leverage}x`);
  
  // Get balance
  try {
    const balance = await getBalance();
    const usdt = balance.find(b => b.asset === 'USDT');
    if (usdt) {
      log(`Account Balance: $${usdt.balance} USDT`);
    }
  } catch (e) {
    log(`Balance check failed: ${e.message}`);
  }
  
  const opportunities = await findOpportunities();
  
  if (opportunities.length > 0) {
    log(`\n🎯 Found ${opportunities.length} arbitrage opportunities:`);
    opportunities.slice(0, 5).forEach(opp => {
      log(`  ${opp.symbol}: ${opp.side} | ${(opp.profitability.dailyReturn * 100).toFixed(2)}% daily | ${(opp.fundingRate * 100).toFixed(3)}% funding`);
    });
    
    // Execute trade on best opportunity
    const bestOpp = opportunities[0];
    const tradeResult = await executeArbitrage(bestOpp);
    
    const dataFile = saveOpportunities(opportunities);
    log(`📄 Data saved: ${dataFile}`);
    
    const reportFile = generateReport(opportunities, [tradeResult]);
    log(`📊 Report generated: ${reportFile}`);
    
    if (tradeResult.success) {
      log(`\n✅ Trade executed successfully!`);
      log(`   Expected daily return: ${tradeResult.expectedDailyReturn.toFixed(2)}%`);
    }
  } else {
    log(`\n⊘ No arbitrage opportunities found (below threshold)`);
    const dataFile = saveOpportunities(opportunities);
    const reportFile = generateReport(opportunities, []);
    log(`📄 Data saved: ${dataFile}`);
    log(`📊 Report generated: ${reportFile}`);
  }
  
  log(`\n✅ Monitor cycle complete. Next check in ${CONFIG.checkIntervalMs / 1000} seconds.`);
  
  return { opportunities, count: opportunities.length };
}

// Initial run
log('🚀 Funding Rate Arbitrage Bot Starting (LIVE MODE)...');
runMonitor().then(result => {
  // Schedule next check
  setTimeout(() => runMonitor(), CONFIG.checkIntervalMs);
}).catch(console.error);

log('📡 Monitoring active.');
