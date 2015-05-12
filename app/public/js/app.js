/// <reference path="../../../typings/angularjs/angular.d.ts"/>
var app = angular.module('webrtc', []);
app.controller('mainCtrl', function($scope) {
	$scope.usuario = {};
	var socket = io();
	var viewPath = 'views/';
	$scope.route =  viewPath+'login.html';
	$scope.go = function(partial) {
		$scope.route = viewPath+partial;
		$scope.$apply();
	}
	socket.on('entrar', function(data) {
		var msg = JSON.parse(data);	
		if (msg.error) {
			$scope.error = msg.error;
			$scope.$apply();
		} else {					
			$scope.go('list.html');
		}
	});
	$scope.hoverUser = function(user) {
		$scope.hoveredUser = user;
	} 
	
	socket.on('disconnect', function() {
		$scope.go('login.html');
	});
	socket.on('lista', function(data) {
		var lista = JSON.parse(data);
		var i = lista.indexOf($scope.usuario.nome);
		lista.splice(i,i+1);
		$scope.list = lista;
		$scope.$apply();

	})
	$scope.login = function() {
		socket.emit('entrar', $scope.usuario.nome);		
	};
});