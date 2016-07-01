
module.exports = IndexController;

IndexController.$inject = ['$state', '$scope', 'SocketService'];

function IndexController($state, $scope, SocketService) {
    var vm = this;
    SocketService.on('entrar', function(socketId) {
        vm.socketId = socketId;
        $scope.$apply();
    });

    activate();

    ////////////////

    function activate() { 
        
    }
}
    