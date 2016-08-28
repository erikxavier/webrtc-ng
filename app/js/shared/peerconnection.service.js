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
    var sendChannel;
    var haveLocalOffer = false;
    var haveLocalAnswer = false;
    var candidateBuffer = [];

    //Fecha a conexão se houver alguma, instancia um novo PeerConnection e atribui os emissores do serviço aos listeners do PeerConnection
    service.openConnection = function() {
        var defered = $q.defer();
        if (peerConnection) {
            peerConnection.close();
        }
        peerConnection = new PeerConnection(ice);

        peerConnection.on('ice', function(candidate) {
            console.log('ice candidate gerado');
            console.log('ice state: ', peerConnection.iceConnectionState);
            service.emit('chamada', candidate);   
        });

        peerConnection.on('iceConnectionStateChange', function(e) {
            console.log('ice state changed: ', peerConnection.iceConnectionState);
            service.emit('connectionStateChange', peerConnection.iceConnectionState);
        });

        peerConnection.on('addChannel', function(channel) {
            console.log('canal remoto adicionado'); //REMOVER
            channel.onmessage = function(event) {
                console.log('msg DC recebida');
                service.emit('messageReceived', event.data);
            }
        })

        peerConnection.on('addStream', function (event) {
            console.log(event);
            event.stream.getTracks().forEach(function(track) {
                console.log('track received:', track);
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
            defered.resolve();
        });        

        return defered.promise;
    }

    //Adiciona um MediaStream ao PeerConnection
    service.addStream = function(stream) {
        return $q(function(resolve, reject) {
            peerConnection.addStream(stream);
            resolve();
        });
    };

    //Cria canal de dados
    service.createDataChannel = function() {
        console.log('data channel criado'); // REMOVER
        sendChannel = peerConnection.createDataChannel('sendDataChannel', {reliable: false});
        sendChannel.onopen = function() {
            service.emit('dataChannelStateChange', sendChannel.readyState)
        }
    }
    
    //Envia mensagem pelo DataChannel criado
    service.sendMessage = function(data) {
        console.log('mensagem recebida data channel'); //REMOVER
        if (sendChannel) {
            sendChannel.send(data);
        }
    }

    //Remove um stream da conexão
    service.removeStream = function(stream) {
        var defered = $q.defer();
        peerConnection.removeStream(stream);
        defered.resolve(stream);
        return defered.promise;
    }

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
                console.log('fim dos candidatos, enviar oferta');
                defered.resolve(offer);
            }
        });

        return defered.promise;
    };

    function processCandidateBuffer() {
        while (candidateBuffer.length > 0) {
            peerConnection.processIce(candidateBuffer.pop());
        }
    }


    //Resolve pacotes SDP, de oferta, de resposta ou ICE
    service.handleCallData = function(data) {
        var constraints = {
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
        }
        var chamada = JSON.parse(data);
        if (chamada.dados.msg.type && chamada.dados.msg.type == "offer") { //Pacote recebido do tipo oferta
            console.log('oferta recebida');
            SocketService.setRemoteCode(chamada.dados.de);
            peerConnection.handleOffer(chamada.dados.msg, function(err) {
                if (err) service.emit('callError', error)
                else {
                    console.log('oferta processada');
                    haveLocalOffer = true;
                    processCandidateBuffer();
                    peerConnection.answer(function (err, answer) { //Oferta recebida e processada com sucesso, cria resposta
                        if (err) console.log(err)
                        else {
                            console.log('resposta criada e enviada');
                            service.emit('chamada', answer);          //Resposta criada e enviada           
                        }
                    })
                }
            }); 
        } else if (chamada.dados.msg.type && chamada.dados.msg.type == "answer") { //Pacote recebido do tipo resposta
                console.log('resposta recebida');
                peerConnection.handleAnswer(chamada.dados.msg); //Processa resposta
                haveLocalAnswer = true;
                processCandidateBuffer();
            } else if (chamada.dados.msg.candidate) { //Pacote recebido do tipo candidato ICE
                if (haveLocalOffer || haveLocalAnswer) {     
                    peerConnection.processIce(chamada.dados.msg); //Se já existir um SDP de Oferta recebida, processa o candidato
                } else {
                    candidateBuffer.push(chamada.dados.msg);  //Se não houver nenhum SDP de Oferta recebida, guarda os candidados para processar posteriormente
                }
            }        
        }
                
    return service;
}