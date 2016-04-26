'use strict';
var express = require('express');
var app = express();
var http = require('http');
var https = require('https');
var fs = require('fs');

const certificados = {
    key: fs.readFileSync(__dirname +'/privatekey.key'),
    cert: fs.readFileSync(__dirname +'/certificate.crt')
};

app.use(express.static('app'));
var server = http.createServer(app);
var httpsServer = https.createServer(certificados, app);


var signaling = require('./signaling.js')(httpsServer);
var port = process.env.PORT || 80;
var httpsPort = process.env.HTTPS_PORT || 443;
server.listen(port, function () {
    console.log("Servidor web rodando na porta "+port);
});

httpsServer.listen(httpsPort, function() {
    console.log("Servidor HTTPS rodando na porta "+httpsPort);
});