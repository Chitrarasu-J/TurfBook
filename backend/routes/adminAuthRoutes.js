const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Booking = require("../models/Booking");
const Turf = require("../models/Turf");
const User = require("../models/User"); // Only if you have user model

require("dotenv").config();

// =======================
// ADMIN LOGIN
// =======================
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASS
  ) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "2h"
    });

    return res.json({ success: true, token });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid credentials",
  });
});

// =======================
// ADMIN DASHBOARD — Total Stats
// =======================
router.get("/stats", async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalTurfs = await Turf.countDocuments();
    const totalUsers = await User.countDocuments();

    res.json({ totalBookings, totalTurfs, totalUsers });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Failed to load stats" });
  }
});

// =======================
// ADMIN — Chart Data
// =======================
router.get("/chart-data", async (req, res) => {
  try {
    const turfStats = await Booking.aggregate([
      { $group: { _id: "$turfName", count: { $sum: 1 } } }
    ]);

    const dateStats = await Booking.aggregate([
      { $group: { _id: "$date", count: { $sum: 1 } } }
    ]);

    res.json({ turfStats, dateStats });
  } catch (err) {
    console.error("Chart data error:", err);
    res.status(500).json({ message: "Failed to load chart data" });
  }
});

// =======================
// ADMIN — Recent Bookings
// =======================
router.get("/recent-bookings", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ _id: -1 })
      .limit(10);

    res.json(bookings);
  } catch (err) {
    console.error("Recent bookings error:", err);
    res.status(500).json({ message: "Failed to load recent bookings" });
  }
});

module.exports = router;
