module.exports = PeerConnectionService;

var PeerConnection = require('rtcpeerconnection');
var events = require('events');

PeerConnectionService.$inject = ['$q', 'SocketService'];

function PeerConnectionService($q, SocketService) {
    var ice = {"iceServers": [
        {"url": "stun:stun.l.google.com:19302"}
    ]};

    var service = new events.EventEmitter(); //Instancia um emissor de eventos
    var peerConnection;

    //Fecha a conexão se houver alguma, instancia um novo PeerConnection e atribui os emissores do serviço aos listeners do PeerConnection
    service.openConnection = function() {
        if (peerConnection) {
            peerConnection.close();
        }
        peerConnection = new PeerConnection();

        peerConnection.on('ice', function(candidate) {
            service.emit('chamada', candidate);   
        });

        peerConnection.on('addStream', function (event) {
            event.stream.getTracks().forEach(function(track) {
                if (track.kind === 'audio') {
                    service.emit('audioStreamAdded', URL.createObjectURL(event.stream));
                } else if (track.kind === 'video') {
                    service.emit('videoStreamAdded', URL.createObjectURL(event.stream));
                }
            });            
            //console.log(event.stream.getTracks());        
            //service.emit('streamAdded', URL.createObjectURL(event.stream));        
        });    

        peerConnection.on('endOfCandidates', function() {
            service.emit('endOfCandidates');
        });        
    }

    //Adiciona um MediaStream ao PeerConnection
    service.addStream = function(stream) {
        return $q(function(resolve, reject) {
            peerConnection.addStream(stream);
            resolve();
        });
    };

    //Cria uma oferta SDP
    service.createOffer = function() {
        var defered = $q.defer();
        var constraints = {

                offerToReceiveAudio: true,
                offerToReceiveVideo: true

        }
        peerConnection.offer(constraints, function(error, offer) {
            if (error) {
                defered.reject(error);
            } else {
                defered.resolve(offer);
            }
        });

        return defered.promise;
    };


    //Resolve pacotes SDP, de oferta, de resposta ou ICE
    service.handleCallData = function(data) {
        var constraints = {
                offerToReceiveAudio: true
        }
        var chamada = JSON.parse(data);
        if (chamada.dados.msg.type == "offer") {
            SocketService.setRemoteCode(chamada.dados.de);
            peerConnection.handleOffer(chamada.dados.msg, function(err) {
                if (err) service.emit('handleCallError', error)
                else {
                    peerConnection.answer(function (err, answer) {
                        if (err) console.log(err)
                        else {
                            service.emit('chamada', answer);                            
                        }
                    })
                }
            }) 
            } else if (chamada.dados.msg.type == "answer") {
                peerConnection.handleAnswer(chamada.dados.msg);
            } else {        
                peerConnection.processIce(chamada.dados.msg);
            }        
        }
    
    
    return service;
}