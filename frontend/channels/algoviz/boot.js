var Pumper = require('pumper'),
    AlgoViz = require('./index');

//var TRACK = '../../audio/sexualizer.mp3';
var TRACK = '../../audio/audio.mp3';

Pumper.start(TRACK, true);
Pumper.globalSpikeTolerance = 8;

//Pumper.start('mic');

AlgoViz.init();