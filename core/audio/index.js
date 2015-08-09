
var Analyzer = require('./analyzer');
var MicInput = require('./micinput');

function init() {

    Analyzer.init();
    MicInput.init(function(stream) {
        Analyzer.setStreamAsSource(stream);
        console.info('Audio: ready');
    });
}

var Audio = {
    init: init,
    Analyzer: Analyzer,
    MicInput: MicInput
};

module.exports = Audio;