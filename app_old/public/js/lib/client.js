/* global io */
/// <reference path="../../typings/jquery/jquery.d.ts"/>
$(function() {	
	var nick = null;
	var socket = io();
	$('#conectar').click(function() {
		socket.emit('entrar', $('#nick').val() );
	});
	socket.on('conected', function(msg) {
		$('#status').text('Conectado com ID '+msg);
		nick = msg;
	});
	
	socket.on('disconnected', function() {
		$("#status").text("Desconectado");
		socket = io();
	})
	
	socket.on('lista', function(json) {
		console.log("recebido on lista: "+json);		
		var lista = JSON.parse(json);		
		$('#users').empty();
		lista.forEach(function(nome) {
			if (nome !== nick)
				$('#users').append('<option value="'+nome+'">'+nome+'</option>');
		});
	});	
	
	socket.on('chamada', function(json) {
		var chamada = JSON.parse(json);
		console.log("Recebido de chamada:");
		console.log(chamada);
		$("#atender").click(function() {			
			iniciaConversa();
			console.log("Chamada atendida");
			$("#status").text("Em chamada com "+peer);
		});
		if (chamada.error) {
			alert("Não foi possivel realizar a operação. Erro: "+chamada.error);
			return;
		}
		if (!isInCall) {
			isInCall = true;
			peer = chamada.dados.de;
			$("#status").text(peer+" está ligando...")
		}
		
		if (chamada.dados.oferta) {			
			ofertaRecebida = chamada.dados.oferta;
			peer = chamada.dados.de;			
		} else if (chamada.dados.resposta) {
			pc.setRemoteDescription(new RTCSessionDescription(chamada.dados.resposta),
									function() {
										console.log("Conectado com sucesso");
										},
									function() {
										console.log("Falha na conexão");
										}
									);
		}
	})
	
	function resetState() {
		isInCall = false;
		isCaller = false;
		ofertaRecebida = null;
	}
	
	//WebRTC connection 
	
	var isInCall = false;
	var isCaller = false;
	var ofertaRecebida = null;
	
	var ice = {"iceServers": [
		{"url": "stun:stun.l.google.com:19302"}
	]};
	
	pc = null;
	
	var peer = null;
	
	//Configurações multi navegador
	
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
	//Elementos de audio do DOM
	var localAudio = $('#localAudio');
	var remoteAudio = $('#remoteAudio');
	
	//Callbacks do getUserMedia
	//Sucesso
	function getMediaOk(stream) {
		console.log("Peer dentro de getMediaOk "+peer+"...");
		//Cria o RTCPeerConnection
		pc = new window.RTCPeerConnection(ice);
		
		//Adiciona o mediaStream local ao RTCPeerCon
		pc.addStream(stream);
		
		
		//Callbacks do RTCPC
		pc.onaddstream = onStreamAdded;
		pc.onicecandidate = onIceCandidate;
		
		if (isCaller) {
			//Chamar createOffer() irá executar o processo ICE			
			pc.createOffer(function (offerSDP) {
						   		pc.setLocalDescription(new RTCSessionDescription(offerSDP),
								   						//Sucesso ao setar localDescription - pode enviar a oferta(trickle ICE)
														function() {
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
			pc.setRemoteDescription(new RTCSessionDescription(ofertaRecebida),
									function() {
										console.log(ofertaRecebida);
										pc.createAnswer(
											function (respostaSDP) {
											pc.setLocalDescription(
												new RTCSessionDescription(respostaSDP),
						   						//Sucesso ao setar localDescription - pode enviar a oferta(trickle ICE)
												function() {
													console.log("SDP Local configurado");
												},
												//Falha ao setar localDescription
												function() {
													console.log("Falha ao configurar SDP local");
												});
									}, function(err) {
										console.log("Não foi possivel construir resposta: "+err);
									});
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
				var oferta = { "de": nick,"oferta": pc.localDescription};
				socket.emit("chamada", JSON.stringify( {"para": peer, "dados":oferta} ));
				} else {
					var resposta = {"de": nick, "resposta":pc.localDescription };
					socket.emit("chamada", JSON.stringify({ "para": peer, "dados":resposta}));
				}
			}
		}
		
		function onStreamAdded(evt) {
			remoteAudio.prop("src", URL.createObjectURL(evt.stream));
		}
		
	//Falha
	function getMediaKo(err) {
		console.log('Falha ao capturar audio!');
		alert('Falha ao capturar audio: '+err);
		isCaller = false;
		isInCall = false;
		peer = null;
		return;
	}				
	
	//função ligar
	navigator.callUser = function(quem) {
		$('#status').text("Ligando para "+quem+"...");
		isCaller = true;
		peer = quem;
		iniciaConversa();
	}
	
	function iniciaConversa() {
		if (isCaller) {
			console.log("Iniciando chamada...");
		} else {
			console.log("Recebendo chamada...");
		}
		navigator.getUserMedia(constraints, getMediaOk, getMediaKo);
	}
	$('#call').click(function() {
			navigator.callUser($('#users').val());
	});
});
