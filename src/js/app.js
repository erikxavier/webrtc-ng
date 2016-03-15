var socket = io();
var meuCodigo, remoteCodigo;
var pc = new PeerConnection();

var constraints = {audio:false, video:true};
var ice = {"iceServers": [
    {"url": "stun:stun.l.google.com:19302"}
]};

pc.on('ice', function(candidate) {
    console.log(candidate);
    socket.emit('chamada', 
        JSON.stringify(
            {para: remoteCodigo, 
            dados: {de: meuCodigo, msg: candidate}
        }));   
});

pc.on('addStream', function (event) {
    console.log("stream added");
    document.getElementById('localVideo').src = URL.createObjectURL(event.stream);
});

pc.on('endOfCandidates', function () {
    console.log("fim dos candidates");
});

socket.on('chamada', function(data) {
    var chamada = JSON.parse(data);
    if (chamada.dados.msg.type == "offer") {
       remoteCodigo = chamada.dados.de;
       pc.handleOffer(chamada.dados.msg, function(err) {
           if (err) console.log(err)
           else {
               pc.answer(function (err, answer) {
                   if (err) console.log(err)
                   else {
                      socket.emit('chamada', 
                        JSON.stringify(
                            {para: chamada.dados.de, 
                            dados: {de: meuCodigo, msg: answer}
                        }));                            
                   }
               })
           }
       }) 
    } else if (chamada.dados.msg.type == "answer") {
        pc.handleAnswer(chamada.dados.msg);
    } else {        
        pc.processIce(chamada.dados.msg);
    }
});

socket.on('entrar', function(data) {
    meuCodigo = JSON.parse(data).nomeLogado;
    document.getElementById('seuCodigo').innerHTML = "<h1>Seu codigo: "+meuCodigo+"</h1>"; 
    
});

socket.on('lista', function(data) {
    var lista = JSON.parse(data);        
    document.getElementById('lista').innerHTML = lista.filter(function(codigo) {
        return codigo !== meuCodigo;
    });
});

function solicitarSuporte(codigo) {
    remoteCodigo = codigo;
    getScreenId(function(error, sourceId, screen_constraints) {
        if (!error) {
            //navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
            navigator.getUserMedia(screen_constraints, function(stream) {
                pc.addStream(stream);
                    pc.offer(function (err, offer) {
        if (!err) socket.emit('chamada', 
        JSON.stringify(
            {para: codigo, 
             dados: {de: meuCodigo, msg: offer}
            }));
    })   
            }, function(error) {
                return console.error(error);
            });
        }
    });      
}

document.getElementById("solicitar").onclick = function() {
    solicitarSuporte(document.getElementById("codigo").value);
}


    // getScreenMedia(function(err, stream) {
    //     if (err) {
    //         console.log("Não foi possivel obter a tela");
    //         console.log(err.name);
    //     } else {
    //         document.getElementById('localVideo').src = window.URL.createObjectURL(stream);
    //     }
    // });



