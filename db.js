// =============================================
//   db.js — MySQL connection setup
// =============================================
// This connects to the MySQL database container. Since containers
// can start in any order, and MySQL takes a few seconds to become
// ready, this includes retry logic — a real pattern you'll see a
// lot once your trainer covers docker-compose and multi-container
// startup ordering.

const mysql = require('mysql2/promise');

// --- CONFIG ---
// These values come from environment variables when possible, with
// sensible defaults for local testing without Docker. When your
// trainer introduces docker-compose tomorrow, DB_HOST will typically
// become the service name defined in docker-compose.yml (e.g. "database")
// instead of "localhost".
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'confession_wall',
};

let pool = null;

/**
 * Attempts to connect to MySQL, retrying a few times if it's not
 * ready yet (common right after `docker run`, since MySQL takes a
 * moment to initialize before it accepts connections).
 */
async function connectWithRetry(retries = 10, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      pool = mysql.createPool(DB_CONFIG);
      // Test the connection actually works before considering it successful
      await pool.query('SELECT 1');
      console.log('Connected to MySQL database.');
      return pool;
    } catch (err) {
      console.log(`Database not ready yet (attempt ${attempt}/${retries}): ${err.message}`);
      if (attempt === retries) {
        console.error('Could not connect to database after multiple attempts. Exiting.');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

module.exports = { connectWithRetry, getPool: () => pool };
