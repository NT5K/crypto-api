const mysql = require('mysql');
require('dotenv').config()

let connection;

connection = mysql.createConnection({
    host: process.env.J_DB_HOST,
    user: process.env.J_DB_USER,
    password: process.env.J_DB_PASSWORD,
    database: process.env.J_DB_DATABASE,
    port: process.env.J_DB_PORT
});

module.exports = connection;