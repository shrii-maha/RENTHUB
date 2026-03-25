const http = require('http');

const postData = JSON.stringify({
  email: 'admin@renthub.com',
  password: 'admin123'
});

const loginOptions = {
  hostname: 'localhost', port: 5000, path: '/api/auth/admin-login', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': postData.length }
};

const loginReq = http.request(loginOptions, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log(`Login Status: ${res.statusCode}`);
    const data = JSON.parse(body);
    if (!data.token) { console.error('Login failed'); process.exit(1); }
    
    console.log('Got token, fetching stats...');
    const statsOptions = {
      hostname: 'localhost', port: 5000, path: '/api/admin/stats', method: 'GET',
      headers: { 'Authorization': `Bearer ${data.token}` }
    };
    
    http.get(statsOptions, (sRes) => {
      console.log(`Stats Status: ${sRes.statusCode}`);
      let sBody = '';
      sRes.on('data', d => sBody += d);
      sRes.on('end', () => {
        console.log('Stats Response:', sBody);
        process.exit(0);
      });
    }).on('error', e => { console.error('Stats Error:', e.message); process.exit(1); });
  });
});

loginReq.on('error', e => { console.error('Login Error:', e.message); process.exit(1); });
loginReq.write(postData);
loginReq.end();

setTimeout(() => { console.log('Final Timeout reached'); process.exit(1); }, 10000);
