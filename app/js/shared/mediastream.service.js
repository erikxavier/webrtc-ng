module.exports = MediaStreamService;

//var getScreenMedia = require('getscreenmedia')
var getUserMedia = require('getusermedia');
MediaStreamService.$inject = ['$window', '$q'];



function MediaStreamService($window, $q) {
    var getScreenId = $window.getScreenId;

    var audioStream;
    var requestedStreams = [];

    var service = {
        getScreenStream: getScreenStream,
        getAudioStream: getAudioStream,
        flushStreams: flushStreams,
        getEmptyMediaStream: getEmptyMediaStream,
        getRequestedAudioStream: getRequestedAudioStream,
        removeRequestedStream: removeRequestedStream
    }

    return service;

    function getRequestedAudioStream() {
        return audioStream;
    }

    function getRequestedVideoStream() {
       // return getRequestedStream("video");
    }

    function getRequestedScreenStream() {
       // return getRequestedStream("screen");
    }

    function removeRequestedStream(stream) {
        if (requestedStreams.indexOf(stream)) {
            requestedStreams.splice(requestedStreams.indexOf(stream));
            stream.getTracks().forEach(function(track) {track.stop()});
        }
    }

    //Solicita que o usuário autorize e seleciona a tela para ser compartilhada
	function getScreenStream() {
        var defered = $q.defer();
        getScreenId(function(error, sourceId, screen_constraints) {
            if (error) {
                defered.reject(error)
            } else {
                getUserMedia(screen_constraints, function(error, stream) {
                    if (error) {
                        defered.reject(error);
                    } else {
                        console.log(stream);
                        defered.resolve(stream)
                    }
                });
            }
        });

        return defered.promise;
	}	

    function getEmptyMediaStream() {
        var constraints = {audio: false, video:false};
        var defered = $q.defer();
        getUserMedia(constraints, function(error, stream) {
            if (error) {
                defered.reject(error);
            } else {                
                defered.resolve(stream);
            }
        });
        return defered.promise;
    }
    //Solicita que o usuário autorize o compartilhamento do audio do microfone
	function getAudioStream(joinStream) {
		var constraints = {audio: true, video:false};
        var defered = $q.defer();

        getUserMedia(constraints, function(error, stream) {
            if (error) {
                defered.reject(error);
            } else {
                audioStream = stream;
                if (joinStream) {
                    defered.resolve(joinStreams(joinStream, stream));
                } else {
                    defered.resolve(stream);
                }
            }
        });

        return defered.promise;
	}


    //Junta duas streams
    function joinStreams(stream1, stream2) {
        return stream1.addTrack(stream2.getTracks()[0]);
    }    

    function flushStreams() {
        while(requestedStreams.length) {
            requestedStreams
              .pop()
              .getTracks().forEach(function(stream) {stream.stop()});
        }
    }    

    
}