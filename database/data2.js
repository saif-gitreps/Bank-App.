const mysql2 = require("mysql2/promise");

const pool = mysql2.createPool({
   host: "localhost",
   database: "bank",
   user: "root",
   password: "CSE123",
});

module.exports = pool;
