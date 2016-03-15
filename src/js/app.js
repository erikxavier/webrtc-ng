var socket = io();

document.getElementById("capturarTela").onclick = function() {
    // getScreenMedia(function(err, stream) {
    //     if (err) {
    //         console.log("Não foi possivel obter a tela");
    //         console.log(err.name);
    //     } else {
    //         document.getElementById('localVideo').src = window.URL.createObjectURL(stream);
    //     }
    // });
    getScreenId(function(error, sourceId, screen_constraints) {
        if (!error) {
            //navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
            navigator.getUserMedia(screen_constraints, function(stream) {
                document.getElementById('localVideo').src = URL.createObjectURL(stream);
            }, function(error) {
                console.error(error);
            });
        }
    })
};

