var router = require('express').Router();
var db = require('./db.config').getDb();
var socket;
// var redis = require('redis');
// var client = redis.createClient(); 
var filaEspera = [];
var tecnicosDisponiveis = [];


router.post('/solicitar-suporte', function (req, res, next) {
    var usuario = req.body;    
    console.log(usuario);
    //client.sadd('lista-espera', JSON.stringify(usuario));
    filaEspera.push(JSON.stringify(usuario));
    socket.emit('lista-espera');
    if (tecnicosDisponiveis.length) {
        res.send(`Foram encontrados ${tecnicosDisponiveis.length} técnicos disponíveis.`);
    } else {
        res.send('Nenhum técnico disponível');
    }
                      
    // client.smembers('disponiveis', (err, rply) => {
    //     if (rply.length > 0) {
    //         res.send(`Foram encontrados ${rply.length} tecnicos disponíveis`)
    //     } else {
    //         res.send('Nenhum técnico disponível');
    //     }
    // })        
});


router.get('/users', function(req, res) {
    if (db.get('users').value()) {
        res.json(db.get('users').value())
    } else {
        res.send({error: 'no results'});
    }
})
router.get('/lista-espera', function(req, res, next) {
    // client.smembers('lista-espera', (err, reply) => {
    //     if (reply.length > 0) {
    //         console.log(reply);
    //         res.send(reply)
    //     } else {
    //         res.send('Nenhum chamado pendente');
    //     }
    // })
    if (filaEspera.length) {
        res.send(filaEspera);
    } else {
        res.send('Nenhum chamado pendente');
    }    
})

router.post('/login-tecnico', function (req, res, next) {
    var usuario = req.body;
    var response = {};
    
    if (validaUsuario(usuario)) {
        response.autenticado = true;
        response.token = 'token';
        //client.sadd('disponiveis', usuario.nome);
        tecnicosDisponiveis.push(usuario.nome);
        
    } else {
        response.autenticado = false;
    }    
    res.send(response);
})

function getRouter(io) {
    socket = io;
    return router
}
module.exports = getRouter;


function validaUsuario(usuario) {
    return (usuario.nome == 'tecnico' && usuario.senha == '12345');
}