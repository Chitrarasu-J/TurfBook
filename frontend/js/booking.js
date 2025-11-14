// ✅ Load all turfs dynamically from MongoDB
async function loadTurfs() {
  try {
    // Fetch all turf data from backend API
    const res = await fetch("http://localhost:5000/api/turf/list");
    const turfs = await res.json();

    displayTurfs(turfs);
  } catch (err) {
    console.error("Error fetching turfs:", err);
    document.getElementById("turfList").innerHTML =
      "<h3>⚠️ Failed to load turfs from database</h3>";
  }
}

// ✅ Display turfs dynamically on the booking page
function displayTurfs(turfs) {
  const list = document.getElementById("turfList");
  list.innerHTML = "";

  if (!turfs || turfs.length === 0) {
    list.innerHTML = "<h3>No turfs available 🏟️</h3>";
    return;
  }

  turfs.forEach((turf) => {
    list.innerHTML += `
      <div class="turf-card">
        <img src="${turf.image}" alt="Turf Image" />
        <h3>${turf.name}</h3>
        <p>${turf.location}</p>
        <button class="book-btn" data-turf="${turf.name}">Book Now</button>
      </div>
    `;
  });

  // Attach click events to all "Book Now" buttons
  document.querySelectorAll(".book-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const turfName = btn.getAttribute("data-turf");
      bookNow(turfName);
    });
  });
}

// ✅ Function to handle booking
function bookNow(turfName) {
  const userEmail = localStorage.getItem("email");

  if (!userEmail) {
    alert("Please login first!");
    window.location.href = "login.html";
    return;
  }

  const date = prompt(`Enter booking date for ${turfName} (YYYY-MM-DD):`);
  const time = prompt("Enter time slot (Ex: 6 PM - 7 PM):");

  if (!date || !time) {
    alert("⚠️ Please enter valid date and time!");
    return;
  }

  fetch("http://localhost:5000/api/bookings/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ turfName, date, time, userEmail }),
  })
    .then((res) => res.json())
    .then((data) => {
      alert(data.message);
    })
    .catch((err) => {
      console.error("Booking Error:", err);
      alert("❌ Booking Failed! Try again later.");
    });
}

// ✅ Logout (optional button in nav)
function logout() {
  localStorage.removeItem("email");
  alert("Logged out Successfully!");
  window.location.href = "index.html";
}

// ✅ Run automatically when page loads
document.addEventListener("DOMContentLoaded", loadTurfs);
