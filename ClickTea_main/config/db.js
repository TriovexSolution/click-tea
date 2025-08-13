const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,      // Max number of connections
  queueLimit: 0             // 0 = unlimited queued requests
});

// Export promise-based pool
module.exports = pool.promise();
