// Test the exact same fetchWithAuth function from the admin dashboard
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('No token found, trying to login...');
    // Login as admin first
    try {
      const loginResponse = await fetch(`http://localhost:5001/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@test.com',
          password: 'admin123'
        })
      });
      
      const loginData = await loginResponse.json();
      if (loginData.token) {
        localStorage.setItem('token', loginData.token);
        console.log('✅ Login successful, token stored');
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      return null;
    }
  }
  
  const finalOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    ...options
  };
  
  try {
    const response = await fetch(`http://localhost:5001/api${url}`, finalOptions);
    
    if (response.status === 401 || response.status === 403) {
      console.log('❌ Authentication failed');
      return null;
    }
    
    return response;
  } catch (error) {
    console.error('❌ Fetch error:', error);
    return null;
  }
}

// Test all dashboard endpoints
async function testDashboardEndpoints() {
  console.log('Testing admin dashboard endpoints...');
  
  const endpoints = [
    { path: '/admin/users/stats', element: '#totalUsersCard p' },
    { path: '/admin/jobs/stats', element: '#totalJobsCard p' },
    { path: '/admin/jobs/pending', element: '#pendingJobsCard p' },
    { path: '/admin/users/recent', element: '#recentRegistrationsCard p' },
    { path: '/admin/jobs/recent', element: '#recentJobs' },
    { path: '/admin/users/status', element: '#userStatus' },
    { path: '/admin/notifications', element: '#notifCount' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.path}...`);
      const response = await fetchWithAuth(endpoint.path);
      
      if (response) {
        const data = await response.json();
        console.log(`✅ ${endpoint.path}:`, data);
      } else {
        console.log(`❌ ${endpoint.path}: No response`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.path}:`, error.message);
    }
  }
}

// Run the test
testDashboardEndpoints();