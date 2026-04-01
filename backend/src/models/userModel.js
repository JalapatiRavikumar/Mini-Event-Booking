const pool = require("../db/pool");

async function getUserById(connectionOrPool, userId) {
  // Support both signatures:
  // - getUserById(connection, userId)
  // - getUserById(userId)
  let executor = pool;
  let targetUserId = userId;

  if (typeof connectionOrPool === "number" || typeof connectionOrPool === "string") {
    targetUserId = connectionOrPool;
  } else if (connectionOrPool) {
    executor = connectionOrPool;
  }

  const [rows] = await executor.query(
    "SELECT id, name, email FROM users WHERE id = ?",
    [targetUserId]
  );
  return rows[0] || null;
}

module.exports = {
  getUserById
};
