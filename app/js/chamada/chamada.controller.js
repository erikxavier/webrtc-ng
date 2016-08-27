module.exports = ChamadaController;

ChamadaController.$inject = 
  ['$scope', '$stateParams', '$state', 'SocketService', 'PeerConnectionService', 'MediaStreamService'];

function ChamadaController($scope, $stateParams, $state, SocketService, PeerConnectionService, MediaStreamService) {
	var vm = this;

	vm.emAtendimento = false;

	vm.pcIsConnected = false;
	vm.chatOpen = false;
	vm.chatMessages = [];
		
	activate();
	

	function activate() {
		if (!$stateParams.callData) {
			return $state.go('login');
		}
		//Inicialização					
		PeerConnectionService.openConnection();	 							//Instancia um novo PeerConnection
		PeerConnectionService.createDataChannel();							//Cria DataChannel no PeerConnection
		PeerConnectionService.on('callError', handleError)					//Adiciona um callback de erro genérico, para qualquer erro do PeerConnectionService
		PeerConnectionService.on('connectionStateChange', peerConnectionStateChange);  //Mudança de estado da conexão do PeerConnection
		PeerConnectionService.on('chamada', SocketService.sendCallData); 	//Envia dados para o servidor(socket) quando criados pelo PC (Ice, sdp etc)
		PeerConnectionService.on('videoStreamAdded', setVideoSrc); 			//Coloca um stream remoto recebido no elemento video
		PeerConnectionService.on('audioStreamAdded', setAudioSrc); 			//Coloca um stream de audio remoto recebido em um objeto audio
		SocketService.on('chamada', PeerConnectionService.handleCallData); 	//Resolve os pacotes SDP e ICE recebidos pelo socket
		SocketService.on('disconnect', onSocketDisconnect);					//Resolve evento de socket desconectado do servidor				
		PeerConnectionService.on('messageReceived', messageReceived);       //Mensagem DataChannel Recebida
		PeerConnectionService.on('dataChannelStateChange', dataChannelStatusChange); // Mudança de estado da conexão DataChannel			
	}

	/////implementação
	
	//Verifica perda de conexão com o servidor socket
	function onSocketDisconnect() {
		console.log('pc conncted socket disconnect', vm.pcIsConnected);
		if (!vm.pcIsConnected) {
			alert('A conexão com o servidor foi perdida, tente novamente mais tarde!')
			$state.go('login');
		}
	}

	//Envia mensagem pelo canal DataChannel
	vm.sendMessage = function() {
		vm.chatMessages.push({
			received: false,
			message: vm.textToSend
		});
		PeerConnectionService.sendMessage(vm.textToSend)
		vm.textToSend = "";
	}

	//Adiciona chamada de audio à conexão
	vm.upgradeCallAddAudio = function() {
		MediaStreamService.getAudioStream()                       //Pede autorização para compartilhar microfone
			.then(PeerConnectionService.addStream, handleError)	  //Adiciona o stream de audio ao PeerConnection
			.then(PeerConnectionService.createOffer, handleError) //Cria uma nova oferta
			.then(SocketService.sendCallData);					  //Envia nova oferta para renegociação da conexão
		vm.hasAudio = true;
	}

	//Adiciona compartilhamento de tela à conexão
	vm.upgradeCallAddScreen = function() {
		MediaStreamService.getScreenStream()                         	//Pede autorização e escolha da tela a ser compartilhada
			.then(PeerConnectionService.addStream, handleError)      	//Atribui o stream de video recebido ao PeerConnection
			.then(PeerConnectionService.createOffer, handleError)		//Cria uma nova oferta
			.then(SocketService.sendCallData);							//Envia nova oferta para renegociação da conexão
		vm.hasScreen = true;
	}

	//Adiciona video da webcam à conexão
	vm.upgradeCallAddVideo = function() {
		MediaStreamService.getVideoStream()
			.then(PeerConnectionService.addStream, handleError)
			.then(PeerConnectionService.createOffer, handleError)
			.then(SocketService.sendCallData);
		vm.hasVideo = true;
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