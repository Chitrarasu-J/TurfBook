const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Turf = require("../models/Turf");

// 🟢 Create a new booking
router.post("/create", async (req, res) => {
  try {
    const { turfId, date, time } = req.body;

    if (!turfId || !date || !time) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find the turf to get its name
    const turf = await Turf.findById(turfId);
    if (!turf) {
      return res.status(404).json({ message: "Turf not found" });
    }

    // Get user email from token later (for now use dummy or frontend)
    const userEmail = req.body.userEmail || "guest@playspots.com";

    const newBooking = new Booking({
      turfName: turf.name,
      date,
      time,
      userEmail,
    });

    await newBooking.save();
    console.log("✅ New booking saved:", newBooking);
    res.status(201).json({ message: "Booking successful!" });
  } catch (error) {
    console.error("❌ Booking Error:", error);
    res.status(500).json({ message: "Server error while booking" });
  }
});

// 🔵 Get all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
});
// Cancel a booking
router.delete("/:id", async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking canceled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete booking" });
  }
});

module.exports = router;
