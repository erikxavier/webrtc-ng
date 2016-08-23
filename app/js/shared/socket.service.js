
module.exports = SocketService;

var socketio = require('socket.io-client');
var events = require('events');

SocketService.$inject = [];

function SocketService() {    
    
    var service = new events.EventEmitter(); //Instancia um emissor de eventos
 
    service.isConnected = false;

    var socket = socketio(); //Instancia e conecta o socketio
        
    socket.on('connect', function() {
        service.isConnected = true;
    });
    
     socket.on('disconnect', function() {
        service.isConnected = false;
    });
    
    //Avisa qual é o seu socketId
    socket.on('entrar', function(data) {
        service.localCode = JSON.parse(data).nomeLogado;
        console.log(service.localCode);
        service.emit('entrar', service.localCode);
    });

    //Avisa quando um pacote do tipo 'chamada' é recebido do servidor
    socket.on('chamada', function(data) {
        service.emit('chamada', data);
    })

    //Atribui o socketId do computador remoto
    service.setRemoteCode = function(socketId) {
        service.remoteCode = socketId;
    }

    //Avisa alteração na lista de espera
    socket.on('lista-espera', function(data) {
        service.emit('lista-espera');
    })

    //Monta um pacote padronizado com informações da chamada e envia para o servidor
    service.sendCallData = function(callData) {
        var msg = {
            para: service.remoteCode,
            dados:
            { de: service.localCode,
              msg: callData
            }
        }
        socket.emit('chamada', JSON.stringify(msg));
    }
        
    return service;
}
