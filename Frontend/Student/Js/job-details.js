const API_BASE = "http://localhost:5001/api";

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

  const jobId = new URLSearchParams(window.location.search).get("id");
  const jobDetailsDiv = document.getElementById("job-details");

  async function fetchJobDetails() {
    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Job not found");

      const job = data.job || data;

      jobDetailsDiv.innerHTML = `
        <h3>${escapeHTML(job.title || job.job_position)}</h3>
        <p><strong>Company:</strong> ${escapeHTML(job.company || job.company_name)}</p>
        <p><strong>Location:</strong> ${escapeHTML(job.location)}</p>
        <p><strong>Salary:</strong> $${job.salary || job.monthly_salary}</p>
        <p><strong>Type:</strong> ${escapeHTML(job.type || 'Full Time')}</p>
        <p><strong>Description:</strong> ${escapeHTML(job.description)}</p>
        <p><strong>Skills Required:</strong> ${escapeHTML(job.skills || job.skills_required)}</p>
        
        <hr style="margin: 20px 0;">
        <h4>Apply for this Job</h4>
        <form id="applyForm" style="display: flex; flex-direction: column; gap: 15px; max-width: 500px;">
            <label>
                Cover Letter:
                <textarea name="cover_letter" rows="4" style="width: 100%; padding: 8px;" required></textarea>
            </label>
            <label>
                Upload Resume (PDF/Doc):
                <input type="file" name="resume" accept=".pdf,.doc,.docx" required>
            </label>
            <button type="submit" class="btn">Submit Application</button>
        </form>
        <div id="applyMsg"></div>
      `;

      const applyForm = document.getElementById("applyForm");
      applyForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const msgDiv = document.getElementById("applyMsg");
        msgDiv.textContent = "Submitting...";

        const formData = new FormData(e.target);
        formData.append("jobId", jobId);

        try {
          const res = await fetch(`${API_BASE}/applications`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: formData
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Application failed");

          msgDiv.innerHTML = `<p style="color: green;">Application submitted successfully!</p>`;
          e.target.reset();
          setTimeout(() => window.location.href = "applied-jobs.html", 2000);

        } catch (err) {
          msgDiv.innerHTML = `<p style="color: red;">${err.message}</p>`;
        }
      });

    } catch (err) {
      jobDetailsDiv.innerHTML = `<p style="color:red">${err.message}</p>`;
    }
  }

  if (jobId) fetchJobDetails();
});




