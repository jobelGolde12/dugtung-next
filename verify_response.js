const https = require('https');

function makeRequest(path, method, token, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'dugtung-next.vercel.app',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseData) });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  const loginResult = await makeRequest('/api/auth/login', 'POST', null, {
    full_name: 'Admin User',
    contact_number: '09111222333'
  });
  
  const token = loginResult.data.data.access_token;
  
  // Get messages
  const messagesResult = await makeRequest('/api/messages', 'GET', token);
  console.log('Full Response:', JSON.stringify(messagesResult.data, null, 2));
  
  // Check what keys are available
  if (messagesResult.data.success && messagesResult.data.data) {
    console.log('\nKeys in data.data:', Object.keys(messagesResult.data.data));
    console.log('Has items:', 'items' in messagesResult.data.data);
    console.log('Has messages:', 'messages' in messagesResult.data.data);
  }
}

test();
