// 🎨 Global chart variables
let turfChart, dateChart;

// Get admin token
function getAdminToken() {
  return localStorage.getItem("adminToken");
}

// Authenticated fetch helper
async function adminFetch(url, options = {}) {
  const token = getAdminToken();
  if (!token) {
    alert("⚠️ Admin authentication required. Please login again.");
    window.location.href = "admin-login.html";
    return;
  }
  
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers
    }
  });
}

/* ===============================
   📊 Charts
=============================== */
async function loadCharts() {
  try {
    const res = await adminFetch("http://localhost:5000/api/admin-auth/chart-data");
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
    const res = await adminFetch("http://localhost:5000/api/admin-auth/recent-bookings");
    const data = await res.json();
    const tbody = document.querySelector("#recentTable tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;opacity:0.7;">No recent bookings found</td></tr>`;
      return;
    }

    data.forEach(b => {
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
    const res = await adminFetch("http://localhost:5000/api/turf");
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
    const res = await adminFetch("http://localhost:5000/api/turf", {
      method: "POST",
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
    const res = await adminFetch(`http://localhost:5000/api/turf/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

    alert("🗑️ Turf deleted");
    await loadTurfs();
  } catch (err) {
    console.error("Delete Turf Error:", err);
    alert("❌ " + err.message);
  }
}

async function clearCurrentBookings() {
  if (!confirm("Clear all current bookings data? This will remove existing bookings for testing.")) return;
  
  try {
    // Clear the table display
    const tbody = document.querySelector("#recentTable tbody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;opacity:0.7;">No bookings - ready for new data</td></tr>`;
    }
    
    // Clear from database
    const res = await adminFetch("http://localhost:5000/api/admin-auth/clear-bookings", {
      method: "DELETE"
    });
    
    if (res.ok) {
      await updateBookingStats();
      showToast("All bookings cleared! Ready for new data.", "#00ffcc");
    } else {
      throw new Error("Failed to clear bookings");
    }
  } catch (err) {
    console.error("Clear bookings error:", err);
    showToast("Failed to clear bookings", "#ff7675");
  }
}

/* ===============================
   🔄 Enhanced Booking Functions
=============================== */
async function refreshBookings() {
  try {
    await loadRecentBookings();
    await updateBookingStats();
    showToast("Bookings refreshed!", "#00ffcc");
  } catch (err) {
    console.error("Refresh bookings error:", err);
    showToast("Failed to refresh bookings", "#ff7675");
  }
}

async function clearAllBookings() {
  if (!confirm("Are you sure you want to clear all bookings? This action cannot be undone.")) return;
  
  try {
    const res = await adminFetch("http://localhost:5000/api/admin-auth/clear-bookings", {
      method: "DELETE"
    });
    
    if (res.ok) {
      await loadRecentBookings();
      await updateBookingStats();
      showToast("All bookings cleared successfully!", "#00ffcc");
    } else {
      throw new Error("Failed to clear bookings");
    }
  } catch (err) {
    console.error("Clear bookings error:", err);
    showToast("Failed to clear bookings", "#ff7675");
  }
}

async function updateBookingStats() {
  try {
    const res = await adminFetch("http://localhost:5000/api/admin-auth/stats");
    const data = await res.json();
    
    // Update total count
    const totalEl = document.getElementById("totalBookingsCount");
    if (totalEl) totalEl.textContent = data.totalBookings || 0;
    
    // Update today's count
    const todayEl = document.getElementById("todayBookingsCount");
    if (todayEl) {
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = data.todayBookings || 0;
      todayEl.textContent = todayBookings;
    }
    
    // Update pending count
    const pendingEl = document.getElementById("pendingBookingsCount");
    if (pendingEl) pendingEl.textContent = data.pendingBookings || 0;
    
  } catch (err) {
    console.error("Update booking stats error:", err);
  }
}

async function deleteBooking(bookingId) {
  if (!confirm("Delete this booking?")) return;
  
  try {
    const res = await adminFetch(`http://localhost:5000/api/admin-auth/booking/${bookingId}`, {
      method: "DELETE"
    });
    
    if (res.ok) {
      await loadRecentBookings();
      await updateBookingStats();
      showToast("Booking deleted successfully!", "#00ffcc");
    } else {
      throw new Error("Failed to delete booking");
    }
  } catch (err) {
    console.error("Delete booking error:", err);
    showToast("Failed to delete booking", "#ff7675");
  }
}

