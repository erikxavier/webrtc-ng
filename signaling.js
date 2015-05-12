function signaling(server) {
	var users = {};	
	var io = require('socket.io')(server);
	
	io.on('connection', function(socket) {
	  
	  socket.on('disconnect', function(data) {
		  console.log(socket.username+' saiu.');
		  delete users[socket.username];
		  io.emit('lista', JSON.stringify(Object.keys(users)));
	  });

	  console.log('usuario conectou');
	  socket.on('entrar', function(msg) {
		  if (users[msg]) {
			  socket.emit('entrar',JSON.stringify({"error":"Usuario "+msg+" já existe!"}));
			  socket.disconnect();			  
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