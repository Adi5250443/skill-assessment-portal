const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "cais-iat-db.cdqe6ioqohfe.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "1gspP<GS..f51MNnRp0]Ci{EgBsi",
  database: "channel_play",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
