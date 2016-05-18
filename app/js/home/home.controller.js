module.exports = HomeController;

HomeController.$inject = ['$scope', '$state'];

function HomeController($scope, $state) {
    var vm = this;    
    
    activate();
    
    
    function activate() {
        if (sessionStorage.getItem('tipo') == 'tecnico') {
            $scope.$parent.vm.tipo = 'tecnico';
            $state.go('historico');
        } else if (sessionStorage.getItem('tipo') == 'usuario') {
            $scope.$parent.vm.tipo = 'usuario';
            $state.go('solicitar-suporte')
        } else {          
            $state.go('login');
        }        
    }
}