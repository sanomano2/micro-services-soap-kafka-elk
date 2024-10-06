const kafka = require('kafka-node');

function sendKafkaMessage(topic, message) {
  try {
    const client = new kafka.KafkaClient({ kafkaHost: 'kafka:9092' });
    const producer = new kafka.Producer(client);

    producer.on('ready', function() {
      const payloads = [{ topic: topic, messages: message }];
      producer.send(payloads, function(err, data) {
        if (err) {
          console.error('Ошибка при отправке сообщения в Kafka:', err);
        } else {
          console.log('Сообщение отправлено в Kafka:', data);
        }
        producer.close();
      });
    });

    producer.on('error', function(err) {
      console.error('Ошибка Kafka Producer:', err);
    });
  } catch (err) {
    console.error('Kafka недоступна, пропускаем этот шаг:', err);
  }
}

module.exports = sendKafkaMessage;