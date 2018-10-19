var Pumper = require('pumper'),
    AlgoViz = require('./index');

//var TRACK = '../../audio/sexualizer.mp3';
var TRACK = '../../audio/spooky.mp3';

Pumper.start(TRACK, true);
Pumper.globalSpikeTolerance = 5;

//Pumper.start('mic');

AlgoViz.init();
