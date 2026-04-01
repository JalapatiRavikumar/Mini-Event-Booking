const HttpError = require("./httpError");

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function validateCreateEventInput(payload) {
  const { title, description, date, total_capacity: totalCapacity } = payload;

  if (!title || typeof title !== "string" || !title.trim()) {
    throw new HttpError(400, "title is required and must be a non-empty string");
  }

  if (description !== undefined && typeof description !== "string") {
    throw new HttpError(400, "description must be a string");
  }

  if (!date || typeof date !== "string") {
    throw new HttpError(400, "date is required and must be a valid ISO date string");
  }

  const eventDate = new Date(date);
  if (Number.isNaN(eventDate.getTime())) {
    throw new HttpError(400, "date must be a valid date");
  }

  const parsedCapacity = Number(totalCapacity);
  if (!isPositiveInteger(parsedCapacity)) {
    throw new HttpError(400, "total_capacity is required and must be a positive integer");
  }

  return {
    title: title.trim(),
    description: description ? description.trim() : null,
    date: eventDate,
    totalCapacity: parsedCapacity
  };
}

function validateCreateBookingInput(payload) {
  const { user_id: userId, event_id: eventId } = payload;
  const parsedUserId = Number(userId);
  const parsedEventId = Number(eventId);

  if (!isPositiveInteger(parsedUserId)) {
    throw new HttpError(400, "user_id is required and must be a positive integer");
  }

  if (!isPositiveInteger(parsedEventId)) {
    throw new HttpError(400, "event_id is required and must be a positive integer");
  }

  return {
    userId: parsedUserId,
    eventId: parsedEventId
  };
}

function validateAttendanceInput(payload) {
  const { booking_code: bookingCode } = payload;

  if (!bookingCode || typeof bookingCode !== "string" || !bookingCode.trim()) {
    throw new HttpError(400, "booking_code is required and must be a non-empty string");
  }

  return {
    bookingCode: bookingCode.trim()
  };
}

function validateUserIdParam(value) {
  const parsed = Number(value);
  if (!isPositiveInteger(parsed)) {
    throw new HttpError(400, "user id must be a positive integer");
  }
  return parsed;
}

function validateEventIdParam(value) {
  const parsed = Number(value);
  if (!isPositiveInteger(parsed)) {
    throw new HttpError(400, "event id must be a positive integer");
  }
  return parsed;
}

module.exports = {
  validateCreateEventInput,
  validateCreateBookingInput,
  validateAttendanceInput,
  validateUserIdParam,
  validateEventIdParam
};
