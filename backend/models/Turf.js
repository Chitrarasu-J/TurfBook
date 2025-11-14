const mongoose = require("mongoose");

const turfSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  image: { type: String, required: true },
});

module.exports = mongoose.model("Turf", turfSchema);
