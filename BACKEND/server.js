//BACKEND/server.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const path = require('path');
require("dotenv").config();

const PORT = process.env.PORT || 8070;

app.use(cors());
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3000" }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const URL = process.env.MONGODB_URL;

mongoose.connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true, 
});

const connection = mongoose.connection;
connection.once("open", () => {
    console.log("Mongodb connection success!");
});

//Models
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/Booking');

    //http://Localhost:8070/Booking
    app.use('/users', userRoutes);
    app.use('/bookings', bookingRoutes);

app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
});
