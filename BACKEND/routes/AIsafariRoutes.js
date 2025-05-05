const express = require("express");
const router = express.Router();
const { planSafari } = require("../controllers/AISafariController");

router.post("/plan", planSafari);

module.exports = router;