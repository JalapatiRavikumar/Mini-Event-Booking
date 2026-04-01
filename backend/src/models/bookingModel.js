const pool = require("../db/pool");

async function createBooking(connection, { userId, eventId, bookingCode }) {
  const query = `
    INSERT INTO bookings (user_id, event_id, booking_code)
    VALUES (?, ?, ?)
  `;
  const [result] = await connection.query(query, [userId, eventId, bookingCode]);

  return {
    id: result.insertId,
    user_id: userId,
    event_id: eventId,
    booking_code: bookingCode
  };
}

async function getBookingsByUserId(userId) {
  const query = `
    SELECT
      b.id AS booking_id,
      b.booking_date,
      b.booking_code,
      e.id AS event_id,
      e.title AS event_title,
      e.description AS event_description,
      e.date AS event_date,
      e.total_capacity,
      e.remaining_tickets
    FROM bookings b
    INNER JOIN events e ON e.id = b.event_id
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC
  `;
  const [rows] = await pool.query(query, [userId]);
  return rows;
}

async function getBookingByCode(connectionOrPool, bookingCode, eventId) {
  const executor = connectionOrPool || pool;
  const query = `
    SELECT
      b.id,
      b.user_id,
      b.event_id,
      b.booking_date,
      b.booking_code
    FROM bookings b
    WHERE b.booking_code = ? AND b.event_id = ?
    LIMIT 1
  `;
  const [rows] = await executor.query(query, [bookingCode, eventId]);
  return rows[0] || null;
}

module.exports = {
  createBooking,
  getBookingsByUserId,
  getBookingByCode
};
