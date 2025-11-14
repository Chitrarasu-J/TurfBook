const express = require("express");
const router = express.Router();
const Turf = require("../models/Turf");

// 🟢 Add new turf
router.post("/", async (req, res) => {
  try {
    const { name, location, image } = req.body;
    const newTurf = new Turf({ name, location, image });
    await newTurf.save();
    res.status(201).json({ success: true, message: "Turf added successfully" });
  } catch (err) {
    console.error("Add Turf Error:", err);
    res.status(500).json({ success: false, message: "Server error adding turf" });
  }
});

// 🔵 Get all turfs
router.get("/", async (req, res) => {
  try {
    const turfs = await Turf.find();
    res.json(turfs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching turfs" });
  }
});

// 🔴 Delete turf
router.delete("/:id", async (req, res) => {
  try {
    await Turf.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Turf deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting turf" });
  }
});

module.exports = router;
