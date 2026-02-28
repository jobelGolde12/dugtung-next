const https = require('https');

// First get a token by logging in
const loginOptions = {
  hostname: 'dugtung-next.vercel.app',
  port: 443,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const loginData = JSON.stringify({
  full_name: 'Admin User',
  contact_number: '09111222333'
});

const loginReq = https.request(loginOptions, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Login Status:', res.statusCode);
    try {
      const parsed = JSON.parse(data);
      console.log('Login Response:', JSON.stringify(parsed, null, 2));
      if (parsed.access_token) {
        testMessagesApi(parsed.access_token);
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

loginReq.on('error', (e) => {
  console.error('Login Error:', e.message);
});

loginReq.write(loginData);
loginReq.end();

function testMessagesApi(token) {
  const options = {
    hostname: 'dugtung-next.vercel.app',
    port: 443,
    path: '/api/messages',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\nMessages API Status:', res.statusCode);
      try {
        const parsed = JSON.parse(data);
        console.log('Messages Response:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Messages API Error:', e.message);
  });

  req.end();
}
