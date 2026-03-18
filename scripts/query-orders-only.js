/**
 * Query AsterDEX open orders only
 */

const { getOpenOrders } = require('./asterdex-api.js');

async function main() {
  try {
    const orders = await getOpenOrders();
    console.log('Open orders:', JSON.stringify(orders, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();