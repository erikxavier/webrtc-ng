module.exports = PeerConnectionService;
var PeerConnection = require('rtcpeerconnection');
var EventEmmiter = require('events');

PeerConnectionService.$inject = ['SocketService'];

function PeerConnectionService(SocketService) {
    var constraints = {audio:false, video:true};
    var ice = {"iceServers": [
        {"url": "stun:stun.l.google.com:19302"}
    ]};

    var service = new EventEmmiter();

    service.PeerConnection = new PeerConnection();

    service.PeerConnection.on('ice', function(candidate) {
        service.emit('chamada', candidate);   
    });

    service.PeerConnection.on('addStream', function (event) {        
        service.emit('streamAdded', URL.createObjectURL(event.stream));        
    });    

    service.PeerConnection.on('endOfCandidates', function() {
        service.emit('endOfCandidates');
    })

    service.handleCallData = function(data) {
        var chamada = JSON.parse(data);
        if (chamada.dados.msg.type == "offer") {
            SocketService.remoteCode = chamada.dados.de;
            pc.handleOffer(chamada.dados.msg, function(err) {
                if (err) console.log(err)
                else {
                    pc.answer(function (err, answer) {
                        if (err) console.log(err)
                        else {
                            service.emit('chamada', 
                                JSON.stringify(
                                    {para: SocketService.remoteCode, 
                                    dados: {de: SocketService.localCode, msg: answer}
                                }));                            
                        }
                    })
                }
            }) 
            } else if (chamada.dados.msg.type == "answer") {
                pc.handleAnswer(chamada.dados.msg);
            } else {        
                pc.processIce(chamada.dados.msg);
            }        
        }
    

    return service;
}