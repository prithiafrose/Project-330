// Get form elements
const profileForm = document.getElementById("profile-form");

// Load profile info on page load
async function loadProfile() {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not logged in");

    const res = await fetch("/api/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const user = await res.json();
    if (!res.ok) throw new Error(user.error || "Failed to load profile");

    // Fill input fields
    profileForm[0].value = user.username || "";
    profileForm[1].value = user.email || "";
    profileForm[2].value = user.mobile || "";
    // Fill input fields

document.getElementById("fullNameInput").value = user.full_name || "";
document.getElementById("skillsInput").value = user.skills || "";


  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

loadProfile();

// Handle profile update form submission
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("User not logged in");
    return;
  }

  const username = profileForm[0].value;
  const email = profileForm[1].value;
  const mobile = profileForm[2].value;
  const currentPassword = profileForm[3].value;
  const newPassword = profileForm[4].value;
  const confirmPassword = profileForm[5].value;

  try {
    // Update basic profile info
    let res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ username, email, mobile,full_name: fullName, skills })
    });
    let data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update profile");

    // Update password if user filled the fields
    if (currentPassword || newPassword) {
      if (newPassword !== confirmPassword) {
        alert("New password and confirm password do not match");
        return;
      }

      res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
      });

      data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");
      alert(data.message || "Password updated successfully");
    }

    alert(data.message || "Profile updated successfully");

    // Clear password fields
    profileForm[3].value = "";
    profileForm[4].value = "";
    profileForm[5].value = "";

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
});
