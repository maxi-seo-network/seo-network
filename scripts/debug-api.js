/**
 * Debug API endpoints
 */

const https = require('https');
const crypto = require('crypto');

const CONFIG = {
  baseUrl: 'fapi.asterdex.com',
  apiPrefix: '/fapi/v1',
  apiKey: '96b31336fd33c7c043e0521ea1a3bd49899182b25b328a32df4f8c9a2d2759d3',
  apiSecret: '27cc35cc0cd2f891711336b24e234b4ece23e91fecd78ebfe51f0520dbbdaf06',
};

function rawRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: CONFIG.baseUrl,
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': CONFIG.apiKey,
      },
    };
    
    console.log(`Requesting: https://${CONFIG.baseUrl}${path}`);
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);
        console.log(`\nResponse (first 1000 chars):\n${data.substring(0, 1000)}`);
        resolve(data);
      });
    });
    
    req.on('error', (e) => {
      console.error('Error:', e.message);
      reject(e);
    });
    
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
}

async function testEndpoints() {
  // Test various endpoints
  const endpoints = [
    '/fapi/v1/exchangeInfo',
    '/fapi/v1/ping',
    '/fapi/v1/time',
    '/api/v1/ping',
    '/api/v1/time',
    '/api/v3/exchangeInfo',
    '/',
    '/fapi/v1/premiumIndex',
  ];
  
  for (const endpoint of endpoints) {
    console.log('\n' + '='.repeat(60));
    try {
      await rawRequest(endpoint);
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 500));
  }
}

// Test authenticated endpoint
async function testAuth() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing authenticated endpoint...\n');
  
  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const signature = crypto
    .createHmac('sha256', CONFIG.apiSecret)
    .update(queryString)
    .digest('hex');
  
  const path = `/fapi/v1/account?${queryString}&signature=${signature}`;
  
  try {
    await rawRequest(path);
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

testEndpoints().then(testAuth);