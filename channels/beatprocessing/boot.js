var Pumper = require('pumper'),
    BeatProcessing = require('./index');

// var TRACK = 'https://dl.dropboxusercontent.com/u/42386473/cp/Hotline%20Miami%202%20OST%20-%20Sexualizer%20%28Perturbator%29.mp3';
var TRACK = '../../audio/audio.mp3';

Pumper.start(TRACK, true);
//Pumper.start('mic');
Pumper.globalSpikeTolerance = 12;

BeatProcessing.init();
