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

// ==================== Auth & Role Check (BYPASSED FOR TESTING) ====================
function checkAuth() {
  console.log("Auth check bypassed for testing");
  return true; // Bypass auth for testing
}

// ==================== Job List Functions ====================
async function fetchJobs(filters = {}) {
  const jobListDiv = document.getElementById("job-list");
  if (!jobListDiv) return;
  
  jobListDiv.innerHTML = "<p>Loading jobs...</p>";

  try {
    const res = await fetch(`${API_BASE}/jobs`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch jobs");

    let jobs = data.jobs || data;
    console.log("Jobs fetched:", jobs);

    // Apply filters
    if (filters.jobTitle) {
      jobs = jobs.filter(job => (job.title || job.job_position).toLowerCase().includes(filters.jobTitle.toLowerCase()));
    }
    if (filters.company) {
      jobs = jobs.filter(job => (job.company || job.company_name).toLowerCase().includes(filters.company.toLowerCase()));
    }
    if (filters.location) {
      jobs = jobs.filter(job => job.location && job.location.toLowerCase().includes(filters.location.toLowerCase()));
    }
    if (filters.skills) {
      jobs = jobs.filter(job => {
        const jobSkills = (job.skills || job.skills_required || "").toLowerCase();
        return jobSkills.includes(filters.skills.toLowerCase());
      });
    }
    if (filters.salaryRange) {
      jobs = jobs.filter(job => {
        const salary = parseFloat(job.salary || job.monthly_salary || 0);
        if (filters.salaryRange === '0-30000') return salary < 30000;
        if (filters.salaryRange === '30000-50000') return salary >= 30000 && salary < 50000;
        if (filters.salaryRange === '50000-70000') return salary >= 50000 && salary < 70000;
        if (filters.salaryRange === '70000-100000') return salary >= 70000 && salary < 100000;
        if (filters.salaryRange === '100000+') return salary >= 100000;
        return true;
      });
    }
    if (filters.jobType) {
      jobs = jobs.filter(job => {
        const jobType = (job.job_type || job.type || "").toLowerCase();
        return jobType.includes(filters.jobType.toLowerCase());
      });
    }

    if (jobs.length === 0) {
      jobListDiv.innerHTML = "<p>No jobs found matching your criteria.</p>";
      return;
    }

    jobListDiv.innerHTML = jobs.map(job => `
      <div class="job-card">
        <h4>${escapeHTML(job.title || job.job_position)}</h4>
        <p><strong>Company:</strong> ${escapeHTML(job.company || job.company_name)}</p>
        <p><strong>Location:</strong> ${escapeHTML(job.location)}</p>
        <p><strong>Salary:</strong> $${job.salary || job.monthly_salary || "N/A"}</p>
        <p><strong>Skills:</strong> ${escapeHTML(job.skills || job.skills_required || "N/A")}</p>
        <p><strong>Type:</strong> ${escapeHTML(job.job_type || job.type || "N/A")}</p>
        <a href="job-details.html?id=${job.id}" class="btn">View Details</a>
      </div>
    `).join("");

    // Update active filters display
    updateActiveFilters(filters);

  } catch (err) {
    console.error("Error fetching jobs:", err);
    jobListDiv.innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

// ==================== Button Functions ====================
function setupLogout() {
  console.log("Logout function called");
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = "../Auth/login.html";
}

function applyFilters() {
  console.log("Apply Filters function called");
  const filters = {
    jobTitle: document.getElementById("jobTitle")?.value.trim() || "",
    company: document.getElementById("company")?.value.trim() || "",
    location: document.getElementById("location")?.value.trim() || "",
    skills: document.getElementById("skills")?.value.trim() || "",
    salaryRange: document.getElementById("salaryRange")?.value || "",
    jobType: document.getElementById("jobType")?.value || "",
  };
  console.log("Filters applied:", filters);
  fetchJobs(filters);
}

function clearFilters() {
  console.log("Clear Filters function called");
  const filterFields = ["jobTitle", "company", "location", "skills", "salaryRange", "jobType"];
  filterFields.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.value = "";
      console.log(`Cleared ${fieldId}`);
    }
  });
  
  // Clear active filters display
  const activeFiltersDiv = document.getElementById("activeFilters");
  if (activeFiltersDiv) {
    activeFiltersDiv.innerHTML = "";
    console.log("Cleared active filters display");
  }
  
  fetchJobs();
}

