var router = require('express').Router();
var socket;

var ControleAtendimento = require('./ControleAtendimentos');
// var filaEspera = [];
// var tecnicosDisponiveis = [];


router.post('/solicitar-suporte', function (req, res, next) {
    var chamado = req.body;    
    console.log(chamado);
    //filaEspera.push(JSON.stringify(usuario));
    ControleAtendimento.addChamado(chamado);
    res.send('Solicitação efetuada com sucesso');

    // socket.emit('lista-espera');
    // if (tecnicosDisponiveis.length) {
    //     res.send(`Foram encontrados ${tecnicosDisponiveis.length} técnicos disponíveis.`);
    // } else {
    //     res.send('Nenhum técnico disponível');
    // }
                      
    // client.smembers('disponiveis', (err, rply) => {
    //     if (rply.length > 0) {
    //         res.send(`Foram encontrados ${rply.length} tecnicos disponíveis`)
    //     } else {
    //         res.send('Nenhum técnico disponível');
    //     }
    // })        
});

router.post('/atender-chamado', function(req, res, next) {
    ControleAtendimento.atenderChamado(req.body.idTecnico, req.body.idChamado);
    res.send('Chamado atendido');    
});

router.get('/lista-espera', function(req, res, next) {
    var lista = ControleAtendimento.getListaEspera();
    if (lista) {
        res.send(lista);
    } else {
        res.send('Nenhum chamado pendente');
    }
    // if (filaEspera.length) {
    //     res.send(filaEspera);
    // } else {
    //     res.send('Nenhum chamado pendente');
    // }    
})

// router.post('/login-tecnico', function (req, res, next) {
//     var usuario = req.body;
//     var response = {};
    
//     if (validaUsuario(usuario)) {
//         response.autenticado = true;
//         response.token = 'token';
//         //client.sadd('disponiveis', usuario.nome);
//         tecnicosDisponiveis.push(usuario.nome);
        
//     } else {
//         response.autenticado = false;
//     }    
//     res.send(response);
// })

function getRouter(io) {
    socket = io;
    return router
}
module.exports = getRouter;


function validaUsuario(usuario) {
    return (usuario.nome == 'tecnico' && usuario.senha == '12345');
}