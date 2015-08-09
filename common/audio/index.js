
var Analyzer = require('./analyzer'),
    MicInput = require('./micinput');

function init() {

    Analyzer.init();
    MicInput.init(function(stream) {
        Analyzer.setStreamAsSource(stream);
    });
}

var Audio = {
    init: init,
    Analyzer: Analyzer,
    MicInput: MicInput
};

module.exports = Audio;