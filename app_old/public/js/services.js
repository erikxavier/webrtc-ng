/* global io */
'use strict';
var services = angular.module('Main', []);

services.factory('CallService', ['$q', function($q) {
	
}]);

services.factory('SignalingService', ['$q', function($q) {
//	var socket = io();
//	
//	var service = {};
//				
//	service.onDisconnect = function() {
//		return $q(function(resolve, reject) {
//			socket.on('disconnect', function() {
//				resolve();
//			});
//		});
//	};
//	
//	service.onEntrar = function() {
//		return $q(function(resolve, reject) {
//			socket.on('entrar', function(data) {
//				var msg = JSON.parse(data);
//				if (msg.error) {
//					reject(msg.error);						
//				} else {
//					resolve(msg);
//				}					
//			});
//		});
//	};
//	
//	service.entrar = function(nome) {
//		return $q(function(resolve, reject) {
//			if (socket && socket.connected) {
//				socket.emit('entrar', nome);					
//				resolve();
//			} else {
//				reject("Não foi possível conectar ao servidor");
//			}	
//		});
//	};						
//
//	return service;
//		
//}]);

//Tentativa com callbacks
//services.factory('SignalingService', ['$q', function($q) {	
//		var socket = io();
//		var setSocket = function(sock) {
//			socket = sock;
//		};
//		var onDisconnect = function(cb) {			
//			socket.on('disconnect', function() {
//				cb();				
//			});
//		};
//		
//		var onEntrar = function(cb, err) {			
//			socket.on('entrar', function(data) {
//				var msg = JSON.parse(data);
//				if (msg.error) {
//					err(msg.error);						
//				} else {
//					cb(msg);
//				}					
//			});			
//		};		
//		
//		var entrar = function(nome, cb, err) {			
//			if (socket && socket.connected) {
//				socket.emit('entrar', nome);					
//				cb();
//			} else {
//				err("Não foi possível conectar ao servidor");
//			}	
//		};								
//	
//	return  { 
//			setSocket: setSocket,
//			onEntrar: onEntrar,
//			entrar: entrar,
//			onDisconnect: onDisconnect
//		 };
//		
}]);