// TypeScript demo script for telecom cart API
import * as http from 'http';

interface ApiResponse {
  [key: string]: any;
}

function makeRequest(method: string, path: string, data?: any): Promise<ApiResponse | string> {
  return new Promise((resolve, reject) => {
    const options: http.RequestOptions = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk: Buffer) => responseData += chunk.toString());
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          console.log(`${method} ${path}: ${res.statusCode}`, jsonData);
          resolve(jsonData);
        } catch (e) {
          console.log(`${method} ${path}: ${res.statusCode}`, responseData);
          resolve(responseData);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runDemo(): Promise<void> {
  console.log('🚀 Starting Telecom Cart Demo\n');

  try {
    // Get API info
    console.log('📋 API Info:');
    await makeRequest('GET', '/');
    
    // Get products
    console.log('\n📋 Available Products:');
    await makeRequest('GET', '/api/products');
    
    // Create cart first
    console.log('\n🛒 Creating Cart:');
    await makeRequest('POST', '/api/carts', { customerId: 'demo-customer' });
    
    // Get cart
    console.log('\n🛒 Initial Cart:');
    await makeRequest('GET', '/api/cart/cart_1');
    
    // Add prepaid plan
    console.log('\n➕ Adding Basic Plan (prepaid):');
    await makeRequest('POST', '/api/cart/cart_1/items', { productId: 'plan-basic', quantity: 1 });
    
    // Try to add postpaid device (should fail)
    console.log('\n❌ Trying to add Smartphone (postpaid) - should fail:');
    await makeRequest('POST', '/api/cart/cart_1/items', { productId: 'device-phone', quantity: 1 });
    
    // Clear cart
    console.log('\n🗑️ Clearing cart:');
    await makeRequest('DELETE', '/api/cart/cart_1');
    
    // Create new cart and add postpaid items
    console.log('\n🆕 Creating new cart:');
    await makeRequest('POST', '/api/carts', { customerId: 'demo-customer-2' });
    
    console.log('\n➕ Adding Unlimited Plan (postpaid):');
    await makeRequest('POST', '/api/cart/cart_2/items', { productId: 'plan-unlimited', quantity: 1 });
    
    console.log('\n➕ Adding Smartphone (postpaid) - should work:');
    const cart = await makeRequest('POST', '/api/cart/cart_2/items', { productId: 'device-phone', quantity: 1 }) as ApiResponse;
    
    if (cart && typeof cart === 'object' && 'total' in cart) {
      console.log(`\n✅ Demo completed successfully! Final total: $${cart.total}`);
    }
    
  } catch (error: any) {
    console.error('Demo failed:', error.message || error);
  }
}

runDemo();