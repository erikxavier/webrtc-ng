module.exports = ListaEsperaController;

ListaEsperaController.$inject = ['$http', '$state', 'SocketService'];

function ListaEsperaController($http, $state, SocketService) {
	var vm = this;
	vm.lista = []
	
	vm.atenderChamado = atenderChamado;
		
	activate();
	
	

	SocketService.on('lista-espera', function() {
		getLista();
	});

	function activate() {
		getLista();
	}

	function getLista() {
		$http.get('/api/lista-espera')
			.then(resolveLista);	
	}
	
	function resolveLista(response) {
		if (!Array.isArray(response.data)) return [];
		var data = response.data.map(function(value) {
			return JSON.parse(value);
		});
		vm.lista = data;
	}
	
	function debug(response) {
		var data = response.data.map(function(value) {
			return JSON.parse(value);
		});
		console.log(data);
	}
	
	function atenderChamado(socketId) {
		$state.go('chamada-tecnico', {
			callData: {
				socketId: socketId,
				action: 'answer'
			}
		});
	}
}