/// <reference path="../../../typings/angularjs/angular.d.ts"/>
var app = angular.module('webrtc', ['ngAnimate', 'Main']);
app.controller('mainCtrl', ['$scope', 'SignalingService', function($scope, SignalingService) {
	$scope.usuario = {};		
	var viewPath = 'views/';
	$scope.route =  viewPath+'login.html';
	$scope.go = function(partial) {
		$scope.route = viewPath+partial;		
	};
	$scope.setError = function(msg) {
		$scope.error = msg;
	};
	
	var sig = new SignalingService(io());
	
	$scope.login = function() {
//		sig.test().then(console.log);
		sig.entrar($scope.usuario.nome)
		.then(console.log)
		.catch($scope.setError);
	}
	
	sig.onEntrar()
	.then(function() {
		console.log('Entrar()');
		$scope.go('list.html')
	})
	.catch($scope.setError);
	
	sig.onDisconnect()
	.then($scope.go('login.html'));
	
	$scope.hoverUser = function(user) {
		$scope.hoveredUser = user;
	};
	
//	socket.on('entrar', function(data) {
//		var msg = JSON.parse(data);	
//		if (msg.error) {
//			$scope.error = msg.error;			
//		} else {					
//			$scope.go('list.html');
//		}
//	});

//	
//	socket.on('disconnect', function() {
//		$scope.go('login.html');
//	});
//	socket.on('lista', function(data) {
//		var lista = JSON.parse(data);
//		var i = lista.indexOf($scope.usuario.nome);
//		lista.splice(i,i+1);
//		$scope.list = lista;
//		$scope.$apply();
//
//	});
//	
//	
//	$scope.login = function() {
//		socket.emit('entrar', $scope.usuario.nome);		
//	};
//	
//	$scope.call = function(quem) {
//		$scope.quem = quem;
//		$scope.go('call.html');
//	};
}]);