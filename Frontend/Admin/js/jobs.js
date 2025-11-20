document.addEventListener("DOMContentLoaded", async () => {
  // Check admin authentication
  checkAdminAuth();

  const tableBody = document.querySelector("tbody");
  const logoutBtn = document.getElementById("logout-btn");

  // Logout functionality
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "../Auth/login.html"; // adjust path
  });

  // Fetch and render jobs
  async function loadJobs() {
    try {
      const res = await fetchWithAuth("/admin/jobs"); // your endpoint
      if (!res || !res.ok) return;

      const jobs = await res.json();

      tableBody.innerHTML = ""; // clear table

      jobs.forEach(job => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${job.id}</td>
          <td>${job.job_title}</td>
          <td>${job.company_name}</td>
          <td>${job.status}</td>
          <td>
            ${job.status === "Pending" ? `<button class="btn approve-btn" data-id="${job.id}">Approve</button>` : ''}
            <button class="btn edit-btn" data-id="${job.id}">Edit</button>
            <button class="btn delete-btn" data-id="${job.id}" style="background-color:#ff4d4d">Delete</button>
          </td>
        `;
        tableBody.appendChild(row);
      });

      // Attach event listeners after creating buttons
      attachJobListeners();
    } catch (err) {
      console.error("Error loading jobs:", err);
    }
  }

  function attachJobListeners() {
    // Approve buttons
    document.querySelectorAll(".approve-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (confirm("Approve this job?")) {
          try {
            const res = await fetchWithAuth(`/admin/jobs/${id}/approve`, { method: "PUT" });
            if (res && res.ok) {
              alert("Job approved successfully");
              loadJobs(); // refresh table
            } else {
              alert("Failed to approve job");
            }
          } catch (err) {
            console.error(err);
          }
        }
      });
    });

    // Delete buttons
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (confirm("Delete this job?")) {
          try {
            const res = await fetchWithAuth(`/admin/jobs/${id}`, { method: "DELETE" });
            if (res && res.ok) {
              alert("Job deleted successfully");
              loadJobs();
            } else {
              alert("Failed to delete job");
            }
          } catch (err) {
            console.error(err);
          }
        }
      });
    });

    // Edit buttons (placeholder)
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        alert(`Edit form for job ID: ${id} (implement later)`);
      });
    });
  }

  // Initial load
  loadJobs();
});
