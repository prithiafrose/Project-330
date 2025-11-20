const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();
// MySQL database connection
const sequelize = new Sequelize( process.env.DB_NAME, // database name
 process.env.DB_USER, // username
  process.env.DB_PASSWORD, // password
  {
    host: process.env.DB_HOST, dialect: 'mysql', // mysql / postgres / sqlite / mssql
    logging: true, // optional: disable console
 } );
module.exports = sequelize;