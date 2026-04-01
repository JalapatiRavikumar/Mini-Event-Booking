const express = require("express");
const bookingController = require("../controllers/bookingController");

const router = express.Router();

router.get("/:id/bookings", bookingController.getUserBookings);

module.exports = router;
