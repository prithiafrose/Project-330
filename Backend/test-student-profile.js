//const axios = require('axios');

// Test configuration
//const BASE_URL = 'http://localhost:5000';

Test student login first to get token
//async function testStudentProfile() {
  try {
    console.log('🔐 Testing student login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'student@test.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');

    // Test GET student profile
    console.log('\n📖 Testing GET student profile...');
    const profileResponse = await axios.get(`${BASE_URL}/api/student/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ GET Profile Response:', JSON.stringify(profileResponse.data, null, 2));

    // Test PUT student profile update
    console.log('\n✏️ Testing PUT student profile update...');
    const updateData = {
      full_name: 'John Doe Updated',
      skills: 'JavaScript, React, Node.js',
      education: 'Bachelor of Computer Science',
      experience: 2
    };

    const updateResponse = await axios.put(`${BASE_URL}/api/student/profile`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ PUT Profile Response:', JSON.stringify(updateResponse.data, null, 2));

    // Verify the update by getting profile again
    console.log('\n🔍 Verifying profile update...');
    const verifyResponse = await axios.get(`${BASE_URL}/api/student/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Updated Profile:', JSON.stringify(verifyResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testStudentProfile();