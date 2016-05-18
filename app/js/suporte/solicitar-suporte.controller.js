module.exports = SolicitarSuporteController;

SolicitarSuporteController.$inject = ['$http', 'SocketService'];

function SolicitarSuporteController($http, SocketService) {
    var vm = this;
    
    vm.isConnected = function() {
        console.log(SocketService.isConnected());
    }
    
    vm.solicitarSuporte = function() {
        var socketId = SocketService.getSocketId();
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
                    console.log(response.data);
                })
        }
    }
}