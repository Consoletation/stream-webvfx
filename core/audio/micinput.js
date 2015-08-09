
var MIC, micStream;

var mediaTypes = {
    audio: true,
    video: false
};

function _onSuccess(stream, callback) {
    micStream = stream;
    callback(micStream);
}

function _onError(error) {
    throw 'MicInput: unable to initialize: ' + error;
}

function init(callback) {
    navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    navigator.getMedia(mediaTypes,
        function(stream) {
            _onSuccess(stream, callback);
        },
        _onError);
}

function getStream() {
    if (!micStream) throw ('MicInput: not initialized (call init() first)');
}

var MicInput = {
    init: init,
    getStream: getStream
}

module.exports = MicInput;
