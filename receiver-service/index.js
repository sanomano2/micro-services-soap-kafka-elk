const express = require('express');
const soap = require('soap');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

const service = require('./soapService');
const xml = fs.readFileSync(path.join(__dirname, 'service.wsdl'), 'utf8');

app.listen(PORT, () => {
  soap.listen(app, '/wsdl', service, xml, () => {
    console.log(`Receiver Service запущен на http://localhost:${PORT}`);
  });
});