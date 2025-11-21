// Test script to verify auth endpoints

//const API_BASE = 'http://localhost:5001/api/auth';

async function testAuth() {
  try {
    // Test registration
    console.log('Testing registration...');
    const registerResponse = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        mobile: '01234567890',
        password: 'password123',
        role: 'student'
      })
    });

    const registerData = await registerResponse.json();
    console.log('Registration response:', registerData);

    if (registerResponse.ok) {
      // Test login
      console.log('\nTesting login...');
      const loginResponse = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          role: 'student'
        })
      });

      const loginData = await loginResponse.json();
      console.log('Login response:', loginData);
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testAuth();