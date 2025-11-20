const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');
const Job = require('../models/Job');

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// Apply for a job
const apply = async (req, res) => {
  try {
    const {
      jobId, fullName, email, phone, education, experience, skills,
      paymentMethod, paymentStatus
    } = req.body;

    const resumePath = req.file ? req.file.path : req.body.resume;
    const user_id = req.user.id;

    if (!jobId) return res.status(400).json({ error: 'jobId required' });

    const applicationData = {
      job_id: jobId,
      user_id,
      full_name: fullName,
      email,
      phone,
      education,
      experience,
      skills,
      resume_path: resumePath,
      payment_method: paymentMethod || 'unknown',
      payment_status: paymentStatus || 'pending',
      payment_amount: 100.00
    };

    const application = await Application.create(applicationData);
    res.json({
      applicationId: application.id,
      message: 'Application submitted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get applications for a specific job
const getForJob = async (req, res) => {
  try {
    const job_id = req.params.jobId;
    const apps = await Application.getApplicationsForJob(job_id);
    res.json(apps); // send array directly
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get current user's applications
const getMyApplications = async (req, res) => {
  try {
    const user_id = req.user.id;
    const apps = await Application.findAll({
      where: { user_id },
      include: [{ model: Job, attributes: ['title', 'company', 'location'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(apps); // send array directly
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  upload,
  apply,
  getForJob,
  getMyApplications
};