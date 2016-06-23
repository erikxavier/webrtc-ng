module.exports = ChamadaController;

ChamadaController.$inject = ['$stateParams'];

function ChamadaController($stateParams) {
	var vm = this;
		
	activate();
	
	
	/////implementação
	
	function activate() {
		//Inicialização			
		vm.socketId = $stateParams.socketId;
	}		
}