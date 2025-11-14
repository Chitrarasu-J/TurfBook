document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // ✅ Prevents reload

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("⚠️ Please fill in both fields!");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("Login response:", data);

    if (data.success) {
    localStorage.setItem("userToken", data.token);
    window.location.href = "index.html";  // 🔥 direct redirect
}
else {
      alert("❌ " + (data.message || "Invalid credentials"));
    }
  } catch (err) {
    console.error("Login Error:", err);
    alert("⚠️ Unable to connect to backend");
  }
});
