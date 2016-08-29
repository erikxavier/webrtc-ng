module.exports = ChamadaTecnicoController;

ChamadaTecnicoController.$inject = 
  ['$scope', '$stateParams', '$state', 'SocketService', 'PeerConnectionService', 'MediaStreamService'];

function ChamadaTecnicoController($scope, $stateParams, $state, SocketService, PeerConnectionService, MediaStreamService) {
	var vm = this;

	vm.pcIsConnected = false;
    vm.chatMessages = [];
    vm.chatOpen;
	vm.hasVideo = false;
		
	activate();
	
	/////implementação
	
	vm.sendMessage = function() {
		if (!vm.textToSend) return;
		vm.chatMessages.push({
			received: false,
			message: vm.textToSend
		});
		PeerConnectionService.sendMessage(vm.textToSend)
		vm.textToSend = "";
	}    

	function activate() {
		if (!$stateParams.callData) {
			return $state.go('login');
		}
		//Inicialização					
		PeerConnectionService.openConnection();	 							//Instancia um novo PeerConnection
		PeerConnectionService.createDataChannel();
		PeerConnectionService.on('callError', handleError)
        PeerConnectionService.on('dataChannelStateChange', dataChannelStatusChange);        
        PeerConnectionService.on('connectionStateChange', peerConnectionStateChange);
		PeerConnectionService.on('chamada', SocketService.sendCallData); 	//Envia dados para o servidor(socket) quando criados pelo PC (Ice, sdp etc)
		PeerConnectionService.on('videoStreamAdded', setVideoSrc); 			//Coloca um stream remoto recebido no elemento video
		PeerConnectionService.on('audioStreamAdded', setAudioSrc); 			//Coloca um stream de audio remoto recebido em um objeto audio
		SocketService.on('chamada', PeerConnectionService.handleCallData); 	//Resolve os pacotes SDP e ICE recebidos pelo socket
		PeerConnectionService.on('messageReceived', messageReceived)
		SocketService.setRemoteCode($stateParams.callData.socketId);
		PeerConnectionService.createOffer()
			.then(SocketService.sendCallData); 
	}
	
	//Função para atribuir uma stream à um elemento video
	function setVideoSrc(stream) {
		vm.hasVideo = true;
		console.log('setVideoSrc',stream);
		document.getElementById('video1').src = stream;
	}
	
	vm.chatEnter = function(e) {
		console.log('asdasds',e);
		if (e.keyCode === 13) {
			vm.sendMessage()
		}
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

	vm.upgradeCallAddAudio = function() {
		MediaStreamService.getAudioStream()
			.then(PeerConnectionService.addStream, handleError)
			.then(PeerConnectionService.createOffer, handleError)
			.then(SocketService.sendCallData);
	}
	

	function setAudioSrc(stream) { //Cria um objeto Audio e atribui uma stream de audio
		var audio = new Audio();
		audio.src = stream;
		audio.play();
	}

	function handleError(error) {  //Callback de erro
		console.log(error);
		vm.errorMessage = error.name;
		//MediaStreamService.flushStreams();		
	}

	function peerConnectionStateChange(state) { //Callback de alteração de estado da conexão do PeerConnection
		console.log(state);
		vm.pcIsConnected = state === 'connected' || state === 'completed';
		$scope.$apply();
	}
}