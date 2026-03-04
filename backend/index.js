// ✅ Load environment variables
require("dotenv").config();

// ✅ Import dependencies
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

// ✅ Initialize Express app & HTTP server
const app = express();
const server = http.createServer(app);

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Import routes
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const turfRoutes = require("./routes/turfRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");

// ✅ Use routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/turf", turfRoutes);
app.use("/api/admin-auth", adminAuthRoutes);

// ✅ Socket.io setup
const io = new Server(server, {
  cors: { origin: "*" },
});

// ✅ Socket.io events
io.on("connection", (socket) => {
  console.log("🟢 Admin or Client connected via Socket.io");

  socket.on("disconnect", () => {
    console.log("🔴 A client disconnected");
  });
});

// ✅ Booking Model
const Booking = require("./models/Booking");

// ✅ POST route for creating a booking
app.post("/api/bookings/create", async (req, res) => {
  try {
    const { turfName, date, time, userEmail } = req.body;
    if (!turfName || !date || !time || !userEmail) {
      return res.status(400).json({ message: "All fields required" });
    }

    const booking = new Booking({ turfName, date, time, userEmail });
    await booking.save();

    // 🔥 Notify admin in real time
    io.emit("newBooking", { turfName, date, time, userEmail });

    res.status(201).json({ message: "Booking Successful!" });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: "Booking Failed" });
  }
});

// ✅ Admin Stats API
app.get("/api/admin/stats", async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const todayBookings = await Booking.countDocuments({
      date: {
        $gte: new Date().toISOString().split('T')[0]
      }
    });
    
    const statsData = {
      totalBookings: Number(totalBookings),
      todayBookings: Number(todayBookings),
      pendingBookings: 0
    };
    
    console.log('Stats API response:', statsData);
    res.json(statsData);
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "Failed to get stats" });
  }
});

// ✅ Root API
app.get("/", (req, res) => {
  res.send("Backend Connected Successfully ✅");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
