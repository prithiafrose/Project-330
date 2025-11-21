const API_BASE = "http://localhost:5001/api";

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { 'Authorization': `Bearer ${token}` };
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user || user.role !== 'student') {
    window.location.href = "../Auth/login.html";
    return;
  }

  const totalJobsCard = document.querySelector('.card:nth-of-type(1) p');
  const appliedJobsCard = document.querySelector('.card:nth-of-type(2) p');
  const profileCard = document.querySelector('.card:nth-of-type(3) p');

  async function updateTotalJobs() {
    try {
      const res = await fetch(`${API_BASE}/jobs/public`);
      const data = await res.json();
      const jobs = data.jobs || data;
      if (totalJobsCard) totalJobsCard.textContent = `Total Jobs Available: ${jobs.length}`;
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      if (totalJobsCard) totalJobsCard.textContent = 'Failed to load jobs';
    }
  }

  async function updateRecentlyApplied() {
    try {
      const res = await fetch(`${API_BASE}/applications/my-applications`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      const apps = Array.isArray(data) ? data : (data.applications || []);
      if (appliedJobsCard) appliedJobsCard.textContent = `Recently Applied Jobs: ${apps.length}`;
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      if (appliedJobsCard) appliedJobsCard.textContent = 'Failed to load applications';
    }
  }

  function updateProfileCompletion() {
    const fields = ['username', 'email', 'mobile', 'education', 'skills', 'experience'];
    const filled = fields.filter(f => user[f] && user[f].trim() !== '');
    const percent = Math.round((filled.length / fields.length) * 100);
    if (profileCard) profileCard.textContent = `Profile Completion: ${percent}%`;
  }

  updateTotalJobs();
  updateRecentlyApplied();
  updateProfileCompletion();
});
