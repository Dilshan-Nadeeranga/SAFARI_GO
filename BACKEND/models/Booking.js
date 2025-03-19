const mongoose = require('mongoose');
//hello world hi hi hi
//hi hi
const Schema = mongoose.Schema;
//hellooo
const CustomerBookingSchema = new Schema({
    
    Fname: {
        type: String,
        required: true,
    },
    Lname: {
        type: String,
        required:  true,
    },
    Phonenumber1: {
        type: Number,
        required:  false,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensure that email is unique
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address'], // Basic email validation
    }
})

const Booking = mongoose.model("Booking",CustomerBookingSchema);
module.exports = Booking;

