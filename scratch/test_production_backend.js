const testProductionLogin = async () => {
  const url = 'https://campusbridge-e4cv.onrender.com/api/auth/login';
  console.log('Sending live authentication request to:', url);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'zinointech@gmail.com',
        password: 'Vishwa@8105'
      })
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('--- JSON Response Received ---');
      console.log(JSON.stringify(data, null, 2));
      
      if (response.ok && data.token && data.user) {
        console.log('\nSUCCESS: Login successful! Token and user data received correctly.');
      } else {
        console.error('\nFAILURE: Login request completed but failed to authenticate.', data);
      }
    } else {
      const text = await response.text();
      console.error('\nFAILURE: Received non-JSON response from backend:', text.substring(0, 500));
    }
  } catch (error) {
    console.error('\nERROR: Failed to fetch from production backend:', error.message);
  }
};

testProductionLogin();
