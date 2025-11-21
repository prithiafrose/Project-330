//const sequelize = require("./config/db");
//const User = require("./models/User");

async function testStudentBackend() {
  try {
    console.log("Testing student backend...");

    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Test user model
    const testUser = await User.findOne({ where: { role: 'student' } });
    if (testUser) {
      console.log("✅ Found student user:", testUser.username);
    } else {
      console.log("ℹ️ No student users found");
    }

    // Test creating a student user
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash("test123", 10);

    const newStudent = await User.create({
      username: "teststudent",
      email: "test@student.com",
      mobile: "01234567890",
      password: hashedPassword,
      role: "student",
      full_name: "Test Student",
      skills: "JavaScript, React, Node.js",
      education: "BSc Computer Science",
      experience: 2
    });

    console.log("✅ Created test student:", newStudent.username);

    // Test JWT token generation
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { id: newStudent.id, username: newStudent.username, role: newStudent.role },
      process.env.JWT_SECRET || "change_this",
      { expiresIn: "1h" }
    );

    console.log("✅ Generated JWT token");

    // Test student profile retrieval
    const studentProfile = await User.findByPk(newStudent.id, {
      attributes: ["id", "username", "email", "mobile", "role", "full_name", "skills", "education", "experience", "createdAt"]
    });

    console.log("✅ Student profile retrieved:", studentProfile.username);

    console.log("✅ All student backend tests passed!");

  } catch (error) {
    console.error("❌ Student backend test failed:", error.message);
  } finally {
    await sequelize.close();
  }
}

testStudentBackend();