const pool = require("../db/pool");
const eventModel = require("../models/eventModel");
const bookingModel = require("../models/bookingModel");
const attendanceModel = require("../models/attendanceModel");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const {
  validateAttendanceInput,
  validateEventIdParam
} = require("../utils/validation");

const markAttendance = asyncHandler(async (req, res) => {
  const eventId = validateEventIdParam(req.params.id);
  const { bookingCode } = validateAttendanceInput(req.body);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const event = await eventModel.getEventByIdForUpdate(connection, eventId);
    if (!event) {
      throw new HttpError(404, "Event not found");
    }

    const booking = await bookingModel.getBookingByCode(connection, bookingCode, eventId);
    if (!booking) {
      throw new HttpError(404, "Booking not found for this event");
    }

    const attendance = await attendanceModel.createAttendance(connection, booking.id);
    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: {
        attendance_id: attendance.id,
        booking_id: booking.id,
        booking_code: booking.booking_code,
        user_id: booking.user_id,
        event_id: booking.event_id,
        tickets_booked: 1
      }
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

module.exports = {
  markAttendance
};
