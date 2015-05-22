function signaling(server) {
	var users = {};	
	var io = require('socket.io')(server);
	

	
	io.on('connection', function(socket) {
	  
  		function removeUser(user) {
		  console.log(user+' saiu.');
		  delete users[user];
		  io.emit('lista', JSON.stringify(Object.keys(users)));
		}
		
	  socket.on('disconnect', function(data) {
		  removeUser(socket.username);		  
	  });	 	
	  
	  socket.on('sair', function(data) {
		 removeUser(data); 
	  });

	  console.log('usuario conectou');
	  socket.on('entrar', function(msg) {
		  if (users[msg]) {
			  socket.emit('entrar',JSON.stringify({"error":"Usuario "+msg+" já existe!"}));			  			  
			  return;
		  }
	    console.log(msg+' entrou');		
		users[msg] = {"socket": socket};	    
	    socket.emit('entrar' , JSON.stringify({"nomeLogado":msg}));	
		socket.username = msg;	  
	    io.emit('lista', JSON.stringify(Object.keys(users)));
	  });
	  
	  socket.on('chamada', function(msg) {
		  var chamada = JSON.parse(msg);
		  console.log(chamada);
		  if (users[chamada.para]) {
			  users[chamada.para].socket.emit('chamada', msg);
			  console.log("Mensagem enviada de "+chamada.dados.de+" para "+chamada.para);			  
		  } else {
			  chamada.error = "Usuário não encontrado!";
			  socket.emit("chamada", JSON.stringify(chamada));
		  }
	  })
	});
	return io;	
}
module.exports = signaling;