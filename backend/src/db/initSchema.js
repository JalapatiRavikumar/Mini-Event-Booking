const fs = require("fs/promises");
const path = require("path");
const mysql = require("mysql2/promise");

function splitSqlStatements(sqlContent) {
  return sqlContent
    .split(/;\s*$/gm)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function seedDemoDataIfEmpty(connection) {
  const [[usersCountRow]] = await connection.query(
    "SELECT COUNT(*) AS total FROM users"
  );
  const [[eventsCountRow]] = await connection.query(
    "SELECT COUNT(*) AS total FROM events"
  );

  if (Number(usersCountRow.total) === 0) {
    await connection.query(
      `
      INSERT INTO users (name, email) VALUES
        ('Alice Johnson', 'alice@example.com'),
        ('Bob Smith', 'bob@example.com'),
        ('Carla Diaz', 'carla@example.com')
    `
    );
  }

  if (Number(eventsCountRow.total) === 0) {
    await connection.query(
      `
      INSERT INTO events (title, description, date, total_capacity, remaining_tickets) VALUES
        ('Node.js Conference', 'Backend architecture and scalability', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY), 200, 200),
        ('Cloud Dev Summit', 'Cloud-native app development', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 14 DAY), 150, 150),
        ('Database Performance Workshop', 'MySQL indexing and query tuning', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 21 DAY), 100, 100)
    `
    );
  }
}

async function initSchemaIfNeeded() {
  const host = process.env.DB_HOST || "localhost";
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME || "event_booking";
  const shouldSeedDemoData =
    process.env.ENABLE_DEMO_SEED === "true" ||
    (process.env.ENABLE_DEMO_SEED === undefined && process.env.NODE_ENV !== "production");
  const schemaPath = path.join(__dirname, "..", "..", "schema.sql");

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: false
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    await connection.query(`USE \`${database}\``);

    const [rows] = await connection.query("SHOW TABLES LIKE 'events'");
    if (!Array.isArray(rows) || rows.length === 0) {
      const schemaSql = await fs.readFile(schemaPath, "utf8");
      const statements = splitSqlStatements(schemaSql);

      for (const statement of statements) {
        await connection.query(statement);
      }

      console.log("Database schema initialized.");
    }

    if (shouldSeedDemoData) {
      await seedDemoDataIfEmpty(connection);
    }
  } finally {
    await connection.end();
  }
}

module.exports = initSchemaIfNeeded;
