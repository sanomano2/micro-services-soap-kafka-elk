const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const pool = require('./db');
const sendSOAPMessage = require('./soapClient');
const sendKafkaMessage = require('./kafkaProducer');
const axios = require('axios'); // Используем axios для HTTP-запросов

const app = express();
const PORT = 3000;

// Настройка логгера для отправки логов в Logstash через HTTP
const logToLogstash = (message, level = 'info') => {
  axios.post('http://logstash:5044', {
    message: message,
    level: level,
    timestamp: new Date().toISOString(),
    service: 'auth-service'
  }).catch(err => {
    console.error('Ошибка отправки логов в Logstash:', err.message);
  });
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Эндпоинт регистрации
app.post('/register', async (req, res) => {
  const { login, password } = req.body;
  try {
    await pool.query('INSERT INTO users (login, password) VALUES ($1, $2)', [login, password]);
    logToLogstash(`User registered: ${login}`, 'info'); // Логирование регистрации в Logstash
    res.send('Регистрация успешна');
  } catch (err) {
    logToLogstash(`Ошибка регистрации: ${err.message}`, 'error'); // Логирование ошибки в Logstash
    res.send('Ошибка регистрации');
  }
});

// Эндпоинт авторизации
app.post('/login', async (req, res) => {
  const { login, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE login = $1 AND password = $2', [login, password]);
    if (result.rows.length > 0) {
      logToLogstash(`User logged in: ${login}`, 'info'); // Логирование успешной авторизации в Logstash

      // Отправляем SOAP-сообщение
      sendSOAPMessage({ login });

      // Отправляем сообщение в Kafka
      sendKafkaMessage('User-Logins', JSON.stringify({ login, timestamp: new Date() }));

      res.send('Авторизация успешна');
    } else {
      logToLogstash(`Неверные учетные данные для: ${login}`, 'warn'); // Логирование неверных данных в Logstash
      res.send('Неверные учетные данные');
    }
  } catch (err) {
    logToLogstash(`Ошибка авторизации: ${err.message}`, 'error'); // Логирование ошибки в Logstash
    res.send('Ошибка авторизации');
  }
});

app.listen(PORT, () => {
  logToLogstash(`Auth Service запущен на http://localhost:${PORT}`, 'info'); // Логирование запуска сервиса в Logstash
  console.log(`Auth Service запущен на http://localhost:${PORT}`);
});