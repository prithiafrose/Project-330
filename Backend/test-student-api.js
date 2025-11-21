//const express = require("express");
//const cors = require("cors");
//const request = require("supertest");
const app = express();

app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));

// Import routes
const studentRoutes = require("./routes/student");
app.use("/api/student", studentRoutes);

// Test student endpoints
async function testStudentAPI() {
  try {
    console.log("Testing Student API endpoints...");

    // Test without authentication
    const response1 = await request(app)
      .get("/api/student/profile")
      .expect(401);
    console.log("✅ Protected endpoint requires authentication");

    // Create test user and get token
    const User = require("./models/User");
    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");

    const hashedPassword = await bcrypt.hash("test123", 10);
    const testStudent = await User.create({
      username: "apitest",
      email: "api@test.com",
      mobile: "01987654321",
      password: hashedPassword,
      role: "student",
      full_name: "API Test Student"
    });

    const token = jwt.sign(
      { id: testStudent.id, username: testStudent.username, role: testStudent.role },
      process.env.JWT_SECRET || "change_this",
      { expiresIn: "1h" }
    );

    // Test with authentication
    const response2 = await request(app)
      .get("/api/student/profile")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    console.log("✅ GET /api/student/profile works");
    console.log("Profile data:", response2.body.user.username);

    // Test profile update
    const response3 = await request(app)
      .put("/api/student/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        full_name: "Updated Name",
        skills: "JavaScript, React, Node.js, Python"
      })
      .expect(200);

    console.log("✅ PUT /api/student/profile works");
    console.log("Update message:", response3.body.message);

    console.log("✅ All Student API tests passed!");

  } catch (error) {
    console.error("❌ Student API test failed:", error.message);
  }
}

// Start database connection and run tests
const sequelize = require("./config/db");
sequelize.authenticate().then(() => {
  testStudentAPI();
}).catch(err => {
  console.error("Database connection failed:", err);
});