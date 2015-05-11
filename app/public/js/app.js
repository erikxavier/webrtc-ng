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
	} else {					
		$scope.go('list.html');
	}
	});
	$scope.login = function() {
		socket.emit('entrar', $scope.usuario.nome);		
	};
});