// 🎨 Global chart variables
let turfChart, dateChart;

/* ===============================
   📊 Charts
=============================== */
async function loadCharts() {
  try {
    const res = await fetch("http://localhost:5000/api/admin/chart-data");
    const data = await res.json();

    const turfNames = (data.turfStats || []).map(t => t._id);
    const turfCounts = (data.turfStats || []).map(t => t.count);
    const dates = (data.dateStats || []).map(d => d._id);
    const dateCounts = (data.dateStats || []).map(d => d.count);

    const ctx1 = document.getElementById("bookingsByTurf")?.getContext("2d");
    if (ctx1) {
      if (turfChart) turfChart.destroy();
      turfChart = new Chart(ctx1, {
        type: "bar",
        data: {
          labels: turfNames,
          datasets: [{
            label: "Bookings per Turf",
            data: turfCounts,
            borderWidth: 2,
            borderColor: "#00fff7",
            backgroundColor: "rgba(0,255,255,0.5)"
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { color: "#fff" } },
            x: { ticks: { color: "#fff" } }
          }
        }
      });
    }

    const ctx2 = document.getElementById("bookingsByDate")?.getContext("2d");
    if (ctx2) {
      if (dateChart) dateChart.destroy();
      dateChart = new Chart(ctx2, {
        type: "pie",
        data: {
          labels: dates,
          datasets: [{
            label: "Bookings per Date",
            data: dateCounts,
            backgroundColor: [
              "#00b894", "#0984e3", "#6c5ce7", "#fdcb6e",
              "#e17055", "#00cec9", "#74b9ff"
            ]
          }]
        },
        options: {
          plugins: {
            legend: { labels: { color: "#fff", font: { size: 14 } } }
          }
        }
      });
    }
  } catch (err) {
    console.error("Chart load error:", err);
  }
}

/* ===============================
   🕒 Recent bookings table
=============================== */
async function loadRecentBookings() {
  try {
    const res = await fetch("http://localhost:5000/api/admin/recent-bookings");
    const data = await res.json();
    const tbody = document.querySelector("#recentTable tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    (data || []).forEach(b => {
      tbody.insertAdjacentHTML(
        "beforeend",
        `<tr>
          <td>${b.turfName}</td>
          <td>${b.userEmail}</td>
          <td>${b.date}</td>
          <td>${b.time}</td>
        </tr>`
      );
    });
  } catch (err) {
    console.error("Recent bookings load error:", err);
  }
}

/* ===============================
   📋 Load turfs
=============================== */
async function loadTurfs() {
  try {
    const res = await fetch("http://localhost:5000/api/turf");
    const data = await res.json();
    // Accept multiple shapes: {success, turfs} OR [] directly
    const turfs = Array.isArray(data) ? data : (data.turfs || []);
    const turfList = document.getElementById("turfList");
    if (!turfList) return;

    turfList.innerHTML = "";

    if (!turfs.length) {
      turfList.innerHTML = `<p style="opacity:.7">No turfs yet.</p>`;
      return;
    }

    turfs.forEach(turf => {
      const id = turf._id || "";
      turfList.insertAdjacentHTML(
        "beforeend",
        `<div class="turf-card">
           <img src="${turf.image}" alt="${turf.name}">
           <h4>${turf.name}</h4>
           <p>${turf.location}</p>
           <button class="delete-btn" onclick="deleteTurf('${id}')">Delete</button>
         </div>`
      );
    });
  } catch (err) {
    console.error("Load turfs failed:", err);
  }
}

/* ===============================
   ➕ Add turf
=============================== */
async function addTurf() {
  const nameEl = document.getElementById("name");
  const locEl = document.getElementById("location");
  const imgEl = document.getElementById("image");

  const name = nameEl?.value.trim();
  const location = locEl?.value.trim();
  const image = imgEl?.value.trim();

  if (!name || !location || !image) {
    alert("⚠️ Please fill all fields!");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/turf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, location, image }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

    // Clear inputs
    nameEl.value = "";
    locEl.value = "";
    imgEl.value = "";

    alert("✅ Turf added successfully!");

    // Optimistic append (so you see it instantly)
    const turfList = document.getElementById("turfList");
    if (turfList) {
      const t = data.turf || { name, location, image, _id: "" };
      turfList.insertAdjacentHTML(
        "afterbegin",
        `<div class="turf-card">
           <img src="${t.image}" alt="${t.name}">
           <h4>${t.name}</h4>
           <p>${t.location}</p>
           <button class="delete-btn" onclick="deleteTurf('${t._id || ""}')">Delete</button>
         </div>`
      );
    }

    // And also reload from server to ensure consistency
    await loadTurfs();
  } catch (err) {
    console.error("Add Turf Error:", err);
    alert("❌ " + err.message);
  }
}

/* ===============================
   🗑️ Delete turf
=============================== */
async function deleteTurf(id) {
  if (!id) {
    alert("Missing turf id.");
    return;
  }
  if (!confirm("Delete this turf?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/turf/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

    alert("🗑️ Turf deleted");
    await loadTurfs();
  } catch (err) {
    console.error("Delete Turf Error:", err);
    alert("❌ " + err.message);
  }
}

/* ===============================
   🧮 Dashboard stats
=============================== */
async function loadDashboard() {
  try {
    const res = await fetch("http://localhost:5000/api/admin/stats");
    const data = await res.json();
    const { totalTurfs = 0, totalBookings = 0, totalUsers = 0 } = data || {};
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("turfCount", totalTurfs);
    set("bookingCount", totalBookings);
    set("userCount", totalUsers);
  } catch (err) {
    console.error("Dashboard stats load error:", err);
  }
}

/* ===============================
   🚀 Init
=============================== */
document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
  loadRecentBookings();
  loadCharts();
  loadTurfs();
});

/* Make functions callable from HTML onclick="" */
window.addTurf = addTurf;
window.deleteTurf = deleteTurf;
