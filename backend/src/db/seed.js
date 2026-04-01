const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const pool = require("./pool");

dotenv.config();

async function runSeed() {
  try {
    const schemaPath = path.join(__dirname, "..", "..", "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    const statements = schemaSql
      .split(/;\s*[\r\n]+/g)
      .map((statement) => statement.trim())
      .filter(Boolean);

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      for (const statement of statements) {
        await connection.query(statement);
      }

      await connection.query(
        `
        INSERT INTO users (name, email) VALUES
          ('Alice Johnson', 'alice@example.com'),
          ('Bob Smith', 'bob@example.com'),
          ('Carla Diaz', 'carla@example.com')
        ON DUPLICATE KEY UPDATE name = VALUES(name)
      `
      );

      await connection.query(
        `
        INSERT INTO events (title, description, date, total_capacity, remaining_tickets) VALUES
          ('Node.js Conference', 'Backend architecture and scalability', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY), 200, 200),
          ('Cloud Dev Summit', 'Cloud-native app development', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 14 DAY), 150, 150),
          ('Database Performance Workshop', 'MySQL indexing and query tuning', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 21 DAY), 100, 100)
      `
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    console.log("Database schema applied and seed data inserted.");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();
