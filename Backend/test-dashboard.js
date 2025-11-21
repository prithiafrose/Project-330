const axios = require('axios');

async function testAdminDashboard() {
  const baseURL = 'http://localhost:5001/api';
  
  try {
    // Login as admin
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test all dashboard endpoints
    const endpoints = [
      { path: '/admin/users/stats', name: 'Users Stats' },
      { path: '/admin/jobs/stats', name: 'Jobs Stats' },
      { path: '/admin/jobs/pending', name: 'Pending Jobs' },
      { path: '/admin/users/recent', name: 'Recent Users' },
      { path: '/admin/jobs/recent', name: 'Recent Jobs' },
      { path: '/admin/users/status', name: 'User Status' },
      { path: '/admin/notifications', name: 'Notifications' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${baseURL}${endpoint.path}`, { headers });
        console.log(`✅ ${endpoint.name}:`, response.data);
      } catch (error) {
        console.log(`❌ ${endpoint.name}:`, error.response?.data || error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data || error.message);
  }
}

testAdminDashboard();