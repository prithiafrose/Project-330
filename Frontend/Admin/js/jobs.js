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

  // Load job data for editing
  async function loadJobForEdit(id) {
    try {
      const res = await fetchWithAuth(`/admin/jobs/${id}`);
      if (!res || !res.ok) {
        alert("Failed to load job data");
        return;
      }

      const job = await res.json();
      
      // Populate form fields
      document.getElementById("editJobId").value = job.id;
      document.getElementById("editTitle").value = job.title;
      document.getElementById("editCompany").value = job.company;
      document.getElementById("editLocation").value = job.location || '';
      document.getElementById("editType").value = job.type || 'Full-time';
      document.getElementById("editSalary").value = job.salary || '';
      document.getElementById("editDescription").value = job.description || '';
      
      // Show modal
      document.getElementById("editModal").style.display = "block";
    } catch (err) {
      console.error("Error loading job for edit:", err);
      alert("Error loading job data");
    }
  }

  // Close edit modal
  window.closeEditModal = function() {
    document.getElementById("editModal").style.display = "none";
  };

  // Handle edit form submission
  async function handleEditSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById("editJobId").value;
    const jobData = {
      title: document.getElementById("editTitle").value,
      company: document.getElementById("editCompany").value,
      location: document.getElementById("editLocation").value,
      type: document.getElementById("editType").value,
      salary: document.getElementById("editSalary").value,
      description: document.getElementById("editDescription").value
    };

    try {
      const res = await fetchWithAuth(`/admin/jobs/${id}`, {
        method: "PUT",
        body: JSON.stringify(jobData)
      });

      if (res && res.ok) {
        alert("Job updated successfully");
        closeEditModal();
        loadJobs(); // Refresh the table
      } else {
        alert("Failed to update job");
      }
    } catch (err) {
      console.error("Error updating job:", err);
      alert("Error updating job");
    }
  }

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
          <td>${job.title}</td>
          <td>${job.company}</td>
          <td>${job.status}</td>
          <td>
            ${job.status === "pending" ? `<button class="btn approve-btn" data-id="${job.id}">Approve</button>` : ''}
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

    // Edit buttons
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        await loadJobForEdit(id);
      });
    });
  }

  // Modal event listeners
  document.querySelector(".close").addEventListener("click", closeEditModal);
  
  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    const modal = document.getElementById("editModal");
    if (e.target === modal) {
      closeEditModal();
    }
  });

  // Edit form submission
  document.getElementById("editJobForm").addEventListener("submit", handleEditSubmit);

  // Initial load
  loadJobs();
});
