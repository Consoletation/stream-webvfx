var Pumper = require('pumper'),
    AlgoViz = require('./channels/beatprocessing');

// var TRACK = 'https://dl.dropboxusercontent.com/u/42386473/cp/Hotline%20Miami%202%20OST%20-%20Sexualizer%20%28Perturbator%29.mp3';
var TRACK = 'audio/audio.mp3';

// Pumper.start('mic');
Pumper.start(TRACK, true);
Pumper.globalSpikeTolerance = 8;


AlgoViz.init();
