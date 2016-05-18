
module.exports = SocketService;

var socketio = require('socket.io-client');
var EventEmmiter = require('events');

SocketService.$inject = [];

function SocketService() {    
    
    var observer = new EventEmmiter();
    var socketId;
    var socket = socketio();
    var conStatus = false;
        
    socket.on('connect', function() {
        conStatus = true;
    })
    
     socket.on('disconnect', function() {
        conStatus = false;
    })
    
    socket.on('entrar', function(data) {
        socketId = JSON.parse(data).nomeLogado;
    });
    
    var service = {
        start: start,
        isConnected: isConnected,
        getSocketId: getSocketId
    };
        
    return service;

    ////////////////
    function start() {
        socket = socketio();
    }
    
    function isConnected() {        
        return conStatus;        
    }
    
    function getSocketId() {
        if (conStatus && socketId) {
            return socketId
        } else {
            return false;
        }
    }
}
