/**
 * AsterDEX Comprehensive Trade Analysis
 * Analyze all pairs for potential trades to grow $7.84 to $50
 */

const https = require('https');
const crypto = require('crypto');

const CONFIG = {
  baseUrl: 'fapi.asterdex.com',
  apiPrefix: '/fapi/v1',
  apiKey: '96b31336fd33c7c043e0521ea1a3bd49899182b25b328a32df4f8c9a2d2759d3',
  apiSecret: '27cc35cc0cd2f891711336b24e234b4ece23e91fecd78ebfe51f0520dbbdaf06',
};

// Capital constraints
const CAPITAL = {
  starting: 7.84,
  target: 50,
  minPosition: 5.0,
  buffer: 2.84,
};

function apiRequest(endpoint, params = {}) {
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
      method: 'GET',
      headers: { 'X-MBX-APIKEY': CONFIG.apiKey },
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 500)}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('=== AsterDEX HIGH-RISK Trade Analysis ===\n');
  console.log(`Objective: Grow $${CAPITAL.starting} → $${CAPITAL.target} (540% growth required)\n`);
  console.log('CRITICAL CONSTRAINTS:');
  console.log('  - NEVER ignore API errors');
  console.log('  - NEVER trade without verified stop-loss');
  console.log('  - NEVER chase high funding blindly\n');
  
  try {
    // 1. Get account balance
    console.log('1. ACCOUNT BALANCE');
    console.log('─'.repeat(50));
    const account = await apiRequest('account');
    const balance = parseFloat(account.availableBalance || account.totalWalletBalance);
    console.log(`Available Balance: $${balance.toFixed(2)} USDT`);
    console.log(`Total Wallet: $${parseFloat(account.totalWalletBalance).toFixed(2)} USDT`);
    console.log(`Unrealized PnL: $${parseFloat(account.totalUnrealizedProfit).toFixed(2)}`);
    
    // Check positions
    const positions = account.positions || [];
    const openPositions = positions.filter(p => parseFloat(p.positionAmt) !== 0);
    console.log(`Open Positions: ${openPositions.length}`);
    if (openPositions.length > 0) {
      openPositions.forEach(p => {
        console.log(`  - ${p.symbol}: ${p.positionAmt} @ ${p.entryPrice}`);
      });
    }
    console.log('');
    
    // 2. Get exchange info
    console.log('2. TRADING PAIRS');
    console.log('─'.repeat(50));
    const exchangeInfo = await apiRequest('exchangeInfo');
    const symbols = exchangeInfo.symbols || [];
    
    // Filter to USDT pairs
    const usdtPairs = symbols.filter(s => s.symbol && s.symbol.endsWith('USDT'));
    console.log(`Total USDT pairs: ${usdtPairs.length}`);
    
    // Get pair details for major coins
    const majorCoins = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'LINK', 'DOT', 'MATIC', 'LTC', 'ARB', 'OP', 'ATOM'];
    const majorPairs = usdtPairs.filter(s => majorCoins.some(c => s.symbol === c + 'USDT'));
    console.log(`Major pairs found: ${majorPairs.length}`);
    
    // Get min notional for each pair
    const pairInfo = {};
    majorPairs.forEach(s => {
      const filters = s.filters || [];
      const minNotional = filters.find(f => f.filterType === 'MIN_NOTIONAL');
      const lotSize = filters.find(f => f.filterType === 'LOT_SIZE');
      pairInfo[s.symbol] = {
        minNotional: minNotional ? parseFloat(minNotional.notional || minNotional.minNotional || 0) : 0,
        stepSize: lotSize ? parseFloat(lotSize.stepSize || 0) : 0,
        pricePrecision: s.pricePrecision || 8,
        quantityPrecision: s.quantityPrecision || 8,
      };
    });
    console.log('');
    
    // 3. Get funding rates
    console.log('3. FUNDING RATES');
    console.log('─'.repeat(50));
    const premiumIndex = await apiRequest('premiumIndex');
    
    // Process funding rates
    const fundingData = {};
    premiumIndex.forEach(p => {
      if (p.symbol && p.symbol.endsWith('USDT')) {
        fundingData[p.symbol] = {
          markPrice: parseFloat(p.markPrice || 0),
          indexPrice: parseFloat(p.indexPrice || 0),
          fundingRate: parseFloat(p.lastFundingRate || 0),
          nextFundingTime: new Date(parseInt(p.nextFundingTime)),
          interestRate: parseFloat(p.interestRate || 0),
        };
      }
    });
    
    // Show top funding rates (positive and negative)
    const sortedByFunding = Object.entries(fundingData)
      .filter(([sym]) => majorCoins.some(c => sym === c + 'USDT'))
      .sort((a, b) => b[1].fundingRate - a[1].fundingRate);
    
    console.log('\nMajor pairs sorted by funding rate:');
    console.log('Symbol          | Funding Rate | Mark Price  | Premium');
    console.log('─'.repeat(60));
    sortedByFunding.slice(0, 15).forEach(([sym, data]) => {
      const premium = data.markPrice > 0 ? ((data.markPrice - data.indexPrice) / data.indexPrice * 100) : 0;
      const fundingStr = (data.fundingRate * 100).toFixed(4);
      console.log(`${sym.padEnd(15)} | ${fundingStr.padStart(11)}% | $${data.markPrice.toFixed(6).padStart(10)} | ${premium >= 0 ? '+' : ''}${premium.toFixed(4)}%`);
    });
    console.log('');
    
    // 4. Get 24h ticker data
    console.log('4. 24H TICKER DATA');
    console.log('─'.repeat(50));
    const ticker24h = await apiRequest('ticker/24hr');
    
    const tickerData = {};
    ticker24h.forEach(t => {
      if (t.symbol && t.symbol.endsWith('USDT')) {
        tickerData[t.symbol] = {
          priceChange: parseFloat(t.priceChange || 0),
          priceChangePercent: parseFloat(t.priceChangePercent || 0),
          weightedAvgPrice: parseFloat(t.weightedAvgPrice || 0),
          prevClosePrice: parseFloat(t.prevClosePrice || 0),
          lastPrice: parseFloat(t.lastPrice || 0),
          lastQty: parseFloat(t.lastQty || 0),
          bidPrice: parseFloat(t.bidPrice || 0),
          bidQty: parseFloat(t.bidQty || 0),
          askPrice: parseFloat(t.askPrice || 0),
          askQty: parseFloat(t.askQty || 0),
          openPrice: parseFloat(t.openPrice || 0),
          highPrice: parseFloat(t.highPrice || 0),
          lowPrice: parseFloat(t.lowPrice || 0),
          volume: parseFloat(t.volume || 0),
          quoteVolume: parseFloat(t.quoteVolume || 0),
        };
      }
    });
    
    // Show major pair tickers
    const majorTickerData = Object.entries(tickerData)
      .filter(([sym]) => majorCoins.some(c => sym === c + 'USDT'))
      .sort((a, b) => b[1].quoteVolume - a[1].quoteVolume);
    
    console.log('\nMajor pairs by 24h volume:');
    console.log('Symbol          | Price       | 24h Change | 24h Volume');
    console.log('─'.repeat(60));
    majorTickerData.slice(0, 15).forEach(([sym, t]) => {
      const changeStr = t.priceChangePercent >= 0 ? `+${t.priceChangePercent.toFixed(2)}` : t.priceChangePercent.toFixed(2);
      const volStr = (t.quoteVolume / 1000000).toFixed(2);
      console.log(`${sym.padEnd(15)} | $${t.lastPrice.toFixed(4).padStart(10)} | ${changeStr.padStart(10)}% | $${volStr}M`);
    });
    console.log('');
    
    // 5. Analyze order books for top pairs
    console.log('5. ORDER BOOK DEPTH ANALYSIS');
    console.log('─'.repeat(50));
    
    const orderBookAnalysis = {};
    for (const [sym] of majorTickerData.slice(0, 10)) {
      try {
        await sleep(100);
        const depth = await apiRequest('depth', { symbol: sym, limit: 20 });
        
        if (depth.bids && depth.asks && depth.bids.length > 0 && depth.asks.length > 0) {
          const bestBid = parseFloat(depth.bids[0][0]);
          const bestAsk = parseFloat(depth.asks[0][0]);
          const spread = ((bestAsk - bestBid) / bestBid * 100);
          
          // Calculate depth within 1%
          const bidDepth = depth.bids
            .filter(b => parseFloat(b[0]) >= bestBid * 0.99)
            .reduce((sum, b) => sum + parseFloat(b[0]) * parseFloat(b[1]), 0);
          const askDepth = depth.asks
            .filter(a => parseFloat(a[0]) <= bestAsk * 1.01)
            .reduce((sum, a) => sum + parseFloat(a[0]) * parseFloat(a[1]), 0);
          
          orderBookAnalysis[sym] = {
            bestBid,
            bestAsk,
            spread: spread * 100,
            bidDepth1pct: bidDepth,
            askDepth1pct: askDepth,
            totalDepth: bidDepth + askDepth,
          };
        }
      } catch (e) {
        console.log(`  Error getting depth for ${sym}: ${e.message}`);
      }
    }
    
    console.log('\nOrder book spread (lower = better liquidity):');
    console.log('Symbol          | Spread    | Bid Depth  | Ask Depth  | Total');
    console.log('─'.repeat(70));
    Object.entries(orderBookAnalysis)
      .sort((a, b) => a[1].spread - b[1].spread)
      .forEach(([sym, ob]) => {
        console.log(`${sym.padEnd(15)} | ${ob.spread.toFixed(4).padStart(7)}% | $${ob.bidDepth1pct.toFixed(0).padStart(9)} | $${ob.askDepth1pct.toFixed(0).padStart(9)} | $${ob.totalDepth.toFixed(0)}`);
      });
    console.log('');
    
    // 6. Get klines for volatility
    console.log('6. VOLATILITY ANALYSIS (24h)');
    console.log('─'.repeat(50));
    
    const volatilityData = {};
    for (const [sym] of majorTickerData.slice(0, 12)) {
      try {
        await sleep(100);
        const klines = await apiRequest('klines', { symbol: sym, interval: '1h', limit: 24 });
        
        if (klines && klines.length >= 20) {
          const closes = klines.map(k => parseFloat(k[4]));
          const highs = klines.map(k => parseFloat(k[2]));
          const lows = klines.map(k => parseFloat(k[3]));
          
          const high24h = Math.max(...highs);
          const low24h = Math.min(...lows);
          const currentPrice = closes[closes.length - 1];
          const volatility = ((high24h - low24h) / low24h * 100);
          
          // Calculate average hourly movement
          let totalMove = 0;
          for (let i = 1; i < closes.length; i++) {
            totalMove += Math.abs(closes[i] - closes[i-1]) / closes[i-1];
          }
          const avgHourlyMove = (totalMove / (closes.length - 1)) * 100;
          
          // ATR-like calculation
          const ranges = klines.map(k => parseFloat(k[2]) - parseFloat(k[3]));
          const avgRange = ranges.reduce((a, b) => a + b, 0) / ranges.length;
          const atrPercent = (avgRange / currentPrice) * 100;
          
          volatilityData[sym] = {
            high24h,
            low24h,
            volatility,
            avgHourlyMove,
            atrPercent,
            currentPrice,
          };
        }
      } catch (e) {
        console.log(`  Error getting klines for ${sym}: ${e.message}`);
      }
    }
    
    console.log('\nVolatility sorted by ATR% (higher = more movement):');
    console.log('Symbol          | ATR%    | 24h Range | Avg Hourly | Current');
    console.log('─'.repeat(70));
    Object.entries(volatilityData)
      .sort((a, b) => b[1].atrPercent - a[1].atrPercent)
      .forEach(([sym, v]) => {
        console.log(`${sym.padEnd(15)} | ${v.atrPercent.toFixed(3).padStart(6)}% | ${v.volatility.toFixed(2).padStart(8)}% | ${v.avgHourlyMove.toFixed(3).padStart(9)}% | $${v.currentPrice.toFixed(v.currentPrice < 1 ? 6 : 2)}`);
      });
    console.log('');
    
    // 7. COMPREHENSIVE TRADE ANALYSIS
    console.log('\n' + '='.repeat(70));
    console.log('TRADE OPPORTUNITY ANALYSIS');
    console.log('='.repeat(70));
    
    // Combine all data for analysis
    const tradeCandidates = [];
    
    for (const coin of majorCoins) {
      const sym = coin + 'USDT';
      
      if (!fundingData[sym] || !tickerData[sym] || !volatilityData[sym]) continue;
      
      const fund = fundingData[sym];
      const tick = tickerData[sym];
      const vol = volatilityData[sym];
      const ob = orderBookAnalysis[sym];
      const info = pairInfo[sym];
      
      // Skip if insufficient volume
      if (tick.quoteVolume < 1000000) continue;
      
      // Calculate metrics
      const spreadOk = ob ? ob.spread < 0.1 : true; // Less than 0.1% spread
      const fundingAnnualized = fund.fundingRate * 3 * 365 * 100; // 3 settlements per day
      const fundingPositive = fund.fundingRate > 0;
      
      // For LONG positions: want positive funding (get paid)
      // For SHORT positions: want negative funding (get paid)
      
      // Calculate risk/reward
      const minNotional = info?.minNotional || 5;
      const price = tick.lastPrice;
      const stepSize = info?.stepSize || 0.001;
      const minQty = Math.ceil(minNotional / price / stepSize) * stepSize;
      
      // Liquidation math
      const maxLeverage = 20; // Most exchanges cap at 125x but let's be conservative
      
      tradeCandidates.push({
        symbol: sym,
        price,
        volume24h: tick.quoteVolume,
        volatility: vol.volatility,
        atrPercent: vol.atrPercent,
        fundingRate: fund.fundingRate,
        fundingAnnualized,
        spread: ob?.spread || null,
        totalDepth: ob?.totalDepth || null,
        priceChange24h: tick.priceChangePercent,
        minNotional,
        minQty,
        minNotionalOk: minNotional <= CAPITAL.minPosition,
      });
    }
    
    console.log('\n📊 ANALYSIS RESULTS\n');
    
    console.log('Capital Reality Check:');
    console.log(`  Starting Capital: $${balance.toFixed(2)}`);
    console.log(`  Target: $${CAPITAL.target}`);
    console.log(`  Required Growth: ${((CAPITAL.target / balance - 1) * 100).toFixed(0)}%`);
    console.log(`  Maximum Safe Position: $${Math.min(CAPITAL.minPosition, balance * 0.7).toFixed(2)}`);
    console.log(`  Reserve Buffer: $${(balance * 0.3).toFixed(2)}\n`);
    
    // Strategy 1: Funding Rate Arbitrage
    console.log('\n🎯 STRATEGY 1: Funding Rate Arbitrage');
    console.log('─'.repeat(50));
    const fundingArbCandidates = tradeCandidates
      .filter(c => Math.abs(c.fundingRate) > 0.0005) // > 0.05%
      .sort((a, b) => Math.abs(b.fundingRate) - Math.abs(a.fundingRate));
    
    if (fundingArbCandidates.length === 0) {
      console.log('❌ NO SUITABLE CANDIDATES');
      console.log('   Funding rates too low on major pairs for arbitrage.');
    } else {
      console.log('Candidates (sorted by funding rate magnitude):');
      fundingArbCandidates.slice(0, 5).forEach((c, i) => {
        const direction = c.fundingRate > 0 ? 'SHORT (pay funding)' : 'LONG (receive funding)';
        console.log(`\n${i + 1}. ${c.symbol}`);
        console.log(`   Funding Rate: ${(c.fundingRate * 100).toFixed(4)}% (${(c.fundingAnnualized).toFixed(1)}% annualized)`);
        console.log(`   Position: ${direction}`);
        console.log(`   24h Volume: $${(c.volume24h / 1e6).toFixed(2)}M`);
        console.log(`   Volatility: ${c.volatility.toFixed(2)}%`);
        console.log(`   ⚠️  Risk: Price movement can wipe out funding gains`);
      });
    }
    
    // Strategy 2: High Volatility Breakout
    console.log('\n\n🎯 STRATEGY 2: Breakout/Momentum Trading');
    console.log('─'.repeat(50));
    const breakoutCandidates = tradeCandidates
      .filter(c => c.volatility > 3 && c.spread !== null && c.spread < 0.1)
      .sort((a, b) => b.volatility - a.volatility);
    
    if (breakoutCandidates.length === 0) {
      console.log('❌ NO SUITABLE CANDIDATES');
    } else {
      console.log('Candidates (sorted by volatility):');
      breakoutCandidates.slice(0, 5).forEach((c, i) => {
        console.log(`\n${i + 1}. ${c.symbol}`);
        console.log(`   24h Volatility: ${c.volatility.toFixed(2)}%`);
        console.log(`   ATR: ${c.atrPercent.toFixed(3)}%`);
        console.log(`   24h Change: ${c.priceChange24h >= 0 ? '+' : ''}${c.priceChange24h.toFixed(2)}%`);
        console.log(`   Spread: ${c.spread?.toFixed(4) || 'N/A'}%`);
        console.log(`   24h Volume: $${(c.volume24h / 1e6).toFixed(2)}M`);
        console.log(`   ⚠️  Risk: Fakeouts, slippage, need tight stop-loss`);
      });
    }
    
    // Strategy 3: Mean Reversion
    console.log('\n\n🎯 STRATEGY 3: Mean Reversion');
    console.log('─'.repeat(50));
    const meanReversionCandidates = tradeCandidates
      .filter(c => Math.abs(c.priceChange24h) > 5 && c.volatility > 2)
      .sort((a, b) => Math.abs(b.priceChange24h) - Math.abs(a.priceChange24h));
    
    if (meanReversionCandidates.length === 0) {
      console.log('❌ NO SUITABLE CANDIDATES');
    } else {
      console.log('Candidates (sorted by price movement):');
      meanReversionCandidates.slice(0, 5).forEach((c, i) => {
        const direction = c.priceChange24h > 0 ? 'SHORT (bet on pullback)' : 'LONG (bet on bounce)';
        console.log(`\n${i + 1}. ${c.symbol}`);
        console.log(`   24h Move: ${c.priceChange24h >= 0 ? '+' : ''}${c.priceChange24h.toFixed(2)}%`);
        console.log(`   Position: ${direction}`);
        console.log(`   Volatility: ${c.volatility.toFixed(2)}%`);
        console.log(`   ⚠️  Risk: Trend continuation, catching falling knives`);
      });
    }
    
    // TOP 3 TRADE RECOMMENDATIONS
    console.log('\n\n' + '='.repeat(70));
    console.log('🏆 TOP 3 TRADE RECOMMENDATIONS');
    console.log('='.repeat(70));
    
    // Analyze each candidate more deeply
    const rankedTrades = [];
    
    for (const c of tradeCandidates) {
      // Skip if spread too wide
      if (c.spread !== null && c.spread > 0.15) continue;
      
      // Skip if volume too low
      if (c.volume24h < 1e6) continue;
      
      // Calculate risk score (lower is better)
      let riskScore = 0;
      
      // Spread risk
      if (c.spread !== null) riskScore += c.spread * 10;
      
      // Volatility risk
      riskScore += c.volatility * 0.5;
      
      // Funding opportunity (negative score = benefit)
      riskScore -= Math.abs(c.fundingRate) * 1000;
      
      // Volume bonus (lower risk)
      riskScore -= Math.log10(c.volume24h / 1e6) * 2;
      
      // Calculate potential return
      const atrMove = c.atrPercent;
      const conservativeTarget = atrMove * 0.5; // Target half of ATR
      const stopLoss = atrMove * 0.25; // Stop at quarter ATR
      
      // Risk/Reward ratio
      const rrRatio = conservativeTarget / stopLoss;
      
      rankedTrades.push({
        ...c,
        riskScore,
        potentialTarget: conservativeTarget,
        suggestedStop: stopLoss,
        rrRatio,
      });
    }
    
    // Sort by risk-adjusted opportunity
    rankedTrades.sort((a, b) => a.riskScore - b.riskScore);
    
    if (rankedTrades.length === 0) {
      console.log('\n❌ NO VIABLE TRADE OPPORTUNITIES FOUND');
      console.log('\nReasons:');
      console.log('  - Insufficient liquidity on major pairs');
      console.log('  - Spreads too wide');
      console.log('  - Low funding rates');
      console.log('\n💡 RECOMMENDATION: Wait for better conditions.');
      console.log('   Better to preserve $7.84 than lose it chasing bad trades.');
    } else {
      rankedTrades.slice(0, 3).forEach((trade, i) => {
        console.log(`\n${'─'.repeat(60)}`);
        console.log(`TRADE ${i + 1}: ${trade.symbol}`);
        console.log(`${'─'.repeat(60)}`);
        
        console.log('\n📈 MARKET CONDITIONS:');
        console.log(`   Price: $${trade.price.toFixed(trade.price < 1 ? 6 : 2)}`);
        console.log(`   24h Volume: $${(trade.volume24h / 1e6).toFixed(2)}M`);
        console.log(`   24h Volatility: ${trade.volatility.toFixed(2)}%`);
        console.log(`   Spread: ${trade.spread?.toFixed(4) || 'N/A'}%`);
        console.log(`   Funding Rate: ${(trade.fundingRate * 100).toFixed(4)}%`);
        
        // Position sizing
        const leverage = 5; // Conservative
        const positionSize = CAPITAL.minPosition;
        const positionValue = positionSize * leverage;
        const marginUsed = positionSize;
        const remainingBalance = balance - marginUsed;
        
        console.log('\n💰 POSITION SIZING:');
        console.log(`   Position Size: $${positionSize.toFixed(2)}`);
        console.log(`   Leverage: ${leverage}x`);
        console.log(`   Position Value: $${positionValue.toFixed(2)}`);
        console.log(`   Margin Used: $${marginUsed.toFixed(2)}`);
        console.log(`   Remaining Balance: $${remainingBalance.toFixed(2)} (buffer)`);
        
        // Entry/Stop/Target
        const atrInPrice = trade.price * (trade.atrPercent / 100);
        const stopDistance = atrInPrice * 0.5; // 0.5 ATR stop
        
        // Determine direction based on funding and momentum
        let direction, entry, stopLoss, target;
        if (trade.fundingRate < -0.0001 && trade.priceChange24h < -3) {
          // Negative funding + price drop = LONG (get paid funding + bounce)
          direction = 'LONG';
          entry = trade.price;
          stopLoss = trade.price - stopDistance;
          target = trade.price + atrInPrice;
        } else if (trade.fundingRate > 0.0001 && trade.priceChange24h > 3) {
          // Positive funding + price rise = SHORT (get paid funding + pullback)
          direction = 'SHORT';
          entry = trade.price;
          stopLoss = trade.price + stopDistance;
          target = trade.price - atrInPrice;
        } else if (trade.priceChange24h < -5) {
          // Strong downward move = LONG for bounce
          direction = 'LONG';
          entry = trade.price;
          stopLoss = trade.price - stopDistance;
          target = trade.price + atrInPrice * 0.5;
        } else if (trade.priceChange24h > 5) {
          // Strong upward move = SHORT for pullback
          direction = 'SHORT';
          entry = trade.price;
          stopLoss = trade.price + stopDistance;
          target = trade.price - atrInPrice * 0.5;
        } else {
          // Default: follow funding
          direction = trade.fundingRate > 0 ? 'SHORT' : 'LONG';
          entry = trade.price;
          if (direction === 'SHORT') {
            stopLoss = trade.price + stopDistance;
            target = trade.price - atrInPrice * 0.5;
          } else {
            stopLoss = trade.price - stopDistance;
            target = trade.price + atrInPrice * 0.5;
          }
        }
        
        const stopPercent = Math.abs(stopLoss - entry) / entry * 100;
        const targetPercent = Math.abs(target - entry) / entry * 100;
        const rrRatio = targetPercent / stopPercent;
        
        console.log('\n🎯 TRADE SETUP:');
        console.log(`   Direction: ${direction}`);
        console.log(`   Entry: $${entry.toFixed(entry < 1 ? 6 : 2)}`);
        console.log(`   Stop-Loss: $${stopLoss.toFixed(entry < 1 ? 6 : 2)} (${stopPercent.toFixed(2)}% risk)`);
        console.log(`   Take-Profit: $${target.toFixed(entry < 1 ? 6 : 2)} (${targetPercent.toFixed(2)}% profit)`);
        console.log(`   Risk/Reward: 1:${rrRatio.toFixed(2)}`);
        
        // Liquidation price
        const liquidationDistance = marginUsed / positionValue * 100 * leverage;
        const liqPrice = direction === 'LONG' 
          ? entry * (1 - liquidationDistance / 100 / leverage)
          : entry * (1 + liquidationDistance / 100 / leverage);
        
        console.log('\n⚠️  RISK ANALYSIS:');
        console.log(`   Liquidation Price: $${liqPrice.toFixed(entry < 1 ? 6 : 2)}`);
        console.log(`   Distance to Liquidation: ${((Math.abs(liqPrice - entry) / entry) * 100).toFixed(2)}%`);
        console.log(`   Max Loss (if stopped): $${(positionValue * stopPercent / 100).toFixed(2)}`);
        console.log(`   Max Gain (if target hit): $${(positionValue * targetPercent / 100).toFixed(2)}`);
        
        // Why this opportunity?
        console.log('\n🔍 WHY THIS TRADE?');
        if (Math.abs(trade.fundingRate) > 0.0005) {
          console.log(`   - Funding rate ${(trade.fundingRate > 0 ? 'positive' : 'negative')} at ${(trade.fundingRate * 100).toFixed(4)}%`);
        }
        if (trade.volatility > 3) {
          console.log(`   - High volatility (${trade.volatility.toFixed(2)}%) provides movement`);
        }
        if (trade.spread !== null && trade.spread < 0.05) {
          console.log(`   - Tight spread (${trade.spread.toFixed(4)}%) for good fills`);
        }
        if (trade.volume24h > 10e6) {
          console.log(`   - Strong volume ($${(trade.volume24h / 1e6).toFixed(0)}M) ensures liquidity`);
        }
        
        // Worst case scenarios
        console.log('\n💀 WORST CASE SCENARIOS:');
        console.log(`   1. Stop-loss hit: -$${(positionValue * stopPercent / 100).toFixed(2)} (position closed)`);
        console.log(`   2. Liquidation: -$${marginUsed.toFixed(2)} (entire margin lost)`);
        console.log(`   3. Slippage: Additional 0.1-0.5% on entry/exit`);
        console.log(`   4. Gap move: Stop-loss may not execute at exact price`);
        
        // Reality check
        const tradesNeeded = Math.log(CAPITAL.target / balance) / Math.log(1 + targetPercent / 100);
        console.log(`\n📊 REALITY CHECK:`);
        console.log(`   Trades needed to reach $${CAPITAL.target}: ~${Math.ceil(tradesNeeded)} (if all successful)`);
        console.log(`   Probability of ${Math.ceil(tradesNeeded)} consecutive wins: ~${(Math.pow(0.5, tradesNeeded) * 100).toFixed(4)}%`);
        console.log(`   ⚠️  This is GAMBLING, not trading.`);
      });
    }
    
    console.log('\n\n' + '='.repeat(70));
    console.log('⚠️  FINAL WARNING');
    console.log('='.repeat(70));
    console.log(`
The capital ($${balance.toFixed(2)}) is EXTREMELY small for futures trading.

PROBLEMS:
  1. Minimum position sizes often $5-10 → You can only take ONE position
  2. No room for averaging down or adjusting
  3. One bad trade wipes out significant portion
  4. Fees will eat 0.1-0.5% per trade

RECOMMENDATION:
  ⛔ DO NOT TRADE with $${balance.toFixed(2)}
  
  Why?
  - You need ~540% growth to hit $50
  - That requires 7+ consecutive successful 30% trades
  - Probability: ~0.78% (assuming 50% win rate)
  - More likely: lose the $${balance.toFixed(2)} trying
  
  Better options:
  1. Add more capital before trading
  2. Find alternative income sources
  3. Accept $${balance.toFixed(2)} is insufficient for futures

The analysis above is for EDUCATIONAL PURPOSES ONLY.
Real trading with $${balance.toFixed(2)} is NOT RECOMMENDED.
`);
    
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main();