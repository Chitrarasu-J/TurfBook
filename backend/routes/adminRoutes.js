const express = require("express");
const router = express.Router();

const Turf = require("../models/Turf");
const Booking = require("../models/Booking");
const User = require("../models/User"); // make sure your user model filename is correct!

// 📊 Admin Stats Route
router.get("/stats", async (req, res) => {
  try {
    const totalTurfs = await Turf.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments();

    res.json({ totalTurfs, totalBookings, totalUsers });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
});

// 📈 Chart Data
router.get("/chart-data", async (req, res) => {
  try {
    const turfStats = await Booking.aggregate([
      { $group: { _id: "$turfName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const dateStats = await Booking.aggregate([
      { $group: { _id: "$date", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ turfStats, dateStats });
  } catch (err) {
    console.error("Chart data error:", err);
    res.status(500).json({ message: "Failed to load chart data" });
  }
});

module.exports = router;
