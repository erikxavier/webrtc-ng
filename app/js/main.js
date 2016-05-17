require('../lib/getScreenId');
//require('bootstrap');
var angular = require('angular');

angular.module('WebRTC-NG', [require('angular-ui-router')])
    .controller('IndexController', require('./index.controller'))
    .config(RouteConfig);
    
    
    RouteConfig.$inject = ['$stateProvider', '$urlRouterProvider'];
    
    function RouteConfig($stateProvider, $urlRouterProvider) {       
       //Rota padrão
       $urlRouterProvider.otherwise("/");
       
       $stateProvider
        .state('home', {
            url: "/",
            templateUrl: 'js/home/view-home.html',
            controller: require('./home/home.controller'),
            controllerAs: 'vm'
        })
         .state('solicitar-suporte', {
             url: '/solicitar-suporte',
             templateUrl: 'js/suporte/view-suporte-cliente.html',
             controller: require('./suporte/suporte.controller'),
             controllerAs: 'vm',
             onEnter: function() {
                 console.log("oi");
             }
         })
         .state('historico', {
             url: '/historico',
             templateUrl: 'js/historico/view-historico.html',
             controller: require('./historico/historico.controller'),
             controllerAs: 'vm'
         })
         .state('login', {
             url:'/login',
             templateUrl: 'js/login/view-login.html',
             controller: require('./login/login.controller'),
             controllerAs: 'vm'
         });
    }