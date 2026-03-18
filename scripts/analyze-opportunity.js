/**
 * Analyze trading opportunity with detailed checks
 */

const crypto = require('crypto');
const https = require('https');

const CONFIG = {
  baseUrl: 'fapi.asterdex.com',
  apiPrefix: '/fapi/v1',
  apiKey: '96b31336fd33c7c043e0521ea1a3bd49899182b25b328a32df4f8c9a2d2759d3',
  apiSecret: '27cc35cc0cd2f891711336b24e234b4ece23e91fecd78ebfe51f0520dbbdaf06',
};

async function apiRequest(endpoint, params = {}, method = 'GET') {
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
    
    const path = `${CONFIG.apiPrefix}/${endpoint}?${queryString}&signature=${signature}`;
    
    const options = {
      hostname: CONFIG.baseUrl,
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
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

async function main() {
  console.log('=== DETAILED ANALYSIS FOR $7.84 USDT TRADING ===\n');
  
  // Pairs with most negative funding rates (longs collect from shorts)
  const targetPairs = ['STABLEUSDT', 'ZORAUSDT', 'TRUMPUSDT', 'SOONUSDT', 'SOLUSDT', 'XRPUSDT'];
  
  for (const symbol of targetPairs) {
    console.log(`\n=== ${symbol} ===`);
    
    // Get price
    try {
      const ticker = await apiRequest('ticker/price', { symbol });
      console.log(`Price: $${parseFloat(ticker.price).toFixed(6)}`);
    } catch (e) {
      console.log(`Price: Error - ${e.message}`);
    }
    
    // Get order book depth to assess liquidity
    try {
      const depth = await apiRequest('depth', { symbol, limit: 10 });
      if (depth.bids && depth.asks) {
        const bestBid = parseFloat(depth.bids[0]?.[0] || 0);
        const bestAsk = parseFloat(depth.asks[0]?.[0] || 0);
        const spread = bestAsk - bestBid;
        const spreadPct = ((spread / bestBid) * 100).toFixed(4);
        const bidDepth = depth.bids.slice(0, 5).reduce((sum, b) => sum + parseFloat(b[1]), 0);
        const askDepth = depth.asks.slice(0, 5).reduce((sum, a) => sum + parseFloat(a[1]), 0);
        
        console.log(`Spread: ${spreadPct}% ($${spread.toFixed(6)})`);
        console.log(`Top 5 bid depth: ${bidDepth.toFixed(2)} units`);
        console.log(`Top 5 ask depth: ${askDepth.toFixed(2)} units`);
        
        // Calculate $5 position size in units
        const midPrice = (bestBid + bestAsk) / 2;
        const unitsFor5 = 5 / midPrice;
        console.log(`$5 position = ${unitsFor5.toFixed(4)} units`);
        
        // Check if order book can absorb
        const canFill = askDepth >= unitsFor5;
        console.log(`Can fill $5 market order: ${canFill ? 'YES' : 'NO - LOW LIQUIDITY!'}`);
      }
    } catch (e) {
      console.log(`Order book: Error - ${e.message}`);
    }
    
    // Get exchange info for min notional
    try {
      const info = await apiRequest('exchangeInfo');
      const pair = info.symbols?.find(s => s.symbol === symbol);
      if (pair?.filters) {
        const minNotional = pair.filters.find(f => f.filterType === 'MIN_NOTIONAL');
        const lotSize = pair.filters.find(f => f.filterType === 'LOT_SIZE');
        console.log(`Min notional: $${minNotional?.notional || 'N/A'}`);
        console.log(`Min qty: ${lotSize?.minQty || 'N/A'}, Step: ${lotSize?.stepSize || 'N/A'}`);
      }
    } catch (e) {
      console.log(`Exchange info error: ${e.message}`);
    }
  }
  
  // Check balance one more time
  console.log('\n\n=== FINAL BALANCE CHECK ===');
  try {
    const balance = await apiRequest('../v2/balance');
    if (Array.isArray(balance)) {
      const usdt = balance.find(b => b.asset === 'USDT');
      if (usdt) {
        console.log(`Available USDT: ${usdt.availableBalance}`);
        console.log(`Total USDT: ${usdt.balance}`);
      }
    } else {
      console.log('Balance:', JSON.stringify(balance, null, 2));
    }
  } catch (e) {
    console.log('Balance error:', e.message);
  }
}

main().catch(console.error);