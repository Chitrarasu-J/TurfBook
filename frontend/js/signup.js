document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // ✅ Prevents page reload

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    alert("⚠️ Please fill all fields!");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    console.log("Signup response:", data);

    if (data.success) {
      alert("✅ Signup successful! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "login.html"; // 👈 redirect after 1s
      }, 1000);
    } else {
      alert("❌ " + (data.message || "Signup failed"));
    }
  } catch (err) {
    console.error("Signup Error:", err);
    alert("⚠️ Unable to connect to backend");
  }
});
