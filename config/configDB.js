const { Pool } = require ('pg');
require('dotenv').config();

const { DB_PASSWORD, DB_USER, DB_NAME, DB_HOST, DB_PORT } = process.env;

const config = {
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT,
};

const pool = new Pool(config);

module.exports = pool;