function saveFilters() {
  console.log("Save Filters function called");
  const filters = {
    jobTitle: document.getElementById("jobTitle")?.value.trim() || "",
    company: document.getElementById("company")?.value.trim() || "",
    location: document.getElementById("location")?.value.trim() || "",
    skills: document.getElementById("skills")?.value.trim() || "",
    salaryRange: document.getElementById("salaryRange")?.value || "",
    jobType: document.getElementById("jobType")?.value || "",
  };
  
  console.log("Saving filters:", filters);
  localStorage.setItem('jobFilters', JSON.stringify(filters));
  
  // Show confirmation
  const activeFiltersDiv = document.getElementById("activeFilters");
  if (activeFiltersDiv) {
    activeFiltersDiv.innerHTML = '<span style="color: #52d8c7;">✓ Filters saved!</span>';
    setTimeout(() => updateActiveFilters(filters), 2000);
    console.log("Filters saved and confirmation shown");
  }
}

function loadSavedFilters() {
  const savedFilters = localStorage.getItem('jobFilters');
  if (savedFilters) {
    const filters = JSON.parse(savedFilters);
    console.log("Loading saved filters:", filters);
    
    // Populate filter fields
    Object.keys(filters).forEach(key => {
      const element = document.getElementById(key);
      if (element && filters[key]) {
        element.value = filters[key];
        console.log(`Loaded ${key}: ${filters[key]}`);
      }
    });
    
    return filters;
  }
  return {};
}

function updateActiveFilters(filters) {
  const activeFiltersDiv = document.getElementById("activeFilters");
  if (!activeFiltersDiv) return;
  
  const activeFilters = [];
  if (filters.jobTitle) activeFilters.push(`Title: ${filters.jobTitle}`);
  if (filters.company) activeFilters.push(`Company: ${filters.company}`);
  if (filters.location) activeFilters.push(`Location: ${filters.location}`);
  if (filters.skills) activeFilters.push(`Skills: ${filters.skills}`);
  if (filters.salaryRange) {
    const salaryText = document.getElementById("salaryRange")?.options[document.getElementById("salaryRange")?.selectedIndex]?.text;
    activeFilters.push(`Salary: ${salaryText}`);
  }
  if (filters.jobType) {
    const typeText = document.getElementById("jobType")?.options[document.getElementById("jobType")?.selectedIndex]?.text;
    activeFilters.push(`Type: ${typeText}`);
  }
  
  if (activeFilters.length > 0) {
    activeFiltersDiv.innerHTML = `<strong>Active Filters:</strong> ${activeFilters.join(' | ')}`;
  } else {
    activeFiltersDiv.innerHTML = '';
  }
}

// ==================== Initialize Everything ====================
function initializeApp() {
  console.log("Initializing app...");
  
  // Check authentication first (bypassed for testing)
  if (!checkAuth()) {
    console.log("Auth check failed, stopping initialization");
    return;
  }

  console.log("Setting up event listeners...");

  // Setup logout buttons
  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    console.log("Found logout button");
    logoutBtn.addEventListener("click", setupLogout);
  } else {
    console.error("Logout button not found");
  }

  const logoutBtnSidebar = document.getElementById('logout-btn');
  if (logoutBtnSidebar) {
    console.log("Found logout-btn button");
    logoutBtnSidebar.addEventListener("click", setupLogout);
  } else {
    console.error("Logout-btn button not found");
  }

  // Setup filter buttons
  const applyFiltersBtn = document.getElementById("applyFilters");
  if (applyFiltersBtn) {
    console.log("Found applyFilters button");
    applyFiltersBtn.addEventListener("click", applyFilters);
  } else {
    console.error("ApplyFilters button not found");
  }

  const clearFiltersBtn = document.getElementById("clearFilters");
  if (clearFiltersBtn) {
    console.log("Found clearFilters button");
    clearFiltersBtn.addEventListener("click", clearFilters);
  } else {
    console.error("ClearFilters button not found");
  }

  const saveFiltersBtn = document.getElementById("saveFilters");
  if (saveFiltersBtn) {
    console.log("Found saveFilters button");
    saveFiltersBtn.addEventListener("click", saveFilters);
  } else {
    console.error("SaveFilters button not found");
  }

  console.log("Event listeners setup complete");

  // Load saved filters and fetch jobs
  const savedFilters = loadSavedFilters();
  fetchJobs(savedFilters);
}

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", initializeApp);