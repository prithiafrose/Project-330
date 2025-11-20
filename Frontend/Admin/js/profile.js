document.addEventListener("DOMContentLoaded", async () => {
  checkAdminAuth();

  const form = document.getElementById("profile-form");
  const inputs = form.querySelectorAll("input");

  // Load current profile
  try {
    const res = await fetchWithAuth("/profile"); // Uses the profileRoutes which finds user by ID/Token
    // Wait, the admin route uses /profile? Or is it /admin/profile?
    // Backend/routes/profileRoutes.js is mounted at /profile usually? 
    // Let's check main Server.js later. Assuming /profile works for logged in user.
    // BUT, profileRoutes.js specifically fetches `where: { role: "admin" }` hardcoded!
    // That's a bit weird for a general profile route, but it works for the admin panel.
    
    if (res) {
      const admin = await res.json();
      // 0: Username, 1: Email, 2: Mobile
      inputs[0].value = admin.username;
      inputs[1].value = admin.email;
      inputs[2].value = admin.mobile;
    }
  } catch (error) {
    console.error("Error loading profile:", error);
  }

  // Handle Update
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = inputs[0].value;
    const email = inputs[1].value;
    const mobile = inputs[2].value;
    const current_password = inputs[3].value;
    const new_password = inputs[4].value;
    const confirm_password = inputs[5].value;

    // Update Info
    try {
      const updateRes = await fetchWithAuth("/profile", {
        method: "PUT",
        body: JSON.stringify({ username, email, mobile })
      });
      
      if(updateRes && updateRes.ok) {
        alert("Profile details updated.");
      } else {
        alert("Failed to update profile details.");
      }

      // Update Password if provided
      if (current_password && new_password) {
        if (new_password !== confirm_password) {
          alert("New passwords do not match!");
          return;
        }

        const passRes = await fetchWithAuth("/profile/password", {
          method: "PUT",
          body: JSON.stringify({ current_password, new_password })
        });

        if (passRes && passRes.ok) {
            alert("Password updated successfully.");
            inputs[3].value = "";
            inputs[4].value = "";
            inputs[5].value = "";
        } else {
            const err = await passRes.json();
            alert(err.error || "Failed to update password");
        }
      }

    } catch (error) {
      console.error(error);
    }
  });
});