module.exports = ListaEsperaController;

ListaEsperaController.$inject = ['$http', '$state', 'SocketService'];

function ListaEsperaController($http, $state, SocketService) {
	var vm = this;
	vm.lista = []
	
	vm.atenderChamado = atenderChamado;
		
	activate();
			
	SocketService.on('lista-espera', function() { //Notificação de lteração na lista de espera
		getLista();
	});

	function activate() {
		getLista();
	}

	function getLista() { //Pegar lista de espera
		$http.get('/api/lista-espera')
			.then(resolveLista);	
	}
	
	function resolveLista(response) {  //Resolve lista de espera e mostra na tela
		//console.log(response.data);
		// if (!Array.isArray(response.data)) return [];
		// var data = response.data.map(function(value) {
		// 	return JSON.parse(value);
		// });
	    vm.lista = response.data;
	}	

	vm.formatDate = function(date) {
		date = new Date(date);
		var dateString = date.toLocaleDateString();
		dateString += ' às ' + date.toLocaleTimeString()
		return dateString;
	}
	
	function atenderChamado(chamado) { //Atende o chamado
		$http.post('/api/atender-chamado', {idTecnico: SocketService.localCode, idChamado: chamado.id})
		$state.go('chamada-tecnico', {
			callData: {
				chamado: chamado,
				action: 'answer'
			}
		});
	}
}