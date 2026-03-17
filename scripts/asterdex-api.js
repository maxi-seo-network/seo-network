/**
 * AsterDEX Live API Client
 * Configuration and connection module for trading bots
 */

const crypto = require('crypto');
const https = require('https');

// API Configuration - LIVE CONNECTION CONFIRMED
const CONFIG = {
  baseUrl: 'fapi.asterdex.com',
  apiPrefix: '/fapi/v1',
  apiKey: '96b31336fd33c7c043e0521ea1a3bd49899182b25b328a32df4f8c9a2d2759d3',
  apiSecret: '27cc35cc0cd2f891711336b24e234b4ece23e91fecd78ebfe51f0520dbbdaf06',
  
  // Account confirmed working
  accountAlias: 'FzuXSgfWAuTiXqsR',
  availableBalance: 23.85376725, // USDT
  
  // Rate limiting
  requestTimeout: 10000,
  maxRequestsPerSecond: 50,
};

/**
 * Make authenticated API request to AsterDEX
 */
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
    req.setTimeout(CONFIG.requestTimeout, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

/**
 * Get current funding rates for all symbols
 */
async function getFundingRates() {
  return apiRequest('fundingRate');
}

/**
 * Get ticker price for a symbol
 */
async function getTickerPrice(symbol) {
  return apiRequest('ticker/price', { symbol });
}

/**
 * Get order book depth
 */
async function getOrderBook(symbol, limit = 100) {
  return apiRequest('depth', { symbol, limit });
}

/**
 * Get klines/candlestick data
 */
async function getKlines(symbol, interval = '1h', limit = 100) {
  return apiRequest('klines', { symbol, interval, limit });
}

/**
 * Get account balance
 */
async function getBalance() {
  return apiRequest('../v2/balance');
}

/**
 * Get account positions
 */
async function getPositions() {
  return apiRequest('account');
}

/**
 * Get exchange info (all trading pairs)
 */
async function getExchangeInfo() {
  return apiRequest('exchangeInfo');
}

/**
 * Place a new order
 */
async function placeOrder(symbol, side, type, quantity, price = null) {
  const params = {
    symbol,
    side, // BUY or SELL
    type, // MARKET, LIMIT, etc.
    quantity,
  };
  
  if (price && type === 'LIMIT') {
    params.price = price;
    params.timeInForce = 'GTC'; // Good Till Cancel
  }
  
  return apiRequest('order', params, 'POST');
}

/**
 * Cancel an order
 */
async function cancelOrder(symbol, orderId) {
  return apiRequest('order', { symbol, orderId }, 'DELETE');
}

/**
 * Get open orders
 */
async function getOpenOrders(symbol = null) {
  const params = symbol ? { symbol } : {};
  return apiRequest('openOrders', params);
}

/**
 * Get order history
 */
async function getOrderHistory(symbol = null, limit = 100) {
  const params = { limit };
  if (symbol) params.symbol = symbol;
  return apiRequest('allOrders', params);
}

/**
 * Change leverage for a symbol
 */
async function changeLeverage(symbol, leverage) {
  return apiRequest('leverage', { symbol, leverage }, 'POST');
}

/**
 * Change margin type (ISOLATED or CROSSED)
 */
async function changeMarginType(symbol, marginType) {
  return apiRequest('marginType', { symbol, marginType }, 'POST');
}

module.exports = {
  CONFIG,
  apiRequest,
  getFundingRates,
  getTickerPrice,
  getOrderBook,
  getKlines,
  getBalance,
  getPositions,
  getExchangeInfo,
  placeOrder,
  cancelOrder,
  getOpenOrders,
  getOrderHistory,
  changeLeverage,
  changeMarginType,
};