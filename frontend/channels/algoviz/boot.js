var Pumper = require('pumper'),
    AlgoViz = require('./index');

//var TRACK = '../../audio/sexualizer.mp3';
var TRACK = '../../audio/audio.mp3';

//Pumper.start(TRACK, true);

Pumper.start('mic');
Pumper.globalSpikeTolerance = 8;

AlgoViz.init();
