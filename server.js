/// <reference path="typings/node/node.d.ts"/>
'use strict';

var express = require('express');
var app = express();
var http = require('http');

app.use(express.static('app/public'));
var server = http.createServer(app);


var signaling = require('./signaling.js')(server);

server.listen(process.env.PORT || 8000);