const mysql = require('mysql2/promise');

let pool = null;

exports.createPool = async function () {
    pool = mysql.createPool({
        multipleStatements: true,
        host: process.env.SENG365_MYSQL_HOST_LOCAL,
        user: process.env.SENG365_MYSQL_USER_LOCAL,
        password: process.env.SENG365_MYSQL_PASSWORD_LOCAL,
        database: process.env.SENG365_MYSQL_DATABASE_LOCAL,
        port: process.env.SENG365_MYSQL_PORT || 3306
    });
};

exports.getPool = function () {
    return pool;
};
