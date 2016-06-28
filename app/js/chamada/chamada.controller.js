module.exports = ChamadaController;

var getScreenMedia = require('getscreenmedia')
var getUserMedia = require('getusermedia');

ChamadaController.$inject = 
  ['$stateParams', '$window' ,'SocketService', 'PeerConnectionService'];

function ChamadaController($stateParams, $window, SocketService, PeerConnectionService) {
	var vm = this;
	var getScreenId = $window.getScreenId;
	var screenConst;
		
	activate();
	
	
	/////implementação
	
	function activate() {
		//Inicialização		
		var constraints = {audio:true, video:false};
		vm.socketId = $stateParams.socketId;
		var mediaStream;

		//Pegar o ID da tela
		getScreenId(function(error, sourceId, screen_constraints) {
			if (!error) {
				screenConst = screen_constraints;				
				//screenConst.audio = true;
				//screenConst.mandatory = {offerToReceiveAudio: true};
				console.log('screen constraints:', screen_constraints);
				//Pegar o stream da tela
				getUserMedia(screenConst, function(error, stream) {
					if (!error) {
						mediaStream = stream;
						//Pegar o stream de audio
						getUserMedia(constraints, function(error, stream) {
							if (!error) {
								//Adicionar a track de audio ao stream da tela
								mediaStream.addTrack(stream.getTracks()[0]);
								//Colocar o stream combinado no elemento video1
								document.getElementById('video1').src = URL.createObjectURL(mediaStream);
							} else {
								console.log(error);
							}
						});
					}
				});
			} else {
				console.log(error);
			}
		});
	}		
}