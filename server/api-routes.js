var router = require('express').Router();
var redis = require('redis');



router.post('/solicitar-suporte', function (req, res, next) {
    var client = redis.createClient();               
    client.smembers('disponíveis', (err, rply) => {
        if (rply.length > 0) {
            res.send(`Foram encontrados ${rply.length} tecnicos disponíveis`)
        } else {
            res.send('Nenhum técnico disponível');
        }
    })        
});

module.exports = router;