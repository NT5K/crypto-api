const mysql = require('mysql');
require('dotenv').config()

let connection;

connection = mysql.createConnection({
    host: process.env.AWS_DB_HOST,
    user: process.env.AWS_DB_USER,
    password: process.env.AWS_DB_PASSWORD,
    database: process.env.AWS_DB_DATABASE,
    port: process.env.AWS_DB_PORT
});

module.exports = connection;