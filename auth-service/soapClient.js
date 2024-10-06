const soap = require('soap');

const url = 'http://localhost:5000/wsdl?wsdl'; // Адрес второго микросервиса

function sendSOAPMessage(data) {
  soap.createClient(url, function(err, client) {
    if (err) {
      console.error('Ошибка создания SOAP-клиента:', err);
    } else {
      client.processLogin(data, function(err, result) {
        if (err) {
          console.error('Ошибка отправки SOAP-сообщения:', err);
        } else {
          console.log('Ответ от SOAP-сервиса:', result);
        }
      });
    }
  });
}

module.exports = sendSOAPMessage;