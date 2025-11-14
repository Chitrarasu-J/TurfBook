const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  turfName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  userEmail: { type: String, required: true },
});

module.exports = mongoose.model("Booking", bookingSchema);
