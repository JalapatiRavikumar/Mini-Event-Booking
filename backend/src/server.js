const dotenv = require("dotenv");
const app = require("./app");
const pool = require("./db/pool");
const initSchemaIfNeeded = require("./db/initSchema");

dotenv.config();

const port = Number(process.env.PORT || 3000);

async function startServer() {
  try {
    await initSchemaIfNeeded();
    await pool.query("SELECT 1");
    const server = app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
    server.on("error", (error) => {
      if (error && error.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use. Stop the running server and try again.`);
        return;
      }
      console.error("Server failed:", error);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
