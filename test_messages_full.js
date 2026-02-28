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
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseData) });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
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

async function test() {
  try {
    // Login as admin
    console.log('=== Logging in as admin ===');
    const loginResult = await makeRequest('/api/auth/login', 'POST', null, {
      full_name: 'Admin User',
      contact_number: '09111222333'
    });
    console.log('Login Status:', loginResult.status);
    console.log('Login Response:', JSON.stringify(loginResult.data, null, 2));
    
    if (!loginResult.data.success) {
      console.log('Login failed!');
      return;
    }
    
    const token = loginResult.data.data.access_token;
    
    // Get messages
    console.log('\n=== Getting Messages ===');
    const messagesResult = await makeRequest('/api/messages', 'GET', token);
    console.log('Messages Status:', messagesResult.status);
    console.log('Messages Response:', JSON.stringify(messagesResult.data, null, 2));
    
    // Send a test message
    console.log('\n=== Sending Test Message ===');
    const sendResult = await makeRequest('/api/messages', 'POST', token, {
      data: {
        subject: 'Test Message from Admin',
        content: 'This is a test message to verify the messages page is working correctly.',
        sender_id: parseInt(loginResult.data.data.user.id)
      }
    });
    console.log('Send Status:', sendResult.status);
    console.log('Send Response:', JSON.stringify(sendResult.data, null, 2));
    
    // Get messages again
    console.log('\n=== Getting Messages Again ===');
    const messagesResult2 = await makeRequest('/api/messages', 'GET', token);
    console.log('Messages Status:', messagesResult2.status);
    console.log('Messages Response:', JSON.stringify(messagesResult2.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
