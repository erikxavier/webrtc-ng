module.exports = LoginController;
location.ho
LoginController.$inject = ['$scope', '$state', '$http', 'SocketService'];
function LoginController($scope, $state, $http, SocketService) {
    var vm = this;
    
    
    vm.entrarUsuario = function() {
        $scope.$parent.vm.tipo = 'usuario';   
        $state.go('solicitar-suporte');          
    }
        
    vm.login = function() {        
        if (vm.usuario && vm.senha)
            var user = {nome: vm.usuario, senha:vm.senha};
        else return;
        
        vm.loginMsg = '';
        $http.post('/api/login-tecnico', user)
        .then(function(response) {
            var data = response.data;
            if (data.autenticado) {
                sessionStorage.setItem('autenticado', user.nome);
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('tipo', 'tecnico');
                $scope.$parent.vm.tipo = 'tecnico';
                $state.go('home'); 
            } else {
                vm.loginMsg = 'Usuario ou senha incorretos';
            }
        })
    }
}