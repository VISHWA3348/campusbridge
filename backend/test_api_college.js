import fetch from 'node-fetch';

async function runTest() {
  console.log("Starting API college creation test...");
  try {
    // 1. Login
    const loginRes = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "superadmin@test.com", password: "123456" })
    });
    
    if (!loginRes.ok) {
      console.error("Login failed:", await loginRes.text());
      return;
    }
    
    const { token } = await loginRes.json();
    console.log("Logged in successfully, token retrieved.");

    // 2. Create College
    const collegeData = {
      name: "API Test College",
      collegeCode: "APICOL",
      institutionType: "Engineering",
      universityName: "API Board",
      isAutonomous: true,
      establishmentYear: "2021",
      country: "India",
      state: "Karnataka",
      city: "Bangalore",
      address: "456 API Ave",
      pincode: "560001",
      officialEmail: "admin@apicol.edu",
      officialPhone: "9876543210",
      websiteUrl: "https://apicol.edu",
      departments: "CSE, ECE",
      totalDepartments: 2,
      studentCapacity: 240,
      placementCellAvailable: true,
      logo: "",
      logoPublicId: "",
      banner: "",
      bannerPublicId: "",
      status: "active",
      studentLimit: 1000,
      alumniLimit: 1000,
      adminName: "API College Admin",
      adminEmail: "admin@apicol.edu",
      adminMobile: "9876543210",
      adminPassword: "password123",
      departmentsData: [{ name: "Computer Science", code: "CSE" }, { name: "Electronics", code: "ECE" }],
      inviteCode: "API-INV",
      inviteCodeStatus: true
    };

    const createRes = await fetch("http://localhost:5000/api/admin/colleges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(collegeData)
    });

    console.log("Create College API Status:", createRes.status);
    const result = await createRes.json();
    console.log("Create College API Result:", JSON.stringify(result, null, 2));

  } catch (error) {
    console.error("API test failed:", error);
  }
}

runTest();
