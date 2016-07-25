module.exports = EndPointService;

EndPointService.$inject = ['$location'];

function EndPointService($location) {
    var service = {
        getLogin: getLogin
    };
    
    return service;

    ////////////////
    function getLogin() { 
        return $location.host()+'/api/login-tecnico';        
    }
}
