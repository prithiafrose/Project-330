const express = require("express");
const router = express.Router();
const { getStudentProfile, updateStudentProfile } = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");

// Get student profile
router.get("/profile", authMiddleware, getStudentProfile);

// Update student profile
router.put("/profile", authMiddleware, updateStudentProfile);

// Update student password only
router.put("/profile/password", authMiddleware, updateStudentProfile);

module.exports = router;