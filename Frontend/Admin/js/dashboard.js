document.addEventListener("DOMContentLoaded", async () => {
  checkAdminAuth();

  const stats = [
    { id: "total-users", endpoint: "/admin/users/states", key: "totalUsers" },
    { id: "total-jobs", endpoint: "/admin/jobs/stats", key: "totalJobs" },
    { id: "pending-approvals", endpoint: "/admin/jobs/pending", key: "pendingCount" },
    { id: "recent-registrations", endpoint: "/admin/users/recent", key: "recentCount" }
  ];

  // Since the HTML has hardcoded cards without specific IDs for the numbers, 
  // we need to update the HTML to include IDs or target them by position.
  // For now, let's try to target the <p> tags inside the .card divs.

  const cards = document.querySelectorAll(".card p");
  
  // 0: Users, 1: Jobs, 2: Pending, 3: Recent
  
  try {
    // 1. Total Users
    const usersRes = await fetchWithAuth("/admin/users/stats");
    if (usersRes) {
      const data = await usersRes.json();
      cards[0].textContent = data.totalUsers;
    }

    // 2. Total Jobs
    const jobsRes = await fetchWithAuth("/admin/jobs/stats");
    if (jobsRes) {
      const data = await jobsRes.json();
      cards[1].textContent = data.totalJobs;
    }

    // 3. Pending Approvals
    const pendingRes = await fetchWithAuth("/admin/jobs/pending");
    if (pendingRes) {
      const data = await pendingRes.json();
      cards[2].textContent = data.pendingCount;
    }
    document.getElementById("totalJobsCard").addEventListener("click", () => {
  window.location.href = "jobs.html";
});
document.getElementById("pendingJobsCard").addEventListener("click", () => {
  window.location.href = "jobs.html?filter=pending";
});

    // 4. Recent Registrations
    const recentRes = await fetchWithAuth("/admin/users/recent");
    if (recentRes) {
      const data = await recentRes.json();
      cards[3].textContent = data.recentCount;
    }

  } catch (error) {
    console.error("Error loading dashboard stats:", error);
  }
  document.addEventListener("click", (e) => {
  if (!notifBtn.contains(e.target) && !notifDropdown.contains(e.target)) {
    notifDropdown.style.display = "none";
  }
});


  
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "../../Auth/Login.html";
  });
});
