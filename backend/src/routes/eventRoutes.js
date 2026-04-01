const express = require("express");
const eventController = require("../controllers/eventController");
const attendanceController = require("../controllers/attendanceController");

const router = express.Router();

router.get("/", eventController.getEvents);
router.post("/", eventController.createEvent);
router.post("/:id/attendance", attendanceController.markAttendance);

module.exports = router;
