const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8070;

app.use((err, req, res, next) => {
  console.error("Global error:", err.stack);
  res.status(500).json({ message: "Something broke!" });
});

// ✅ Apply CORS middleware before routes
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Other middlewares
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ MongoDB connection
const URL = process.env.MONGODB_URL;
mongoose.connect(URL, {
});
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("Mongodb connection success!");
});


const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/Booking');
const feedbackRoutes = require('./routes/feedbackRoutes');


=======
app.use("/vehicles", vehicleRoutes);
app.use("/admin", adminRoutes);
app.use("/users", userRoutes);
app.use("/bookings", bookingRoutes);


// ✅ Start server
app.listen(PORT, () => {
