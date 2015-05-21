/// <reference path="../../../typings/angularjs/angular.d.ts"/>
var app = angular.module('webrtc', ['ngAnimate']);
app.controller('mainCtrl', ['$scope', function($scope) {
	$scope.usuario = {};		
	var viewPath = 'views/';
	$scope.route =  viewPath+'login.html';
	$scope.audio = new Audio();		
	
	$scope.go = function(partial) {
		$scope.route = viewPath+partial;		
	};
	$scope.setError = function(msg) {
		$scope.error = msg;
	};
		
	var socket = io();
	
	socket.on('entrar', function(data) {
		var msg = JSON.parse(data);	
		if (msg.error) {
			$scope.error = msg.error;			
		} else {					
			$scope.go('list.html');
		}
	});		
	
	socket.on('disconnect', function() {
		$scope.go('login.html');
		$scope.usuario = {};		
	});
	
	socket.on('lista', function(data) {
		var lista = JSON.parse(data);
		var i = lista.indexOf($scope.usuario.nome);
		lista.splice(i,i+1);
		$scope.list = lista;
		$scope.$apply();

	});
	
	
	$scope.login = function() {		
		socket.emit('entrar', $scope.usuario.nome);		
	};
	
	$scope.logout = function() {		
		socket.emit('sair', $scope.usuario.nome);	
		$scope.go('login.html');
		$scope.usuario = {};	
	};
	
	
	$scope.recebendo = false;	
	$scope.btnAtender = false;
	
	$scope.atender = function() {
		iniciaConversa();	
		$scope.callMsg = "Conectando...";	
	};
	
	function setAudio(audio) {
				
		$scope.audio.src = audio;
		$scope.audio.play();
	}
	
	socket.on('chamada', function(json) {
		var chamada = JSON.parse(json);						
		if (chamada.error) {
			alert("Não foi possivel realizar a operação. Erro: "+chamada.error);
			return;
		}
		
		if (chamada.dados.oferta) {
			if (isInCall) {
				socket.emit("chamada",JSON.stringify({error: "Usuário já está em uma chamada!"}));
				return;
			}
			ofertaRecebida = chamada.dados.oferta;
			peer = chamada.dados.de;
			$scope.callMsg = "Recebendo chamada de "+peer;
			$scope.recebendo = true;
			isInCall = true;
			$scope.btnAtender = true;			
			$scope.go('call.html');	
			$scope.$apply();
			setAudio("audio/ring.mp3");																
		} else if (chamada.dados.resposta) {
			pc.setRemoteDescription(new window.RTCSessionDescription(chamada.dados.resposta),
									function() {
										$scope.callMsg = "Em chamada com "+peer;
										},
									function() {
										console.log("Falha na conexão");
										peer = null;
										isInCall = false;
										$scope.recebendod = false;
										isCaller = false; 
										$scope.go('list.html');
										}
									);
		}
	});
	//Transforma binário em URL
	window.URL = window.URL || window.webkitURL;
	//getUserMedia => request dos recursos de audio/video do usuário
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	// Cria a conexão WebRTC com outro peer
	window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
	//Manipula os SDP local e remoto
    window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;
	//controlador do ICE Agente, que envia nossos candidatos para o peer
    window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
	//Configurações do getuserMedia
	var constraints = {audio:true, video:false};
	var ice = {"iceServers": [
		{"url": "stun:stun.l.google.com:19302"}
	]};
	var pc = new window.RTCPeerConnection(ice);
	
	var isCaller = false;
	var isInCall = false;
	var ofertaRecebida = null;
	
	var peer = null;
	//var pc = null;
	
	$scope.audioSrc = null;
	

	
	function getMediaSuccess(stream) {
		//Cria o RTCPeerConnection
		//pc = new window.RTCPeerConnection(ice);
		
		//Adiciona o mediaStream local ao RTCPeerCon
		pc.addStream(stream);
		
		
		//Callbacks do RTCPC
		pc.onaddstream = onStreamAdded;
		pc.onicecandidate = onIceCandidate;
		
		if (isCaller) {
			//Chamar createOffer() irá executar o processo ICE			
			pc.createOffer(function (offerSDP) {
	   			pc.setLocalDescription(new window.RTCSessionDescription(offerSDP),
					//Sucesso ao setar localDescription - pode enviar a oferta(trickle ICE)
					function() {
						var oferta = { "de": $scope.usuario.nome ,"oferta": pc.localDescription};
						socket.emit("chamada", JSON.stringify( {"para": peer, "dados":oferta} ));
						console.log("SDP Local configurado");
					},
					//Falha ao setar localDescription
					function() {
						console.log("Falha ao configurar SDP local");
								});
						},
			function(err) {
				console.log("Não foi possivel construir oferta: "+err);
			}, constraints);
		} else {
			pc.setRemoteDescription(new window.RTCSessionDescription(ofertaRecebida),
				//Sucesso ao setar SDP pra resposta
				function() {
					console.log(ofertaRecebida);
					pc.createAnswer(
						//Resposta criada com sucesso
						function (respostaSDP) {
						pc.setLocalDescription(
							new window.RTCSessionDescription(respostaSDP),
	   						//Sucesso ao setar localDescription - pode enviar a resposta(trickle ICE)
							function() {
								var resposta = {"de": $scope.usuario.nome , "resposta":pc.localDescription };
								socket.emit("chamada", JSON.stringify({ "para": peer, "dados":resposta}));
								console.log("SDP Local configurado");
							},
							//Falha ao setar localDescription
							function() {
								console.log("Falha ao configurar SDP local");
							});
					//Falha ao construir a resposta		
					}, function(err) {
						console.log("Não foi possivel construir resposta: "+err);
					});
			//Falha ao setRemoteDescription
			}, function() {
				console.log("Falha ao construir SDP remoto");
			});
		}
	};
		
		function onIceCandidate(evt) {
			//Espera por todos os candidates serem encontrados e envia para nosso peer
			if (evt.target.iceGatheringState === "complete") {
				console.log("Busca ICE completa, enviando SDP para peer remoto:");
				console.log(pc.localDescription);
				
				if (isCaller) {
				var oferta = { "de": $scope.usuario.nome ,"oferta": pc.localDescription};
				socket.emit("chamada", JSON.stringify( {"para": peer, "dados":oferta} ));
				} else {
					var resposta = {"de": $scope.usuario.nome , "resposta":pc.localDescription };
					socket.emit("chamada", JSON.stringify({ "para": peer, "dados":resposta}));
				}
			}
		}
		
		function onStreamAdded(evt) {
			var url = URL.createObjectURL(evt.stream);			
			setAudio(url);
		}
		
	//Falha
	function getMediaError(err) {
		console.log('Falha ao capturar audio!');
		alert('Falha ao capturar audio: '+err);
		isCaller = false;
		isInCall = false;
		peer = null;
		return;
	}		
		
	$scope.call = function(quem) {
		peer = quem;
		isCaller = true;		
		$scope.callMsg = "Ligando para "+peer;		
		$scope.go('call.html');
		setAudio("audio/call.mp3");		
				
		iniciaConversa();
	};
	
	function iniciaConversa() {
		navigator.getUserMedia(constraints, getMediaSuccess, getMediaError);
	}
	
	
	
//	SignalingService.setSocket(io());
//	$scope.login = SignalingService.entrar($scope.usuario.nome, console.log, $scope.setError);
//	SignalingService.onEntrar(function() {
//			$scope.go('list.html');
//		});
//		
//	SignalingService.onDisconnect(function() {
//			$scope.go('login.html');
//		});
//	
//		var sig = new SignalingService(io());
		
//		$scope.login = function() {			
//		SignalingService.entrar($scope.usuario.nome)
//		.then(console.log, $scope.setError);
//		};
//		
//		SignalingService.onEntrar()
//		.then(function() {
//				$scope.go('list.html');
//			}
//		)
//		.catch($scope.setError);
//		
//		SignalingService.onDisconnect()
//		.then( function() {
//			$scope.go('login.html');
//		});
//		
//		$scope.hoverUser = function(user) {
//			$scope.hoveredUser = user;
//		};
}]);