/**
 * Query AsterDEX for trading opportunities
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
          const parsed = JSON.parse(data);
          resolve(parsed);
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
  console.log('=== AsterDEX Market Query ===\n');
  
  // 1. Get account balance
  console.log('1. Checking account balance...');
  try {
    const balance = await apiRequest('../v2/balance');
    console.log('Balance:', JSON.stringify(balance, null, 2));
  } catch (e) {
    console.log('Balance error:', e.message);
  }
  
  // 2. Get positions
  console.log('\n2. Checking current positions...');
  try {
    const positions = await apiRequest('account');
    console.log('Account info:', JSON.stringify(positions, null, 2));
  } catch (e) {
    console.log('Positions error:', e.message);
  }
  
  // 3. Get all funding rates
  console.log('\n3. Fetching funding rates for all pairs...');
  try {
    const fundingRates = await apiRequest('fundingRate');
    if (Array.isArray(fundingRates)) {
      console.log(`Found ${fundingRates.length} perpetual pairs\n`);
      
      // Sort by funding rate (most negative first = best for longs)
      const sorted = [...fundingRates].sort((a, b) => 
        parseFloat(a.fundingRate || 0) - parseFloat(b.fundingRate || 0)
      );
      
      console.log('=== TOP 15 NEGATIVE FUNDING RATES (best for longs) ===');
      sorted.slice(0, 15).forEach(r => {
        const rate = parseFloat(r.fundingRate || 0) * 100;
        const time = r.fundingTime ? new Date(r.fundingTime).toISOString() : 'N/A';
        console.log(`${r.symbol}: ${rate.toFixed(4)}% | Next funding: ${time}`);
      });
      
      console.log('\n=== TOP 15 POSITIVE FUNDING RATES (best for shorts) ===');
      sorted.slice(-15).reverse().forEach(r => {
        const rate = parseFloat(r.fundingRate || 0) * 100;
        const time = r.fundingTime ? new Date(r.fundingTime).toISOString() : 'N/A';
        console.log(`${r.symbol}: ${rate.toFixed(4)}% | Next funding: ${time}`);
      });
    } else {
      console.log('Funding rates response:', JSON.stringify(fundingRates, null, 2));
    }
  } catch (e) {
    console.log('Funding rates error:', e.message);
  }
  
  // 4. Get exchange info to understand trading pairs
  console.log('\n4. Getting exchange info (trading pairs)...');
  try {
    const exchangeInfo = await apiRequest('exchangeInfo');
    if (exchangeInfo.symbols) {
      console.log(`Found ${exchangeInfo.symbols.length} trading pairs`);
      // Show some perpetual pairs with their filters
      const perpetuals = exchangeInfo.symbols.filter(s => s.symbol && s.symbol.includes('USDT'));
      console.log(`USDT perpetual pairs: ${perpetuals.length}`);
      
      // Show first few with contract details
      console.log('\n=== Sample Perpetual Pair Details ===');
      perpetuals.slice(0, 5).forEach(s => {
        console.log(`\n${s.symbol}:`);
        if (s.filters) {
          const minQty = s.filters.find(f => f.filterType === 'LOT_SIZE');
          const minNotional = s.filters.find(f => f.filterType === 'MIN_NOTIONAL');
          if (minQty) console.log(`  Min qty: ${minQty.minQty}, Step: ${minQty.stepSize}`);
          if (minNotional) console.log(`  Min notional: ${minNotional.notional}`);
        }
      });
    } else {
      console.log('Exchange info:', JSON.stringify(exchangeInfo, null, 2).slice(0, 2000));
    }
  } catch (e) {
    console.log('Exchange info error:', e.message);
  }
  
  // 5. Get prices for major pairs
  console.log('\n\n5. Getting prices for major volatile pairs...');
  const majorPairs = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'DOGEUSDT', 'XRPUSDT', 'PEPEUSDT', 'WIFUSDT', '1000PEPEUSDT'];
  
  for (const symbol of majorPairs) {
    try {
      const ticker = await apiRequest('ticker/price', { symbol });
      console.log(`${symbol}: $${parseFloat(ticker.price).toFixed(6)}`);
    } catch (e) {
      // Try alternate names
      try {
        const altSymbol = symbol.replace('USDT', '_USDT');
        const ticker = await apiRequest('ticker/price', { symbol: altSymbol });
        console.log(`${altSymbol}: $${parseFloat(ticker.price).toFixed(6)}`);
      } catch (e2) {
        console.log(`${symbol}: Not found`);
      }
    }
  }
}

main().catch(console.error);