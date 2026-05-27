async function runDiagnostics() {
  const API = 'http://localhost:5000/api';
  console.log('--- LOCAL DIAGNOSTIC START ---');
  
  try {
    console.log('[1] Logging in as super admin...');
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@test.com', password: '123456' })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('    Login Status:', loginRes.status);
    
    if (token) {
      console.log('[2] Fetching profile...');
      const profileRes = await fetch(`${API}/profile/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('    Profile Status:', profileRes.status);
      const profileBody = await profileRes.json();
      console.log('    Profile Body keys:', Object.keys(profileBody));

      console.log('[3] Updating profile...');
      const updateRes = await fetch(`${API}/profile/me`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: 'Super Admin Test Name', bio: 'Updated bio from API test' })
      });
      console.log('    Update Status:', updateRes.status);
      const updateBody = await updateRes.json();
      console.log('    Update Body:', updateBody);

      console.log('[4] Fetching notification settings...');
      const notifGetRes = await fetch(`${API}/notifications/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('    Notif Get Status:', notifGetRes.status);
      const notifGetBody = await notifGetRes.json();
      console.log('    Notif Get Body:', notifGetBody);

      console.log('[5] Saving notification settings...');
      const notifSaveRes = await fetch(`${API}/notifications/settings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          emailEnabled: true,
          pushEnabled: false,
          webinarAlerts: true,
          jobAlerts: true,
          referralAlerts: false,
          chatAlerts: true
        })
      });
      console.log('    Notif Save Status:', notifSaveRes.status);
      const notifSaveBody = await notifSaveRes.json();
      console.log('    Notif Save Body:', notifSaveBody);

      console.log('[6] Getting features...');
      const featuresRes = await fetch(`${API}/admin/features`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('    Features Status:', featuresRes.status);
      const featuresBody = await featuresRes.json();
      console.log('    Features:', featuresBody);

    } else {
      console.error('No token received');
    }
  } catch (err) {
    console.error('Request failed:', err.message);
  }

  console.log('--- LOCAL DIAGNOSTIC END ---');
}

runDiagnostics();
