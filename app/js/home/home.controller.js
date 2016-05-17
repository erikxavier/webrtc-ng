module.exports = HomeController;

HomeController.$inject = ['$scope', '$state'];

function HomeController($scope, $state) {
    var vm = this;    
    
    activate();
    
    
    function activate() {
        if (!$scope.$parent.vm.tipo) {            
            $state.go('login');
        }
    }
}