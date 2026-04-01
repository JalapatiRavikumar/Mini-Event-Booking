async function createAttendance(connection, bookingId) {
  const query = `
    INSERT INTO attendance (booking_id)
    VALUES (?)
  `;
  const [result] = await connection.query(query, [bookingId]);
  return {
    id: result.insertId,
    booking_id: bookingId
  };
}

module.exports = {
  createAttendance
};
