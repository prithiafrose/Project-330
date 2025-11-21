document.addEventListener('DOMContentLoaded', () => {
  const jobListEl = document.getElementById('job-list');
  const jobTitleInput = document.getElementById('jobTitle');
  const locationInput = document.getElementById('location');

  let jobsData = [];

  // Fetch all jobs from backend
  async function fetchJobs() {
    try {
      const res = await fetch('http://localhost:5001/api/jobs/public'); // replace with your API URL
      if (!res.ok) throw new Error('Failed to fetch jobs');

      const data = await res.json();
      jobsData = Array.isArray(data) ? data : [];

      renderJobs(); // initial render
    } catch (err) {
      console.error("Error fetching jobs:", err);
      jobListEl.innerHTML = "<p>Error loading jobs</p>";
    }
  }

  // Render job cards filtered by Job Title + Location
  function renderJobs() {
    const filteredJobs = jobsData.filter(job => {
      const titleMatch = job.title.toLowerCase().includes(jobTitleInput.value.toLowerCase());
      const locationMatch = job.location.toLowerCase().includes(locationInput.value.toLowerCase());
      return titleMatch && locationMatch;
    });

    jobListEl.innerHTML = filteredJobs.length === 0
      ? "<p>No jobs found</p>"
      : filteredJobs.map(job => `
          <div class="job-card">
            <div>
              <h3>${job.title}</h3>
              <p>Company: ${job.company}</p>
              <p>Salary: ${job.salary || 'N/A'}</p>
              <p>Location: ${job.location || 'N/A'}</p>
              <p>Type: ${job.type || 'N/A'}</p>
            </div>
            <button onclick="viewJob(${job.id})">View Details</button>
          </div>
        `).join('');
  }

  // Navigate to job details page
  window.viewJob = function(id) {
    window.location.href = `/FrontendUI/admin/job-details.html?id=${id}`;
  };

  // Apply filters button
  document.getElementById('applyFilters').addEventListener('click', () => {
    renderJobs();
  });

  // Clear filters button
  document.getElementById('clearFilters').addEventListener('click', () => {
    jobTitleInput.value = '';
    locationInput.value = '';
    renderJobs();
  });

  // Initial fetch
  fetchJobs();
});