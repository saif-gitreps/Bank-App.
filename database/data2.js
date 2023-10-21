const mysql = require("mysql2/promise");

const pool = mysql.createPool({
   host: "localhost",
   database: "bank_app",
   user: "root",
   password: "CSE123",
});

module.exports = pool;
