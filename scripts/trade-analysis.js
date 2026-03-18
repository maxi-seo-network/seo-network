/**
 * AsterDEX High-Risk Trade Analysis
 * Analyze all pairs for potential trades to grow $7.84 to $50
 */

const {
  CONFIG,
  getBalance,
  getPositions,
  getExchangeInfo,
  getFundingRates,
  getTickerPrice,
  getOrderBook,
  getKlines,
} = require('./asterdex-api.js');

// Capital constraints
const CAPITAL = {
  starting: 7.84,
  target: 50,
  requiredGrowth: 540, // percentage
  minPosition: 5.0, // Minimum position size
  buffer: 2.84, // Safety buffer
  maxSafeLeverage: 5, // Conservative max
  maxRiskyLeverage: 10, // Absolute max
};

// Risk thresholds
const RISK = {
  minFundingRate: 0.0005, // 0.05% minimum for funding arb
  minVolume24h: 100000, // Minimum 24h volume in USDT
  minOrderBookDepth: 50000, // Minimum order book depth
  maxSpreadPercent: 0.5, // Maximum spread percentage
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function analyzeMarket() {
  console.log('=== AsterDEX High-Risk Trade Analysis ===\n');
  console.log(`Objective: Grow $${CAPITAL.starting} to $${CAPITAL.target} (${CAPITAL.requiredGrowth}% growth)\n`);
  
  try {
    // Step 1: Get current balance
    console.log('1. Fetching account balance...');
    const balance = await getBalance();
    console.log('Balance data:', JSON.stringify(balance, null, 2));
    
    // Step 2: Get exchange info (all pairs)
    console.log('\n2. Fetching exchange info...');
    const exchangeInfo = await getExchangeInfo();
    
    let symbols = [];
    if (exchangeInfo.symbols) {
      symbols = exchangeInfo.symbols;
    } else if (Array.isArray(exchangeInfo)) {
      symbols = exchangeInfo;
    }
    
    console.log(`Found ${symbols.length} trading pairs`);
    
    // Step 3: Get funding rates
    console.log('\n3. Fetching funding rates...');
    const fundingRates = await getFundingRates();
    console.log('Funding rates data:', JSON.stringify(fundingRates, null, 2));
    
    // Step 4: Get all ticker prices
    console.log('\n4. Fetching all ticker prices...');
    let allPrices = [];
    try {
      // Try getting all prices at once
      allPrices = await getTickerPrice('');
      console.log(`Got ${allPrices.length ? allPrices.length : 'all'} prices`);
    } catch (e) {
      console.log('Could not get all prices at once, will get per symbol');
    }
    
    // Step 5: Analyze each major pair
    console.log('\n5. Analyzing major trading pairs...\n');
    
    const majorPairs = [
      'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 
      'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT',
      'LINKUSDT', 'DOTUSDT', 'MATICUSDT', 'LTCUSDT'
    ];
    
    const analysisResults = [];
    
    for (const symbol of majorPairs) {
      try {
        console.log(`\n--- Analyzing ${symbol} ---`);
        
        // Get ticker
        const ticker = await getTickerPrice(symbol);
        const price = parseFloat(ticker.price || ticker);
        console.log(`Price: $${price}`);
        
        // Get order book
        await sleep(100); // Rate limiting
        const orderBook = await getOrderBook(symbol, 20);
        const bids = orderBook.bids || [];
        const asks = orderBook.asks || [];
        
        if (bids.length > 0 && asks.length > 0) {
          const bestBid = parseFloat(bids[0][0]);
          const bestAsk = parseFloat(asks[0][0]);
          const spread = ((bestAsk - bestBid) / bestBid * 100).toFixed(3);
          console.log(`Spread: ${spread}%`);
          
          // Calculate order book depth
          const bidDepth = bids.reduce((sum, b) => sum + parseFloat(b[0]) * parseFloat(b[1]), 0);
          const askDepth = asks.reduce((sum, a) => sum + parseFloat(a[0]) * parseFloat(a[1]), 0);
          console.log(`Order book depth: $${(bidDepth + askDepth).toFixed(2)}`);
        }
        
        // Get klines for volatility
        await sleep(100);
        const klines = await getKlines(symbol, '1h', 24);
        
        if (klines && klines.length > 0) {
          const prices = klines.map(k => parseFloat(k[4])); // Close prices
          const high24h = Math.max(...klines.map(k => parseFloat(k[2])));
          const low24h = Math.min(...klines.map(k => parseFloat(k[3])));
          const volatility = ((high24h - low24h) / low24h * 100).toFixed(2);
          console.log(`24h High/Low: $${high24h} / $${low24h}`);
          console.log(`24h Volatility: ${volatility}%`);
          
          // Volume
          const volume = klines.reduce((sum, k) => sum + parseFloat(k[5]), 0);
          console.log(`24h Volume: $${(volume * price).toFixed(0)}`);
        }
        
        // Find funding rate
        let fundingRate = null;
        if (Array.isArray(fundingRates)) {
          const fr = fundingRates.find(f => f.symbol === symbol);
          if (fr) {
            fundingRate = parseFloat(fr.fundingRate || fr.fundingRate || 0);
            console.log(`Funding Rate: ${(fundingRate * 100).toFixed(4)}%`);
          }
        }
        
        analysisResults.push({
          symbol,
          price,
          fundingRate,
          hasData: true
        });
        
      } catch (e) {
        console.log(`Error analyzing ${symbol}: ${e.message}`);
        analysisResults.push({ symbol, hasData: false, error: e.message });
      }
      
      await sleep(200); // Rate limiting between symbols
    }
    
    // Step 6: Output summary and recommendations
    console.log('\n\n========================================');
    console.log('ANALYSIS SUMMARY');
    console.log('========================================\n');
    
    console.log('Pairs with data:');
    analysisResults.filter(r => r.hasData).forEach(r => {
      console.log(`  ${r.symbol}: $${r.price} | Funding: ${r.fundingRate ? (r.fundingRate * 100).toFixed(4) + '%' : 'N/A'}`);
    });
    
    console.log('\nPairs with errors:');
    analysisResults.filter(r => !r.hasData).forEach(r => {
      console.log(`  ${r.symbol}: ${r.error}`);
    });
    
    return analysisResults;
    
  } catch (error) {
    console.error('FATAL ERROR:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

// Run analysis
analyzeMarket().catch(console.error);