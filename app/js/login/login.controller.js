module.exports = LoginController;

LoginController.$inject = ['$scope', '$state'];
function LoginController($scope, $state) {
    var vm = this;
    
    
    vm.entrarUsuario = function() {
        $scope.$parent.vm.tipo = 'usuario';   
        $state.go('solicitar-suporte');          
    }
    
    vm.entrarTecnico = function() {
        $scope.$parent.vm.tipo = 'tecnico';
        $state.go('home');               
    }
}