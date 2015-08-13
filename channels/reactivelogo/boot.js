var Pumper = require('pumper'),
    ReactiveLogo = require('./index');

//var TRACK = '../../audio/sexualizer.mp3';
var TRACK = '../../audio/audio.mp3';

Pumper.start(TRACK, true);
Pumper.globalSpikeTolerance = 12;


ReactiveLogo.init();