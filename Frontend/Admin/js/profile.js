// profile.js

document.addEventListener("DOMContentLoaded", async () => {
  // --- AUTH CHECK ---
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "../Auth/login.html";
    return;
  }

  const logoutBtn = document.getElementById("logout-btn");
  const form = document.getElementById("profile-form");

  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const mobileInput = document.getElementById("mobile");
  const currentPasswordInput = document.getElementById("current_password");
  const newPasswordInput = document.getElementById("new_password");
  const confirmPasswordInput = document.getElementById("confirm_password");

  // --- LOGOUT HANDLER ---
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "../Auth/login.html";
  });

  // --- NOTIFICATIONS (basic) ---
  const notifBtn = document.getElementById("notifBtn");
  const notifDropdown = document.getElementById("notifDropdown");
  const notifList = document.getElementById("notifList");
  const notifCount = document.getElementById("notifCount");

  notifBtn.addEventListener("click", () => {
    notifDropdown.classList.toggle("show");
  });

  async function loadNotifications() {
    try {
      const res = await fetch("/api/notifications", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) return;

      const data = await res.json();
      notifList.innerHTML = "";
      if (data.length === 0) {
        notifList.innerHTML = "<li>No notifications</li>";
      } else {
        data.forEach(notif => {
          const li = document.createElement("li");
          li.textContent = notif.message;
          notifList.appendChild(li);
        });
      }
      notifCount.textContent = data.length;
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }

  loadNotifications();

  // --- LOAD PROFILE ---
  async function loadProfile() {
    try {
      const res = await fetch("/api/profile", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to fetch profile");

      const admin = await res.json();
      usernameInput.value = admin.username;
      emailInput.value = admin.email;
      mobileInput.value = admin.mobile;
    } catch (err) {
      console.error("Error loading profile:", err);
      alert("Failed to load profile data");
    }
  }

  await loadProfile();

  // --- PROFILE FORM SUBMIT ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Update profile info
    try {
      const updateRes = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          username: usernameInput.value,
          email: emailInput.value,
          mobile: mobileInput.value
        })
      });

      if (updateRes.ok) {
        alert("Profile updated successfully");
      } else {
        const err = await updateRes.json();
        alert(err.error || "Failed to update profile");
      }

      // Update password if provided
      if (currentPasswordInput.value && newPasswordInput.value) {
        if (newPasswordInput.value !== confirmPasswordInput.value) {
          alert("New passwords do not match");
          return;
        }

        const passRes = await fetch("/api/profile/password", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            current_password: currentPasswordInput.value,
            new_password: newPasswordInput.value
          })
        });

        if (passRes.ok) {
          alert("Password updated successfully");
          currentPasswordInput.value = "";
          newPasswordInput.value = "";
          confirmPasswordInput.value = "";
        } else {
          const err = await passRes.json();
          alert(err.error || "Failed to update password");
        }
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("An error occurred while updating profile");
    }
  });
});
