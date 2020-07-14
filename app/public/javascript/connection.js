const mysql = require('mysql');
require('dotenv').config()

let connection;

// if (process.env.JAWSDB_URL) {
//     connection = mysql.createConnection(process.env.JAWSDB_URL)
// } else {
    connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,  
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT
    });
// };

module.exports = connection;