const pool = require("../db/pool");
const userModel = require("../models/userModel");
const eventModel = require("../models/eventModel");
const bookingModel = require("../models/bookingModel");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { generateBookingCode } = require("../utils/bookingCode");
const {
  validateCreateBookingInput,
  validateUserIdParam
} = require("../utils/validation");

async function insertBookingWithUniqueCode(connection, userId, eventId) {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const bookingCode = generateBookingCode();
    try {
      return await bookingModel.createBooking(connection, {
        userId,
        eventId,
        bookingCode
      });
    } catch (error) {
      if (error && error.code === "ER_DUP_ENTRY" && attempt < maxAttempts) {
        continue;
      }
      throw error;
    }
  }

  throw new HttpError(500, "Failed to generate a unique booking code");
}

const createBooking = asyncHandler(async (req, res) => {
  const { userId, eventId } = validateCreateBookingInput(req.body);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const user = await userModel.getUserById(connection, userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const event = await eventModel.getEventByIdForUpdate(connection, eventId);
    if (!event) {
      throw new HttpError(404, "Event not found");
    }

    if (event.remaining_tickets <= 0) {
      throw new HttpError(400, "No remaining tickets for this event");
    }

    const booking = await insertBookingWithUniqueCode(connection, userId, eventId);
    const affectedRows = await eventModel.decrementRemainingTickets(connection, eventId);

    if (affectedRows !== 1) {
      throw new HttpError(500, "Failed to update remaining tickets");
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        booking_id: booking.id,
        booking_code: booking.booking_code,
        user_id: booking.user_id,
        event_id: booking.event_id
      }
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

const getUserBookings = asyncHandler(async (req, res) => {
  const userId = validateUserIdParam(req.params.id);
  const user = await userModel.getUserById(null, userId);

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  const bookings = await bookingModel.getBookingsByUserId(userId);
  res.status(200).json({
    success: true,
    data: {
      user,
      bookings
    }
  });
});

module.exports = {
  createBooking,
  getUserBookings
};
