const axios = require('axios');

async function testAdminEndpoints() {
  const baseURL = 'http://localhost:5001/api';
  
  // First, let's try to login as admin or create an admin user
  try {
    // Try to login with a test admin account
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // Test dashboard endpoints
    const endpoints = [
      '/admin/users/stats',
      '/admin/jobs/stats', 
      '/admin/jobs/pending',
      '/admin/users/recent',
      '/admin/jobs/recent',
      '/admin/users/status',
      '/admin/notifications'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${baseURL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log(`✅ ${endpoint}:`, response.data);
      } catch (error) {
        console.log(`❌ ${endpoint}:`, error.response?.data || error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data || error.message);
    
    // Try to create an admin user
    try {
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      const registerResponse = await axios.post(`${baseURL}/auth/register`, {
        username: 'Admin',
        email: 'admin@test.com',
        mobile: '1234567890',
        password: 'admin123',
        role: 'admin'
      });
      
      console.log('✅ Admin user created:', registerResponse.data);
      console.log('Please run the test again to check endpoints');
      
    } catch (createError) {
      console.log('❌ Failed to create admin:', createError.response?.data || createError.message);
    }
  }
}

testAdminEndpoints().catch(console.error);