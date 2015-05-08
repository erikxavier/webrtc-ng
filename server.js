'use strict';

var express = require('express');
var app = express();

app.use(express.static('app/public'));
var server = app.listen(8080);