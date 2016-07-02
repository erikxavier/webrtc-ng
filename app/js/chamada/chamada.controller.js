module.exports = ChamadaController;

ChamadaController.$inject = 
  ['$stateParams', 'SocketService', 'PeerConnectionService', 'MediaStreamService'];

function ChamadaController($stateParams, SocketService, PeerConnectionService, MediaStreamService) {
	var vm = this;
		
	activate();
	
	
	/////implementação
	
	function activate() {
		//Inicialização	
		PeerConnectionService.openConnection();	 //Instancia um novo PeerConnection
		PeerConnectionService.on('chamada', SocketService.sendCallData); //Envia dados para o servidor(socket) quando criados pelo PC (Ice, sdp etc)
		PeerConnectionService.on('videoStreamAdded', setVideoSrc); //Coloca um stream remoto recebido no elemento video
		PeerConnectionService.on('audioStreamAdded', setAudioSrc); //Coloca um stream de audio remoto recebido em um objeto audio
		SocketService.on('chamada', PeerConnectionService.handleCallData); //Resolve os pacotes SDP e ICE recebidos pelo socket
							
		if ($stateParams.callData.action == 'answer') {		//Tecnico responde à um chamado
			SocketService.setRemoteCode($stateParams.callData.socketId); //Atribui o socketId do usuário que requisitou o chamado
			MediaStreamService.getAudioStream()                          //Pede autorização para compartilhar audio do microfone
				.then(PeerConnectionService.addStream, handleError)		 //Atribui o stream de audio recebido ao PeerConnection
				.then(PeerConnectionService.createOffer, handleError)    //Cria o SDP de oferta
				.then(SocketService.sendCallData);                       //Envia o SDP de oferta criado
		} else if ($stateParams.callData.action == 'ask') { //Usuário solicitando chamado
			MediaStreamService.getScreenStream()                         //Pede autorização e escolha da tela a ser compartilhada
				.then(PeerConnectionService.addStream, handleError)      //Atribui o stream de video recebido ao PeerConnection
				.then(MediaStreamService.getAudioStream, handleError)    //Pede autorização para compartilhar audio do microfone
				.then(PeerConnectionService.addStream, handleError);	 //Atribui o stream de audio recebido ao PeerConnection
		}
	}
	
	//Função para atribuir uma stream à um elemento video
	function setVideoSrc(stream) {
		console.log('setVideoSrc',stream);
		document.getElementById('video1').src = stream;
	}

	function setAudioSrc(stream) {
		document.getElementById('audio1').src = stream;
	}

	function handleError(error) {
		console.log(error);
		vm.errorMessage = error.name;
		MediaStreamService.flushStreams();		
	}
}