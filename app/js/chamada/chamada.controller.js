module.exports = ChamadaController;

ChamadaController.$inject = 
  ['$scope', '$stateParams', 'SocketService', 'PeerConnectionService', 'MediaStreamService'];

function ChamadaController($scope, $stateParams, SocketService, PeerConnectionService, MediaStreamService) {
	var vm = this;

	vm.emAtendimento = false;

	vm.pcIsConnected = false;
	vm.chatOpen = false;
	vm.chatMessages = [];
		
	activate();
	
	/////implementação
	
	vm.sendMessage = function() {
		vm.chatMessages.push({
			received: false,
			message: vm.textToSend
		});
		PeerConnectionService.sendMessage(vm.textToSend)
		vm.textToSend = "";
	}
	function activate() {
		//Inicialização					
		PeerConnectionService.openConnection();	 							//Instancia um novo PeerConnection
		PeerConnectionService.createDataChannel();
		PeerConnectionService.on('callError', handleError)
		PeerConnectionService.on('connectionStateChange', peerConnectionStateChange);
		PeerConnectionService.on('chamada', SocketService.sendCallData); 	//Envia dados para o servidor(socket) quando criados pelo PC (Ice, sdp etc)
		PeerConnectionService.on('videoStreamAdded', setVideoSrc); 			//Coloca um stream remoto recebido no elemento video
		PeerConnectionService.on('audioStreamAdded', setAudioSrc); 			//Coloca um stream de audio remoto recebido em um objeto audio
		SocketService.on('chamada', PeerConnectionService.handleCallData); 	//Resolve os pacotes SDP e ICE recebidos pelo socket
		PeerConnectionService.on('messageReceived', messageReceived);
		PeerConnectionService.on('dataChannelStateChange', dataChannelStatusChange);
		console.log('activate finished');					
		// if ($stateParams.callData.action == 'answer') {						//Tecnico responde à um chamado
		// 	SocketService.setRemoteCode($stateParams.callData.socketId); 	//Atribui o socketId do usuário que requisitou o chamado
		// 	MediaStreamService.getAudioStream()                          	//Pede autorização para compartilhar audio do microfone
		// 		.then(PeerConnectionService.addStream, handleError)		 	//Atribui o stream de audio recebido ao PeerConnection
		// 		.then(PeerConnectionService.createOffer, handleError)    	//Cria o SDP de oferta
		// 		.then(SocketService.sendCallData);                       	//Envia o SDP de oferta criado
		// } else if ($stateParams.callData.action == 'ask') { 				//Usuário solicitando chamado
			// MediaStreamService.getScreenStream()                         	//Pede autorização e escolha da tela a ser compartilhada
			// 	.then(PeerConnectionService.addStream, handleError)      	//Atribui o stream de video recebido ao PeerConnection
			// 	.then(MediaStreamService.getAudioStream, handleError)    	//Pede autorização para compartilhar audio do microfone
			// 	.then(PeerConnectionService.addStream, handleError);	 	//Atribui o stream de audio recebido ao PeerConnection
		// }
	}

	vm.upgradeCallRemoveAudio = function() {
		// PeerConnectionService.removeStream(MediaStreamService.getRequestedAudioStream())
		// 	.then(MediaStreamService.removeRequestedStream);
		console.log(MediaStreamService.getRequestedAudioStream());
		vm.hasAudio = false;
	}

	vm.upgradeCallRemoveVideo = function() {
		PeerConnectionService.removeStream(MediaStreamService.getRequestedVideoStream())
			.then(MediaStreamService.removeRequestedStream)
	}

	vm.upgradeCallRemoveScreen = function() {
		PeerConnectionService.removeStream(MediaStreamService.getRequestedScreenStream())
			.then(MediaStreamService.removeRequestedStream)
	}		

	vm.upgradeCallAddAudio = function() {
		MediaStreamService.getAudioStream()
			.then(PeerConnectionService.addStream, handleError)
			.then(PeerConnectionService.createOffer, handleError)
			.then(SocketService.sendCallData);
		vm.hasAudio = true;
	}

	vm.upgradeCallAddScreen = function() {
		MediaStreamService.getScreenStream()                         	//Pede autorização e escolha da tela a ser compartilhada
			.then(PeerConnectionService.addStream, handleError)      	//Atribui o stream de video recebido ao PeerConnection
			.then(PeerConnectionService.createOffer, handleError)
			.then(SocketService.sendCallData);
	}
	
	//Função para atribuir uma stream à um elemento video
	function setVideoSrc(stream) {
		console.log('setVideoSrc',stream);
		document.getElementById('video1').src = stream;
	}

	function dataChannelStatusChange(status) {
		console.log('dataChannelStatusChange: '+status);
		vm.chatOpen = status === "open";
	}

	function messageReceived(message) {
		vm.chatMessages.push({
			received: true,
			message: message
		});
		$scope.$apply();
	}

	function setAudioSrc(stream) {
		var audio = new Audio();
		audio.src = stream;
		audio.play();
	}

	function handleError(error) {
		console.log(error);
		vm.errorMessage = error.name;
		//MediaStreamService.flushStreams();		
	}

	function peerConnectionStateChange(state) {
		console.log(state);
		vm.pcIsConnected = state === 'connected' || state === 'completed';	
		$scope.$apply();
	}
}