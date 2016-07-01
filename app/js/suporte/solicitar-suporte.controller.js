module.exports = SolicitarSuporteController;

SolicitarSuporteController.$inject = ['$http', '$state', 'SocketService'];

function SolicitarSuporteController($http, $state, SocketService) {
    var vm = this;
    
    vm.isConnected = function() {
        console.log(SocketService.isConnected());
    }
    
    vm.solicitarSuporte = function() {
        var socketId = SocketService.localCode;
        if (socketId) {
            var solicitacao = {
                socketId: socketId,
                nome: vm.nome,
                email: vm.email,
                descricao: vm.descricao,
                tipo: vm.tipo
            }
            $http.post('/api/solicitar-suporte', solicitacao)
                .then(function(response) {
                    $state.go('chamada', {
                        callData: {action:'ask'}
                    });
                })
        }
    }
}