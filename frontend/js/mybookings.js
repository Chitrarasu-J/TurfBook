document.addEventListener("DOMContentLoaded", function () {
  const userEmail = localStorage.getItem("email");

  if (!userEmail) {
    alert("Please login first!");
    window.location.href = "index.html";
    return;
  }

  fetch(`http://localhost:5000/api/bookings/mybookings?email=${userEmail}`)
    .then(res => res.json())
    .then(data => {
      const bookingsDiv = document.getElementById("bookingList");

      if (data.length === 0) {
        bookingsDiv.innerHTML = "<p>No bookings found.</p>";
        bookingsDiv.innerHTML = `<h3>No bookings found 😕</h3>`;
        return;
      }

      data.forEach(b => {
        bookingsDiv.innerHTML += `
        <div class="booking-card">
          <h3>${b.turfName}</h3>
          <p>📅 Date: ${b.date}</p>
          <p>⏳ Time: ${b.time}</p>
          <p>📧 Booked By: ${b.userEmail}</p>
        </div>
      `;
      });
    })
    .catch(err => console.log("Error fetching bookings", err));
});


