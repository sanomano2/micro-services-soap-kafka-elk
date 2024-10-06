const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',        // Замените на ваше имя пользователя
  host: 'try2-db-1',
  database: 'auth_db',     // Замените на ваше имя базы данных
  password: 'password',    // Замените на ваш пароль
  port: 5432,
});

module.exports = pool;