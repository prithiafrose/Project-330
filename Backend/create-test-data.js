//const sequelize = require('./config/db');
//const Job = require('./models/Job');
const User = require('./models/User');

async function createTestData() {
  try {
    await sequelize.sync();

    // Create a test admin user if not exists
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);

    const [admin, created] = await User.findOrCreate({
      where: { email: 'admin@test.com' },
      defaults: {
        username: 'admin',
        email: 'admin@test.com',
        mobile: '1234567890',
        password: adminPassword,
        role: 'admin'
      }
    });

    if (created) {
      console.log('Admin user created');
    }

    // Create test jobs
    const testJobs = [
      {
        title: 'Frontend Developer',
        company: 'TechCorp',
        location: 'New York',
        type: 'Full-time',
        salary: '$80,000 - $120,000',
        description: 'We are looking for a skilled frontend developer...',
        status: 'pending',
        posted_by: admin.id
      },
      {
        title: 'Backend Developer',
        company: 'DevSolutions',
        location: 'San Francisco',
        type: 'Full-time',
        salary: '$90,000 - $130,000',
        description: 'Looking for an experienced backend developer...',
        status: 'active',
        posted_by: admin.id
      },
      {
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        location: 'Remote',
        type: 'Contract',
        salary: '$70,000 - $100,000',
        description: 'Join our team as a full stack developer...',
        status: 'pending',
        posted_by: admin.id
      }
    ];

    for (const jobData of testJobs) {
      const [job, jobCreated] = await Job.findOrCreate({
        where: { title: jobData.title, company: jobData.company },
        defaults: jobData
      });

      if (jobCreated) {
        console.log(`Created job: ${job.title}`);
      }
    }

    console.log('Test data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  }
}

createTestData();