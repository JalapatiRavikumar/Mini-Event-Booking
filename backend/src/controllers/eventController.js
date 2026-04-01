const eventModel = require("../models/eventModel");
const asyncHandler = require("../utils/asyncHandler");
const { validateCreateEventInput } = require("../utils/validation");

const getEvents = asyncHandler(async (req, res) => {
  const events = await eventModel.getUpcomingEvents();
  res.status(200).json({
    success: true,
    data: events
  });
});

const createEvent = asyncHandler(async (req, res) => {
  const validated = validateCreateEventInput(req.body);
  const created = await eventModel.createEvent(validated);

  res.status(201).json({
    success: true,
    message: "Event created successfully",
    data: created
  });
});

module.exports = {
  getEvents,
  createEvent
};
