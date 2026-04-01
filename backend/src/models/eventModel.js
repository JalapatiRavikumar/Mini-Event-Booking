const pool = require("../db/pool");

async function getUpcomingEvents() {
  const query = `
    SELECT id, title, description, date, total_capacity, remaining_tickets
    FROM events
    WHERE date >= UTC_TIMESTAMP()
    ORDER BY date ASC
  `;
  const [rows] = await pool.query(query);
  return rows;
}

async function createEvent({ title, description, date, totalCapacity }) {
  const query = `
    INSERT INTO events (title, description, date, total_capacity, remaining_tickets)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(query, [
    title,
    description,
    date,
    totalCapacity,
    totalCapacity
  ]);

  return {
    id: result.insertId,
    title,
    description,
    date,
    total_capacity: totalCapacity,
    remaining_tickets: totalCapacity
  };
}

async function getEventByIdForUpdate(connection, eventId) {
  const query = `
    SELECT id, title, date, total_capacity, remaining_tickets
    FROM events
    WHERE id = ?
    FOR UPDATE
  `;
  const [rows] = await connection.query(query, [eventId]);
  return rows[0] || null;
}

async function decrementRemainingTickets(connection, eventId) {
  const query = `
    UPDATE events
    SET remaining_tickets = remaining_tickets - 1
    WHERE id = ? AND remaining_tickets > 0
  `;
  const [result] = await connection.query(query, [eventId]);
  return result.affectedRows;
}

module.exports = {
  getUpcomingEvents,
  createEvent,
  getEventByIdForUpdate,
  decrementRemainingTickets
};
