
module.exports = SocketService;

var socketio = require('socket.io-client');
var EventEmmiter = require('events');

SocketService.$inject = [];

function SocketService() {    
    
    var service = new EventEmmiter();
    var socket = socketio();
    
    service.isConnected = false;
    var socket = socketio();
        
    socket.on('connect', function() {
        service.isConnected = true;
    });
    
     socket.on('disconnect', function() {
        service.isConnected = false;
    });
    
    socket.on('entrar', function(data) {
        service.localCode = JSON.parse(data).nomeLogado;
        console.log(service.localCode);
    });

    socket.on('chamada', function(data) {
        service.emit('chamada', data);
    })

    service.call = function(callData) {
        socket.emit('chamada', callData);
    }
        
    return service;
}