function updateBookingStatus(bookingId, status) {
  // Update booking status in the table
  const statusCell = document.querySelector(`[data-booking-id="${bookingId}"] .booking-status`);
  if (statusCell) {
    statusCell.textContent = status;
    statusCell.className = `booking-status status-${status}`;
  }
}

// Enhanced loadRecentBookings with actions
async function loadRecentBookings() {
  try {
    const res = await adminFetch("http://localhost:5000/api/admin-auth/recent-bookings");
    const data = await res.json();
    
    // DEBUG: Log the actual data structure
    console.log("🔍 DEBUG - Raw data from backend:", data);
    console.log("🔍 DEBUG - First booking item:", data[0]);
    
    const tbody = document.querySelector("#recentTable tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;opacity:0.7;">No recent bookings found</td></tr>`;
      return;
    }

    data.forEach(booking => {
      // DEBUG: Log each booking structure
      console.log("🔍 DEBUG - Processing booking:", booking);
      
      const statusClass = booking.status === 'confirmed' ? 'status-confirmed' : 
                           booking.status === 'pending' ? 'status-pending' : 'status-cancelled';
      
      // Extract user name from email (everything before @)
      const userName = booking.userEmail ? booking.userEmail.split('@')[0] : 'Unknown';
      
      // Based on your example, the data seems to be in this format:
      // booking.turfName = "Sportify" (this should go to Location column)
      // booking.userEmail = "hari@gmail.com" (this should go to User Name column)  
      // booking.date = "2026-01-01" (this should go to Date column)
      // booking.time = "12:01" (this should go to Time column)
      
      // Map data to correct columns based on your example
      const dateValue = booking.date || 'N/A';
      const timeValue = booking.time || 'N/A';
      const locationValue = booking.turfName || booking.location || 'N/A';
      
      tbody.insertAdjacentHTML(
        "beforeend",
        `<tr data-booking-id="${booking._id}">
          <td>${dateValue}</td>
          <td>${timeValue}</td>
          <td>${locationValue}</td>
          <td>${userName}</td>
          <td class="booking-status ${statusClass}">${booking.status || 'pending'}</td>
          <td>
            <button class="action-btn confirm-btn" onclick="updateBookingStatus('${booking._id}', 'confirmed')" title="Confirm">
              <i class='bx bx-check'></i>
            </button>
            <button class="action-btn delete-btn" onclick="deleteBooking('${booking._id}')" title="Delete">
              <i class='bx bx-trash'></i>
            </button>
          </td>
        </tr>`
      );
    });
  } catch (err) {
    console.error("Recent bookings load error:", err);
  }
}

// Add CSS for action buttons
const actionButtonStyles = `
  <style>
    .action-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      border-radius: 15px;
      padding: 6px 10px;
      cursor: pointer;
      margin: 0 2px;
      transition: all 0.3s ease;
      font-size: 12px;
    }
    
    .action-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }
    
    .confirm-btn:hover {
      background: rgba(0, 255, 0, 0.2);
      border-color: rgba(0, 255, 0, 0.5);
    }
    
    .delete-btn:hover {
      background: rgba(255, 0, 0, 0.2);
      border-color: rgba(255, 0, 0, 0.5);
    }
    
    .booking-status {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .status-confirmed {
      background: rgba(0, 255, 0, 0.2);
      color: #00ff88;
      border: 1px solid rgba(0, 255, 0, 0.5);
    }
    
    .status-pending {
      background: rgba(255, 193, 7, 0.2);
      color: #ffc107;
      border: 1px solid rgba(255, 193, 7, 0.5);
    }
    
    .status-cancelled {
      background: rgba(255, 0, 0, 0.2);
      color: #ff4444;
      border: 1px solid rgba(255, 0, 0, 0.5);
    }
  </style>
`;

// Inject styles into head
if (!document.getElementById('action-button-styles')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'action-button-styles';
  styleEl.textContent = actionButtonStyles.replace(/<\/style>/, '').replace(/<style>/, '');
  document.head.appendChild(styleEl);
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
