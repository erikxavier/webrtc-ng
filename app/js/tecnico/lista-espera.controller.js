module.exports = ListaEsperaController;

ListaEsperaController.$inject = ['$http', '$state'];

function ListaEsperaController($http, $state) {
	var vm = this;
	vm.lista = [
		{nome: 'Lista vazia'}
	]
	
	vm.atenderChamado = atenderChamado;
		
	activate();
	
	
	function activate() {
		$http.get('/api/lista-espera')
			.then(resolveLista);
			
	}
	
	function resolveLista(response) {
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