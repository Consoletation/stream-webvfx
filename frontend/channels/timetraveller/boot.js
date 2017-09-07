var Pumper = require('pumper');
var TimeTraveller = require('./timetraveller');

var TRACK = '../../audio/audio.mp3';

Pumper.start(TRACK, true);
Pumper.globalSpikeTolerance = 8;

var timeTraveller = new TimeTraveller();
timeTraveller.start();
