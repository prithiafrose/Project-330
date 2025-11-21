// ==================== Backend Base URL ====================
const API_BASE = "http://localhost:5001/api";

// ==================== Utility ====================
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { 'Authorization': `Bearer ${token}` };
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

// ==================== Auth & Role Check ====================
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token) {
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `../Auth/login.html?redirect=${returnUrl}`;
    return;
  }

  if (!user || user.role !== 'student') {
    alert("Access denied. Students only.");
    window.location.href = "../index.html";
    return;
  }

  // Update login link to Logout
  const authLink = document.getElementById('auth-link');
  if (authLink) {
    authLink.textContent = "Logout";
    authLink.href = "#";
    authLink.addEventListener("click", () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = "../Auth/login.html";
    });
  }

  // ==================== Job List ====================
  const jobListDiv = document.getElementById("job-list");
  const applyFilters = document.getElementById("applyFilters");
  const clearFilters = document.getElementById("clearFilters");

  async function fetchJobs(filters = {}) {
    if (!jobListDiv) return;
    jobListDiv.innerHTML = "<p>Loading jobs...</p>";

    try {
      const res = await fetch(`${API_BASE}/jobs/public`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch jobs");

      let jobs = data.jobs || data;

      // Apply filters
      if (filters.jobTitle) {
        jobs = jobs.filter(job => (job.title || job.job_position).toLowerCase().includes(filters.jobTitle.toLowerCase()));
      }
      if (filters.location) {
        jobs = jobs.filter(job => job.location.toLowerCase().includes(filters.location.toLowerCase()));
      }
     

      if (jobs.length === 0) {
        jobListDiv.innerHTML = "<p>No jobs found.</p>";
        return;
      }

      jobListDiv.innerHTML = jobs.map(job => `
        <div class="job-card">
          <h4>${escapeHTML(job.title || job.job_position)}</h4>
          <p><strong>Company:</strong> ${escapeHTML(job.company || job.company_name)}</p>
          <p><strong>Location:</strong> ${escapeHTML(job.location)}</p>
          <p><strong>Salary:</strong> $${job.salary || job.monthly_salary}</p>
          <p><strong>Skills:</strong> ${escapeHTML(job.skills || job.skills_required || "N/A")}</p>
          <a href="job-details.html?id=${job.id}">View Details</a>
        </div>
      `).join("");

    } catch (err) {
      jobListDiv.innerHTML = `<p style="color:red">${err.message}</p>`;
    }
  }

  // Filter buttons
  applyFilters.addEventListener("click", () => {
    const filters = {
      jobTitle: document.getElementById("jobTitle").value.trim(),
      location: document.getElementById("location").value.trim(),
     
    };
    fetchJobs(filters);
  });

  clearFilters.addEventListener("click", () => {
    document.getElementById("jobTitle").value = "";
    document.getElementById("location").value = "";
   
    fetchJobs();
  });

  // Initial load
  fetchJobs();
});
