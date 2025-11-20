// users.js
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "../Auth/login.html";
    return;
  }

  const tableBody = document.querySelector("tbody");
  const logoutBtn = document.getElementById("logout-btn");
  const notifBtn = document.getElementById("notifBtn");
  const notifDropdown = document.getElementById("notifDropdown");
  const notifList = document.getElementById("notifList");
  const notifCount = document.getElementById("notifCount");

  // --- LOGOUT ---
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "../Auth/login.html";
  });

  // --- NOTIFICATIONS ---
  notifBtn.addEventListener("click", () => {
    notifDropdown.classList.toggle("show");
  });

  async function loadNotifications() {
    try {
      const res = await fetch("/api/notifications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) return;

      const notifications = await res.json();
      notifList.innerHTML = "";

      if (notifications.length === 0) {
        notifList.innerHTML = "<li>No notifications</li>";
      } else {
        notifications.forEach(notif => {
          const li = document.createElement("li");
          li.textContent = notif.message;
          notifList.appendChild(li);
        });
      }
      notifCount.textContent = notifications.length;
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }

  loadNotifications();

  // --- LOAD USERS ---
  async function loadUsers() {
    try {
      const res = await fetch("/admin/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const users = await res.json();

      tableBody.innerHTML = "";

      users.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${user.id}</td>
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>${user.mobile || "N/A"}</td>
          <td>${user.role}</td>
          <td>
            <button class="btn edit-btn" data-id="${user.id}">Edit</button>
            <button class="btn delete-btn" data-id="${user.id}" style="background-color:#ff4d4d">Delete</button>
          </td>
        `;
        tableBody.appendChild(row);
      });

      // --- DELETE USER ---
      document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.getAttribute("data-id");
          if (confirm("Are you sure you want to delete this user?")) {
            await deleteUser(id);
          }
        });
      });

      // --- EDIT USER (example alert, replace with your modal or form) ---
      document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-id");
          alert(`Open edit form for user ID: ${id}`);
        });
      });

    } catch (err) {
      console.error("Error loading users:", err);
      tableBody.innerHTML = "<tr><td colspan='6'>Failed to load users</td></tr>";
    }
  }

  async function deleteUser(id) {
    try {
      const res = await fetch(`/admin/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        alert("User deleted successfully");
        loadUsers();
      } else {
        alert("Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Error deleting user");
    }
  }

  loadUsers();
});
