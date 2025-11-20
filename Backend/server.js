
// Backend/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.js");
const sequelize = require("./config/db.js");
const uploadRoutes = require("./routes/upload.js");
const Job = require("./models/Job.js");
const jobRoutes = require("./routes/jobs.js");
const recruiterRoutes = require("./routes/recruiter.js");
const applicationsRoutes = require("./routes/applications.js");
const path = require("path");




dotenv.config({ path: path.join(__dirname, '.env') });
const app = express();


app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));

// Serve static files
const frontendUIPath = path.resolve(__dirname, '../FrontendUI');
const frontendJsPath = path.resolve(__dirname, '../frontend_js');

console.log(`Serving FrontendUI from: ${frontendUIPath}`);
console.log(`Serving frontend_js from: ${frontendJsPath}`);

app.use('/frontend_js', express.static(frontendJsPath)); // Serve frontend_js specific route first
app.use('/FrontendUI', express.static(frontendUIPath));
app.use(express.static(frontendUIPath)); // Serve FrontendUI at root

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/apply-job", applicationsRoutes);

// Start server after syncing DB
const PORT = process.env.PORT || 5001;
(async () => {
  try {
    await sequelize.sync({ alter: true }); // ✅ Sync database and alter tables to match models
    console.log("✅ Database synced successfully.");
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌ Unable to start server:", err);
  }
})();
