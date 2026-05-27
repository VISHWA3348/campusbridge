import fetch from 'node-fetch';

async function runTests() {
  console.log("=========================================");
  console.log("RUNNING COLLEGE CREATION API FLOW TESTS");
  console.log("=========================================");
  
  try {
    // 1. Login as Super Admin
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
    console.log("✓ Logged in as Super Admin successfully.");

    // Generate unique codes for the run
    const timestamp = Date.now();
    const uniqueCode = "COL" + timestamp.toString().slice(-6);
    const uniqueEmail = `admin_${timestamp}@testcollege.edu`;

    const collegeDataTemplate = {
      name: "Transaction Test College",
      collegeCode: uniqueCode,
      institutionType: "Engineering",
      universityName: "Test Board",
      isAutonomous: true,
      establishmentYear: "2026",
      country: "India",
      state: "Tamil Nadu",
      city: "Chennai",
      address: "123 Transaction Road",
      pincode: "600025",
      officialEmail: `contact@${uniqueCode.toLowerCase()}.edu`,
      officialPhone: "9876543210",
      websiteUrl: `https://${uniqueCode.toLowerCase()}.edu`,
      departments: "CSE, ECE",
      totalDepartments: 2,
      studentCapacity: 300,
      placementCellAvailable: true,
      logo: "",
      logoPublicId: "",
      banner: "",
      bannerPublicId: "",
      status: "active",
      studentLimit: 1000,
      alumniLimit: 1000,
      adminName: "College Admin Name",
      adminEmail: uniqueEmail,
      adminMobile: "9876543210",
      adminPassword: "password123",
      departmentsData: [{ name: "Computer Science", code: "CSE" }, { name: "Electronics", code: "ECE" }],
      inviteCode: uniqueCode + "-INV",
      inviteCodeStatus: true
    };

    // --- TEST CASE 1: Successful creation with unique fields ---
    console.log("\n--- TEST 1: Unique College & Unique Admin Email ---");
    const res1 = await fetch("http://localhost:5000/api/admin/colleges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(collegeDataTemplate)
    });
    console.log("Status Code:", res1.status);
    const body1 = await res1.json();
    console.log("Response Payload:", JSON.stringify(body1, null, 2));

    if (res1.ok && body1.college) {
      console.log("✓ Test 1 Passed: College created successfully!");
    } else {
      console.log("❌ Test 1 Failed!");
    }

    // --- TEST CASE 2: Duplicate College Code check ---
    console.log("\n--- TEST 2: Duplicate College Code (using same code) ---");
    const duplicateCodeData = {
      ...collegeDataTemplate,
      adminEmail: `another_${timestamp}@testcollege.edu` // unique email, but duplicate code
    };
    const res2 = await fetch("http://localhost:5000/api/admin/colleges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(duplicateCodeData)
    });
    console.log("Status Code:", res2.status);
    const body2 = await res2.json();
    console.log("Response Payload:", JSON.stringify(body2, null, 2));

    if (res2.status === 400 && body2.error === "College code already exists") {
      console.log("✓ Test 2 Passed: Correctly blocked duplicate college code!");
    } else {
      console.log("❌ Test 2 Failed!");
    }

    // --- TEST CASE 3: Duplicate Admin Email check ---
    console.log("\n--- TEST 3: Duplicate Admin Email (using same email) ---");
    const duplicateEmailData = {
      ...collegeDataTemplate,
      collegeCode: "NEW" + timestamp.toString().slice(-6) // unique code, but duplicate admin email
    };
    const res3 = await fetch("http://localhost:5000/api/admin/colleges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(duplicateEmailData)
    });
    console.log("Status Code:", res3.status);
    const body3 = await res3.json();
    console.log("Response Payload:", JSON.stringify(body3, null, 2));

    if (res3.status === 400 && body3.error === "Administrator email already exists") {
      console.log("✓ Test 3 Passed: Correctly blocked duplicate admin email!");
    } else {
      console.log("❌ Test 3 Failed!");
    }

    // --- TEST CASE 4: Transaction atomicity check (mid-way failure rollback) ---
    console.log("\n--- TEST 4: Transaction Atomicity & Rollback Verification ---");
    // We will pass an empty adminEmail which should cause user creation to fail.
    // We want to verify that no college gets created (i.e. we check if college code exists after failure).
    const failureCode = "ERR" + timestamp.toString().slice(-6);
    const failureData = {
      ...collegeDataTemplate,
      collegeCode: failureCode,
      adminEmail: "" // empty admin email -> will throw validation error or DB constraint issue
    };
    
    const res4 = await fetch("http://localhost:5000/api/admin/colleges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(failureData)
    });
    console.log("Status Code (Expected 400 or 500):", res4.status);
    const body4 = await res4.json();
    console.log("Response Payload:", JSON.stringify(body4, null, 2));

    // Now query the DB / college list to verify that the college was NOT created at all!
    const verifyRes = await fetch("http://localhost:5000/api/admin/colleges", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const colleges = await verifyRes.json();
    const foundCollege = colleges.find(c => c.collegeCode === failureCode);

    if (foundCollege) {
      console.log("❌ Test 4 Failed: Dangling college record created! Rollback failed!");
    } else {
      console.log("✓ Test 4 Passed: Transaction successfully rolled back entirely, no dangling college created!");
    }

  } catch (error) {
    console.error("Test execution threw error:", error);
  }
}

runTests();
