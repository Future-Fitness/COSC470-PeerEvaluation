const { Sequelize } = require('sequelize');
const mysql = require('mysql2');
require('dotenv').config({ path: __dirname + '/.env' });

const db = new Sequelize({
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT),
  dialect: 'mysql',
  dialectModule: mysql,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

console.log('Testing connection to Aiven MySQL...');

db.authenticate()
  .then(() => {
    console.log('✅ Successfully connected to Aiven MySQL!');
    return db.close();
  })
  .then(() => {
    console.log('✅ Connection closed');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
