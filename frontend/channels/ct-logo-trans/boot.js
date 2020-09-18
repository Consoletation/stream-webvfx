var Pumper = require('pumper'),
    BeatProcessing = require('./index');

var TRACK = '../../audio/home.mp3';

//Pumper.start(TRACK, 1160, 14000, 13);
Pumper.start('mic', 1160, 14000, 13);
//Pumper.start('mic', 60, 200);
Pumper.globalSpikeTolerance = 14;

WebFont.load({
    typekit: {id: 'oiz4knz'},
    active: BeatProcessing.init
});
