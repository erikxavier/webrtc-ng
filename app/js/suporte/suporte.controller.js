'use strict';
var socketio = require('socket.io-client');
var getUserMedia = require('getusermedia');
var PeerConnection = require('rtcpeerconnection');

module.exports = SuporteController;

SuporteController.$inject = ['$scope', '$window', '$sce'];

function SuporteController($scope, $window, $sce) {
    var vm = this;   
                  
    var getScreenId = $window.getScreenId;            
    var socket = socketio();
    var pc = new PeerConnection();
    var constraints = { audio: false, video: true };    
    var ice = {
        "iceServers": [
            { "url": "stun:stun.l.google.com:19302" }
        ]
    };
    
    vm.close = function() {
        pc.close();
    }
    
    $window.onclose = function() {
        pc.close();
        $window.alert('vai fechar ?');
    }
    pc.on('ice', function (candidate) {
        console.log(candidate);
        socket.emit('chamada',
            JSON.stringify(
                {
                    para: vm.codigoRemoto,
                    dados: { de: vm.meuCodigo, msg: candidate }
                }));
    });

    pc.on('addStream', function (event) {
        console.log("stream added");
        //document.getElementById('localVideo').src = URL.createObjectURL(event.stream);
        //$sce - Angular tem problemas com recursos de outros dominios, algo como CORS        
        vm.remoteVideoSrc = $sce.trustAsResourceUrl(URL.createObjectURL(event.stream)); 
        $scope.$apply();       
    });
    
    pc.on('removeStream', function(event) {
        console.log('removed stream');
        vm.remoteVideoSrc = null;
        $scope.$apply();
    });
    
    pc.on('close', function() {
        console.log('peer closed');
        vm.remoteVideoSrc = null;        
    });

    pc.on('endOfCandidates', function () {
        console.log("fim dos candidates");
    });

    socket.on('chamada', function (data) {
        var chamada = JSON.parse(data);
        if (chamada.dados.msg.type == "offer") {
            vm.codigoRemoto = chamada.dados.de;
            pc.handleOffer(chamada.dados.msg, function (err) {
                if (err) console.log(err)
                else {
                    pc.answer(function (err, answer) {
                        if (err) console.log(err)
                        else {
                            socket.emit('chamada',
                                JSON.stringify(
                                    {
                                        para: chamada.dados.de,
                                        dados: { de: vm.meuCodigo, msg: answer }
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
    });

    socket.on('entrar', function (data) {
        vm.meuCodigo = JSON.parse(data).nomeLogado;     
        $scope.$apply();

    });

    socket.on('lista', function (data) {
        var lista = JSON.parse(data);
        vm.lista = lista.filter(function (codigo) {
            return codigo !== vm.meuCodigo;
        });
        $scope.$apply();
    });

    this.solicitarSuporte = function () {
        if (!vm.codigoRemoto || vm.codigoRemoto === "") {
            return alert('Verifique o codigo do contato!');
        }
        
        getScreenId(function (error, sourceId, screen_constraints) {
            if (!error) {                
                getUserMedia(screen_constraints, function (err, stream) {
                    pc.addStream(stream);
                    pc.offer(function (err, offer) {
                        if (!err) socket.emit('chamada',
                            JSON.stringify(
                                {
                                    para: vm.codigoRemoto,
                                    dados: { de: vm.meuCodigo, msg: offer }
                                }));
                    })
                })
            }
        });
    }
}