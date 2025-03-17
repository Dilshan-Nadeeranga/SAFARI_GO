const router = require("express").Router();
let Booking = require("../models/Booking");

// Create a booking
// http://localhost:8070/Booking/add
router.route("/add").post((req, res) => {
    const Fname = req.body.Fname;
    const Lname = req.body.Lname;
    const Phonenumber1 = Number(req.body.Phonenumber1); // Fixed issue
    const email = req.body.email;

    const newBooking = new Booking({
        Fname,
        Lname,
        Phonenumber1,
        email
    });

    newBooking.save()
        .then(() => {
            res.json("Booking Added");
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err.message });
        });
});

// View bookings
// http://localhost:8070/Booking
router.route("/").get((req, res) => {
    Booking.find()
        .then((bookings) => {
            res.json(bookings);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err.message });
        });
});

// Update booking
// http://localhost:8070/Booking/update/:bookingid
router.route("/update/:bookingid").put(async (req, res) => {
    let bookingId = req.params.bookingid;
    const { Fname, Lname, Phonenumber1, email } = req.body;

    const updateBooking = {
        Fname,
        Lname,
        Phonenumber1,
        email
    };

    try {
        const update = await Booking.findByIdAndUpdate(bookingId, updateBooking, { new: true });
        res.status(200).send({ status: "Booking Updated", user: update });
    } catch (err) {
        console.log(err);
        res.status(500).send({ status: "Error updating data", error: err.message });
    }
});

// Delete booking
// http://localhost:8070/Booking/delete/:bookingid
router.route("/delete/:bookingid").delete(async (req, res) => {
    let bookingId = req.params.bookingid;

    try {
        await Booking.findByIdAndDelete(bookingId);
        res.status(200).send({ status: "Booking Deleted" });
    } catch (err) {
        console.log(err);
        res.status(500).send({ status: "Error deleting data", error: err.message });
    }
});

module.exports = router;
