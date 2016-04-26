var angular = require('angular');
require('../lib/getScreenId');

angular.module('WebRTC-NG', [])
    .controller('CtrlSuporte', require('./controller/suporte.controller'));