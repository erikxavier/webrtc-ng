var _ = require('lodash');
var events = require('events');
var shortid = require('shortid');

var control = new events.EventEmitter();
var listaChamados = [];
var tecnicos = [];


control.addChamado = function(chamado) {
    if (chamado.socketId) {
        chamado.id = shortid.generate();
        chamado.date = new Date();
        chamado.atendido = false;
        listaChamados.push(chamado);
        control.emit('lista-espera-changed');
        return chamado;
    } 
    return false;
}

control.removeChamadosBySocket = function(socketId) {
    // listaChamados = _.remove(listaChamados, function(chamado) {
    //     return chamado.socketId === socketId;
    // });
    
    listaChamados = listaChamados.filter(function(chamado) {
console.log('chamado.socketId:',chamado.socketId);
    console.log('socketId: ',socketId);        
       return chamado.socketId !== socketId; 
    });
    control.emit('lista-espera-changed');
}

control.addTecnico = function(tecnico) {
    if (tecnico.socketId) {
        tecnico.disponivel = true;
        tecnicos.push(tecnico);
        return tecnico;
    }
    return false;
}

control.atenderChamado = function(idTecnico, idChamado) {
    var chamado = _.find(listaChamados, ['id', idChamado]);
    // var tecnico = _.find(tecnicos, ['socketId', idTecnico]);
    // console.log('chamada atendida', chamado, tecnico);
    if (chamado) {
        chamado.atendido = true;
        chamado.tecnicoResponsável = idTecnico;
        //tecnico.disponivel = false;
        control.emit('lista-espera-changed');
        return chamado.socketId;
    } else {
        return false;
    }
}

control.getListaEspera = function() {
    return _.filter(listaChamados, ['atendido', false]);
}

control.countTecnicosDisponivels = function() {
    return _.filter(tecnicos, ['disponivel', true]).lenght;
}



module.exports = control;