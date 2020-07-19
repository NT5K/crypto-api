const mysql = require('mysql');
require('dotenv').config()

let connection;

connection = mysql.createConnection({
    host: process.env.AWS2_DB_HOST,
    user: process.env.AWS2_DB_USER,
    password: process.env.AWS2_DB_PASSWORD,
    database: process.env.AWS2_DB_DATABASE,
    port: process.env.AWS2_DB_PORT
});

module.exports = connection;