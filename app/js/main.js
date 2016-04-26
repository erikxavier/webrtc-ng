require('../lib/getScreenId');
//require('bootstrap');
var angular = require('angular');

angular.module('WebRTC-NG', [require('angular-ui-router')])
    .config(function ($stateProvider, $urlRouterProvider) {       
       //Rota padrão
       $urlRouterProvider.otherwise("/");
       
       $stateProvider
        .state('main', {
            url: "/",
            templateUrl: 'main.html'
        })
         .state('solicitar-suporte', {
             url: '/solicitar-suporte',
             templateUrl: 'js/suporte/view-suporte-cliente.html',
             controller: require('./suporte/suporte.controller'),
             controllerAs: 'vm'
         }); 
    });